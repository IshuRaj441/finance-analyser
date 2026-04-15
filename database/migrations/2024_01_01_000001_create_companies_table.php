<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('domain')->nullable();
            $table->enum('plan', ['free', 'basic', 'premium', 'enterprise'])->default('free');
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->json('settings')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('subscription_ends_at')->nullable();
            $table->string('stripe_customer_id')->nullable();
            $table->string('paypal_subscription_id')->nullable();
            $table->integer('max_users')->default(5);
            $table->integer('max_storage_mb')->default(1000);
            $table->boolean('can_export_reports')->default(true);
            $table->boolean('can_use_ai_features')->default(false);
            $table->boolean('can_integrate_apis')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
