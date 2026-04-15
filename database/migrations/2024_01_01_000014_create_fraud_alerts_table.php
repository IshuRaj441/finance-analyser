<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fraud_alerts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('transaction_id')->nullable();
            $table->enum('type', ['large_amount', 'multiple_failed_logins', 'new_location', 'suspicious_pattern', 'duplicate_expense']);
            $table->enum('severity', ['low', 'medium', 'high', 'critical']);
            $table->text('description');
            $table->json('details')->nullable();
            $table->enum('status', ['open', 'investigating', 'resolved', 'false_positive'])->default('open');
            $table->unsignedBigInteger('resolved_by')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->timestamps();

            $table->foreign('company_id')
                ->references('id')
                ->on('companies')
                ->onDelete('cascade');

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');

            $table->foreign('transaction_id')
                ->references('id')
                ->on('transactions')
                ->onDelete('set null');

            $table->foreign('resolved_by')
                ->references('id')
                ->on('users')
                ->onDelete('set null');

            $table->index(['company_id', 'status']);
            $table->index(['severity']);
            $table->index(['type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fraud_alerts');
    }
};
