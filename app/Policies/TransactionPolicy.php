<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Auth\Access\Response;

class TransactionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view_transaction');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Transaction $transaction): bool
    {
        // Users can view their own transactions
        if ($user->id === $transaction->user_id) {
            return true;
        }

        // Users in the same company can view transactions
        if ($user->company_id === $transaction->company_id) {
            return $user->hasPermissionTo('view_transaction');
        }

        return $user->hasPermissionTo('view_transaction');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_transaction');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Transaction $transaction): bool
    {
        // Users can update their own transactions
        if ($user->id === $transaction->user_id) {
            return $user->hasPermissionTo('update_transaction');
        }

        // Managers and above can update any transaction in their company
        if ($user->company_id === $transaction->company_id && $user->hasPermissionTo('update_transaction')) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Transaction $transaction): bool
    {
        // Users can delete their own transactions (if they have permission)
        if ($user->id === $transaction->user_id && $user->hasPermissionTo('delete_transaction')) {
            return true;
        }

        // Managers and above can delete any transaction in their company
        if ($user->company_id === $transaction->company_id && $user->hasPermissionTo('delete_transaction')) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can approve the transaction.
     */
    public function approve(User $user, Transaction $transaction): bool
    {
        // Cannot approve if already approved
        if ($transaction->approved_at) {
            return false;
        }

        // Cannot approve your own transaction
        if ($user->id === $transaction->user_id) {
            return false;
        }

        // Must be in the same company and have approval permission
        return $user->company_id === $transaction->company_id && 
               $user->hasPermissionTo('approve_transaction');
    }

    /**
     * Determine whether the user can reject the transaction.
     */
    public function reject(User $user, Transaction $transaction): bool
    {
        // Cannot reject if already processed
        if ($transaction->approved_at || $transaction->rejected_at) {
            return false;
        }

        // Cannot reject your own transaction
        if ($user->id === $transaction->user_id) {
            return false;
        }

        // Must be in the same company and have rejection permission
        return $user->company_id === $transaction->company_id && 
               $user->hasPermissionTo('reject_transaction');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Transaction $transaction): bool
    {
        return $user->hasPermissionTo('delete_transaction');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Transaction $transaction): bool
    {
        return $user->hasRole('admin');
    }
}
