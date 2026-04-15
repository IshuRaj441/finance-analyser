<?php

namespace App\Repositories;

use App\Models\Transaction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;

class TransactionRepository extends BaseRepository
{
    public function __construct(Transaction $model)
    {
        parent::__construct($model);
    }

    public function getByCompany(int $companyId, array $filters = []): Collection
    {
        $query = $this->model->where('company_id', $companyId);

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('transaction_date', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('transaction_date', '<=', $filters['date_to']);
        }

        if (isset($filters['min_amount'])) {
            $query->where('amount', '>=', $filters['min_amount']);
        }

        if (isset($filters['max_amount'])) {
            $query->where('amount', '<=', $filters['max_amount']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('reference', 'like', "%{$search}%");
            });
        }

        return $query->with(['user', 'category', 'approvedBy'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function paginateByCompany(int $companyId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->where('company_id', $companyId);

        $this->applyFilters($query, $filters);

        return $query->with(['user', 'category', 'approvedBy'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getPendingTransactions(int $companyId): Collection
    {
        return $this->model->where('company_id', $companyId)
            ->where('status', 'pending')
            ->with(['user', 'category'])
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function getTransactionsByUser(int $userId, array $filters = []): Collection
    {
        $query = $this->model->where('user_id', $userId);

        $this->applyFilters($query, $filters);

        return $query->with(['category', 'approvedBy'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getMonthlySummary(int $companyId, int $year, int $month): array
    {
        $transactions = $this->model->where('company_id', $companyId)
            ->whereYear('transaction_date', $year)
            ->whereMonth('transaction_date', $month)
            ->where('status', 'approved')
            ->get();

        $income = $transactions->where('type', 'income')->sum('amount');
        $expenses = $transactions->where('type', 'expense')->sum('amount');
        $net = $income - $expenses;

        return [
            'income' => $income,
            'expenses' => $expenses,
            'net' => $net,
            'transaction_count' => $transactions->count(),
            'average_transaction' => $transactions->count() > 0 ? $transactions->avg('amount') : 0,
        ];
    }

    public function getYearlySummary(int $companyId, int $year): array
    {
        $transactions = $this->model->where('company_id', $companyId)
            ->whereYear('transaction_date', $year)
            ->where('status', 'approved')
            ->get();

        $monthlyData = [];
        for ($month = 1; $month <= 12; $month++) {
            $monthTransactions = $transactions->filter(function ($transaction) use ($month) {
                return $transaction->transaction_date->month == $month;
            });

            $monthlyData[$month] = [
                'income' => $monthTransactions->where('type', 'income')->sum('amount'),
                'expenses' => $monthTransactions->where('type', 'expense')->sum('amount'),
                'transactions' => $monthTransactions->count(),
            ];
        }

        $totalIncome = $transactions->where('type', 'income')->sum('amount');
        $totalExpenses = $transactions->where('type', 'expense')->sum('amount');
        $totalNet = $totalIncome - $totalExpenses;

        return [
            'year' => $year,
            'total_income' => $totalIncome,
            'total_expenses' => $totalExpenses,
            'total_net' => $totalNet,
            'total_transactions' => $transactions->count(),
            'monthly_data' => $monthlyData,
        ];
    }

    public function getTopCategories(int $companyId, string $type = 'expense', int $limit = 10): Collection
    {
        return $this->model->where('company_id', $companyId)
            ->where('type', $type)
            ->where('status', 'approved')
            ->with('category')
            ->selectRaw('category_id, SUM(amount) as total_amount, COUNT(*) as transaction_count')
            ->groupBy('category_id')
            ->orderBy('total_amount', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getRecurringTransactions(int $companyId): Collection
    {
        return $this->model->where('company_id', $companyId)
            ->where('is_recurring', true)
            ->where('status', 'approved')
            ->with(['user', 'category'])
            ->orderBy('next_due_date', 'asc')
            ->get();
    }

    public function approveTransaction(int $transactionId, int $approvedBy): bool
    {
        return $this->model->where('id', $transactionId)
            ->update([
                'status' => 'approved',
                'approved_by' => $approvedBy,
                'approved_at' => now(),
            ]);
    }

    public function rejectTransaction(int $transactionId, int $approvedBy): bool
    {
        return $this->model->where('id', $transactionId)
            ->update([
                'status' => 'rejected',
                'approved_by' => $approvedBy,
                'approved_at' => now(),
            ]);
    }

    public function getTransactionsForReport(int $companyId, array $filters): Collection
    {
        $query = $this->model->where('company_id', $companyId)
            ->where('status', 'approved');

        $this->applyFilters($query, $filters);

        return $query->with(['user', 'category'])
            ->orderBy('transaction_date', 'asc')
            ->get();
    }

    public function getDuplicateTransactions(int $companyId, float $threshold = 0.01): Collection
    {
        return $this->model->where('company_id', $companyId)
            ->where('status', 'approved')
            ->whereRaw('amount IN (
                SELECT amount 
                FROM transactions 
                WHERE company_id = ? 
                AND status = "approved"
                GROUP BY amount 
                HAVING COUNT(*) > 1
            )', [$companyId])
            ->with(['user', 'category'])
            ->get()
            ->groupBy(function ($transaction) {
                return $transaction->amount . '_' . $transaction->transaction_date->format('Y-m-d');
            })
            ->filter(function ($group) {
                return $group->count() > 1;
            })
            ->flatten();
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('transaction_date', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('transaction_date', '<=', $filters['date_to']);
        }

        if (isset($filters['min_amount'])) {
            $query->where('amount', '>=', $filters['min_amount']);
        }

        if (isset($filters['max_amount'])) {
            $query->where('amount', '<=', $filters['max_amount']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('reference', 'like', "%{$search}%");
            });
        }
    }
}
