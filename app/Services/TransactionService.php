<?php

namespace App\Services;

use App\Repositories\TransactionRepository;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\FraudDetectionService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class TransactionService
{
    protected $transactionRepository;
    protected $notificationService;
    protected $fraudDetectionService;

    public function __construct(
        TransactionRepository $transactionRepository,
        NotificationService $notificationService,
        FraudDetectionService $fraudDetectionService
    ) {
        $this->transactionRepository = $transactionRepository;
        $this->notificationService = $notificationService;
        $this->fraudDetectionService = $fraudDetectionService;
    }

    public function createTransaction(array $data, int $userId): Transaction
    {
        DB::beginTransaction();
        try {
            $transactionData = array_merge($data, [
                'user_id' => $userId,
                'reference' => $this->generateReference(),
                'status' => $this->getDefaultStatus($userId),
            ]);

            $transaction = $this->transactionRepository->create($transactionData);

            // Check for fraud
            $fraudAlert = $this->fraudDetectionService->analyzeTransaction($transaction);
            if ($fraudAlert) {
                $this->notificationService->sendToRole(
                    'Manager',
                    $transaction->company_id,
                    'suspicious_activity',
                    [
                        'activity_type' => 'Suspicious Transaction',
                        'description' => $fraudAlert->description,
                        'severity' => $fraudAlert->severity,
                        'action_url' => route('transactions.show', $transaction->id),
                    ],
                    ['database', 'email']
                );
            }

            // Check budget limits
            $this->checkBudgetLimits($transaction);

            // Send notifications if pending approval
            if ($transaction->status === 'pending') {
                $this->notificationService->sendToRole(
                    'Manager',
                    $transaction->company_id,
                    'transaction_pending',
                    [
                        'transaction_title' => $transaction->title,
                        'amount' => $transaction->amount,
                        'user_name' => $transaction->user->full_name,
                        'action_url' => route('transactions.show', $transaction->id),
                    ],
                    ['database', 'email']
                );
            }

            DB::commit();
            return $transaction;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateTransaction(int $transactionId, array $data, int $userId): Transaction
    {
        $transaction = $this->transactionRepository->findOrFail($transactionId);

        // Check if user can update this transaction
        if ($transaction->user_id !== $userId && !$transaction->user->hasPermissionTo('update_transaction')) {
            throw new \Exception('Unauthorized to update this transaction');
        }

        // Prevent updating approved transactions unless user has permission
        if ($transaction->status === 'approved' && !$transaction->user->hasPermissionTo('update_approved_transaction')) {
            throw new \Exception('Cannot update approved transaction');
        }

        return $this->transactionRepository->update($transactionId, $data);
    }

    public function approveTransaction(int $transactionId, int $approvedBy): bool
    {
        $transaction = $this->transactionRepository->findOrFail($transactionId);

        if ($transaction->status !== 'pending') {
            throw new \Exception('Transaction is not pending approval');
        }

        $result = $this->transactionRepository->approveTransaction($transactionId, $approvedBy);

        if ($result) {
            // Send notification to transaction creator
            $this->notificationService->send($transaction->user, 'transaction_approved', [
                'transaction_title' => $transaction->title,
                'amount' => $transaction->amount,
                'category' => $transaction->category->name,
                'action_url' => route('transactions.show', $transaction->id),
            ]);

            // Check budget limits after approval
            $this->checkBudgetLimits($transaction);
        }

        return $result;
    }

    public function rejectTransaction(int $transactionId, int $approvedBy, string $reason = ''): bool
    {
        $transaction = $this->transactionRepository->findOrFail($transactionId);

        if ($transaction->status !== 'pending') {
            throw new \Exception('Transaction is not pending approval');
        }

        $result = $this->transactionRepository->rejectTransaction($transactionId, $approvedBy);

        if ($result) {
            // Send notification to transaction creator
            $this->notificationService->send($transaction->user, 'transaction_rejected', [
                'transaction_title' => $transaction->title,
                'amount' => $transaction->amount,
                'reason' => $reason,
                'action_url' => route('transactions.show', $transaction->id),
            ]);
        }

        return $result;
    }

    public function deleteTransaction(int $transactionId, int $userId): bool
    {
        $transaction = $this->transactionRepository->findOrFail($transactionId);

        // Check if user can delete this transaction
        if ($transaction->user_id !== $userId && !$transaction->user->hasPermissionTo('delete_transaction')) {
            throw new \Exception('Unauthorized to delete this transaction');
        }

        // Prevent deleting approved transactions unless user has permission
        if ($transaction->status === 'approved' && !$transaction->user->hasPermissionTo('delete_approved_transaction')) {
            throw new \Exception('Cannot delete approved transaction');
        }

        return $this->transactionRepository->delete($transactionId);
    }

    public function getTransactions(int $companyId, array $filters = [], int $perPage = 15)
    {
        return $this->transactionRepository->paginateByCompany($companyId, $filters, $perPage);
    }

    public function getTransactionSummary(int $companyId, string $period = 'monthly'): array
    {
        $now = Carbon::now();

        switch ($period) {
            case 'daily':
                return $this->getDailySummary($companyId, $now);
            case 'weekly':
                return $this->getWeeklySummary($companyId, $now);
            case 'monthly':
                return $this->getMonthlySummary($companyId, $now);
            case 'yearly':
                return $this->getYearlySummary($companyId, $now);
            default:
                return $this->getMonthlySummary($companyId, $now);
        }
    }

    public function exportTransactions(int $companyId, array $filters = [], string $format = 'csv'): string
    {
        $transactions = $this->transactionRepository->getTransactionsForReport($companyId, $filters);

        $filename = "transactions_" . date('Y-m-d_H-i-s') . ".{$format}";
        $path = "exports/{$filename}";

        // Export logic would go here
        // For now, just return the filename
        return $filename;
    }

    public function importTransactions(int $companyId, array $fileData, int $userId): array
    {
        $results = [
            'imported' => 0,
            'failed' => 0,
            'errors' => [],
        ];

        foreach ($fileData as $row) {
            try {
                $this->processImportRow($row, $companyId, $userId);
                $results['imported']++;
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = "Row " . ($results['imported'] + $results['failed']) . ": " . $e->getMessage();
            }
        }

        return $results;
    }

    private function generateReference(): string
    {
        do {
            $reference = 'TXN-' . strtoupper(Str::random(8)) . '-' . date('Ymd');
        } while (Transaction::where('reference', $reference)->exists());

        return $reference;
    }

    private function getDefaultStatus(int $userId): string
    {
        $user = User::find($userId);
        
        // Admin and Manager roles don't need approval
        if ($user->hasAnyRole(['Admin', 'Manager'])) {
            return 'approved';
        }

        // Check company settings for auto-approval
        $company = $user->company;
        $settings = $company->settings ?? [];

        if (isset($settings['auto_approval']) && $settings['auto_approval'] === true) {
            return 'approved';
        }

        return 'pending';
    }

    private function checkBudgetLimits(Transaction $transaction): void
    {
        if ($transaction->type !== 'expense' || $transaction->status !== 'approved') {
            return;
        }

        $budgets = $transaction->company->budgets()
            ->where('status', 'active')
            ->where('start_date', '<=', $transaction->transaction_date)
            ->where('end_date', '>=', $transaction->transaction_date)
            ->where(function ($query) use ($transaction) {
                $query->whereNull('category_id')
                    ->orWhere('category_id', $transaction->category_id);
            })
            ->get();

        foreach ($budgets as $budget) {
            $budget->spent += $transaction->amount;
            $budget->save();

            $percentage = ($budget->spent / $budget->amount) * 100;

            // Check alert thresholds
            $alertThresholds = $budget->alert_thresholds ?? [];
            $thresholds = [50, 75, 90, 100];

            foreach ($thresholds as $threshold) {
                if ($percentage >= $threshold && !isset($alertThresholds[$threshold])) {
                    $alertThresholds[$threshold] = true;
                    $budget->alert_thresholds = $alertThresholds;
                    $budget->save();

                    $this->notificationService->send($budget->user, 'budget_exceeded', [
                        'budget_name' => $budget->name,
                        'budget_amount' => $budget->amount,
                        'spent_amount' => $budget->spent,
                        'percentage' => $percentage,
                        'action_url' => route('budgets.show', $budget->id),
                    ]);
                }
            }
        }
    }

    private function getDailySummary(int $companyId, Carbon $date): array
    {
        $transactions = $this->transactionRepository->getByCompany($companyId, [
            'date_from' => $date->format('Y-m-d'),
            'date_to' => $date->format('Y-m-d'),
            'status' => 'approved',
        ]);

        $income = $transactions->where('type', 'income')->sum('amount');
        $expenses = $transactions->where('type', 'expense')->sum('amount');

        return [
            'date' => $date->format('Y-m-d'),
            'income' => $income,
            'expenses' => $expenses,
            'net' => $income - $expenses,
            'transaction_count' => $transactions->count(),
        ];
    }

    private function getWeeklySummary(int $companyId, Carbon $date): array
    {
        $startOfWeek = $date->startOfWeek()->format('Y-m-d');
        $endOfWeek = $date->endOfWeek()->format('Y-m-d');

        $transactions = $this->transactionRepository->getByCompany($companyId, [
            'date_from' => $startOfWeek,
            'date_to' => $endOfWeek,
            'status' => 'approved',
        ]);

        $income = $transactions->where('type', 'income')->sum('amount');
        $expenses = $transactions->where('type', 'expense')->sum('amount');

        return [
            'week_start' => $startOfWeek,
            'week_end' => $endOfWeek,
            'income' => $income,
            'expenses' => $expenses,
            'net' => $income - $expenses,
            'transaction_count' => $transactions->count(),
        ];
    }

    private function getMonthlySummary(int $companyId, Carbon $date): array
    {
        return $this->transactionRepository->getMonthlySummary($companyId, $date->year, $date->month);
    }

    private function getYearlySummary(int $companyId, Carbon $date): array
    {
        return $this->transactionRepository->getYearlySummary($companyId, $date->year);
    }

    private function processImportRow(array $row, int $companyId, int $userId): void
    {
        // Validate required fields
        if (!isset($row['title']) || !isset($row['amount']) || !isset($row['date'])) {
            throw new \Exception('Missing required fields: title, amount, or date');
        }

        // Find or create category
        $categoryName = $row['category'] ?? 'Uncategorized';
        $category = Category::where('company_id', $companyId)
            ->where('name', $categoryName)
            ->first();

        if (!$category) {
            $category = Category::create([
                'company_id' => $companyId,
                'name' => $categoryName,
                'slug' => Str::slug($categoryName),
                'type' => $row['type'] ?? 'expense',
                'color' => '#6B7280',
            ]);
        }

        $transactionData = [
            'company_id' => $companyId,
            'category_id' => $category->id,
            'title' => $row['title'],
            'description' => $row['description'] ?? null,
            'amount' => floatval($row['amount']),
            'type' => $row['type'] ?? 'expense',
            'transaction_date' => Carbon::parse($row['date']),
            'payment_method' => $row['payment_method'] ?? null,
            'bank_account' => $row['bank_account'] ?? null,
        ];

        $this->createTransaction($transactionData, $userId);
    }
}
