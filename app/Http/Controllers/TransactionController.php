<?php

namespace App\Http\Controllers;

use App\Services\TransactionService;
use App\Http\Requests\TransactionRequest;
use App\Http\Requests\TransactionFilterRequest;
use App\Http\Requests\TransactionApprovalRequest;
use App\Http\Requests\TransactionImportRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TransactionController extends Controller
{
    use ApiResponse;

    protected $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    public function index(TransactionFilterRequest $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $filters = $request->validated();
        $perPage = $request->get('per_page', 15);

        $transactions = $this->transactionService->getTransactions($companyId, $filters, $perPage);

        return $this->paginated($transactions, 'Transactions retrieved successfully');
    }

    public function store(TransactionRequest $request): JsonResponse
    {
        $transaction = $this->transactionService->createTransaction(
            $request->validated(),
            $request->user()->id
        );

        return $this->success($transaction->load('user', 'category'), 'Transaction created successfully', 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $transaction = $this->transactionService->getTransaction($id, $companyId);

        return $this->success($transaction->load(['user', 'category', 'approvedBy']));
    }

    public function update(TransactionRequest $request, int $id): JsonResponse
    {
        $transaction = $this->transactionService->updateTransaction(
            $id,
            $request->validated(),
            $request->user()->id
        );

        return $this->success($transaction->load('user', 'category'), 'Transaction updated successfully');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->transactionService->deleteTransaction($id, $request->user()->id);

        return $this->success(null, 'Transaction deleted successfully');
    }

    public function approve(TransactionApprovalRequest $request, int $id): JsonResponse
    {
        $result = $this->transactionService->approveTransaction($id, $request->user()->id);

        if ($result) {
            return $this->success(null, 'Transaction approved successfully');
        }

        return $this->error('Failed to approve transaction', 500);
    }

    public function reject(TransactionApprovalRequest $request, int $id): JsonResponse
    {
        $reason = $request->get('reason', '');
        $result = $this->transactionService->rejectTransaction($id, $request->user()->id, $reason);

        if ($result) {
            return $this->success(null, 'Transaction rejected successfully');
        }

        return $this->error('Failed to reject transaction', 500);
    }

    public function summary(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $period = $request->get('period', 'monthly');

        $summary = $this->transactionService->getTransactionSummary($companyId, $period);

        return $this->success($summary, 'Transaction summary retrieved successfully');
    }

    public function export(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $filters = $request->only(['type', 'status', 'category_id', 'date_from', 'date_to']);
        $format = $request->get('format', 'csv');

        $filename = $this->transactionService->exportTransactions($companyId, $filters, $format);

        return $this->success(['filename' => $filename], 'Export completed successfully');
    }

    public function import(TransactionImportRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $companyId = $request->user()->company_id;
        $userId = $request->user()->id;

        // Parse file based on type
        $fileData = $this->parseImportFile($file);

        $results = $this->transactionService->importTransactions($companyId, $fileData, $userId);

        return $this->success($results, 'Import completed');
    }

    public function pending(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $transactions = $this->transactionService->getPendingTransactions($companyId);

        return $this->success($transactions, 'Pending transactions retrieved successfully');
    }

    public function myTransactions(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $filters = $request->only(['type', 'status', 'category_id', 'date_from', 'date_to']);

        $transactions = $this->transactionService->getTransactionsByUser($userId, $filters);

        return $this->success($transactions, 'User transactions retrieved successfully');
    }

    public function duplicates(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $threshold = $request->get('threshold', 0.01);

        $duplicates = $this->transactionService->getDuplicateTransactions($companyId, $threshold);

        return $this->success($duplicates, 'Duplicate transactions retrieved successfully');
    }

    public function bulkApprove(Request $request): JsonResponse
    {
        $request->validate([
            'transaction_ids' => 'required|array',
            'transaction_ids.*' => 'exists:transactions,id',
        ]);

        $transactionIds = $request->get('transaction_ids');
        $userId = $request->user()->id;
        $results = ['approved' => 0, 'failed' => 0];

        foreach ($transactionIds as $id) {
            try {
                $this->transactionService->approveTransaction($id, $userId);
                $results['approved']++;
            } catch (\Exception $e) {
                $results['failed']++;
            }
        }

        return $this->success($results, 'Bulk approval completed');
    }

    public function bulkReject(Request $request): JsonResponse
    {
        $request->validate([
            'transaction_ids' => 'required|array',
            'transaction_ids.*' => 'exists:transactions,id',
            'reason' => 'nullable|string|max:500',
        ]);

        $transactionIds = $request->get('transaction_ids');
        $userId = $request->user()->id;
        $reason = $request->get('reason', '');
        $results = ['rejected' => 0, 'failed' => 0];

        foreach ($transactionIds as $id) {
            try {
                $this->transactionService->rejectTransaction($id, $userId, $reason);
                $results['rejected']++;
            } catch (\Exception $e) {
                $results['failed']++;
            }
        }

        return $this->success($results, 'Bulk rejection completed');
    }

    private function parseImportFile($file): array
    {
        $extension = $file->getClientOriginalExtension();
        $data = [];

        switch ($extension) {
            case 'csv':
                $data = $this->parseCsvFile($file);
                break;
            case 'xlsx':
            case 'xls':
                $data = $this->parseExcelFile($file);
                break;
            default:
                throw new \Exception('Unsupported file format');
        }

        return $data;
    }

    private function parseCsvFile($file): array
    {
        $data = [];
        $handle = fopen($file->getPathname(), 'r');

        if ($handle !== false) {
            $headers = fgetcsv($handle);
            $headers = array_map('strtolower', $headers);
            $headers = array_map('trim', $headers);

            while (($row = fgetcsv($handle)) !== false) {
                if (empty(array_filter($row))) {
                    continue;
                }

                $data[] = array_combine($headers, $row);
            }

            fclose($handle);
        }

        return $data;
    }

    private function parseExcelFile($file): array
    {
        // Excel parsing would go here using maatwebsite/excel
        // For now, return empty array
        return [];
    }
}
