<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
             $table->foreignId('pipeline_column_id')->nullable()->constrained('pipeline_columns')->onDelete('set null');
            
            // Keep the stage column for backward compatibility
            if (!Schema::hasColumn('leads', 'stage')) {
                $table->integer('stage')->default(1)->comment('1 = New, 2 = Contacted, 3 = Qualified, 4 = Won, 5 = Lost');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropForeign(['pipeline_column_id']);
            $table->dropColumn('pipeline_column_id');
        });
    }
};
