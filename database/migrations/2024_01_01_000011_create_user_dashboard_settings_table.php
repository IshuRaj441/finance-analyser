<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_dashboard_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('theme')->default('light');
            $table->json('widgets')->nullable();
            $table->json('layout')->nullable();
            $table->json('preferences')->nullable();
            $table->timestamps();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_dashboard_settings');
    }
};
