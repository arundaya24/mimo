<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cat_stats', function (Blueprint $table) {
            $table->float('comfort')->default(80.0)->after('affection');
            $table->float('cleanliness')->default(90.0)->after('comfort');
        });

        Schema::table('cats', function (Blueprint $table) {
            $table->string('favorite_food')->default('canned_tuna')->after('current_room');
            $table->integer('boredom_counter')->default(0)->after('favorite_food');
            $table->string('last_activity_type')->nullable()->after('boredom_counter');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->json('settings')->nullable()->after('password');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('settings');
        });

        Schema::table('cats', function (Blueprint $table) {
            $table->dropColumn(['favorite_food', 'boredom_counter', 'last_activity_type']);
        });

        Schema::table('cat_stats', function (Blueprint $table) {
            $table->dropColumn(['comfort', 'cleanliness']);
        });
    }
};
