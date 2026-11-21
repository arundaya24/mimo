<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cat_personalities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description');
            $table->float('hunger_decay_multiplier')->default(1.0);
            $table->float('energy_decay_multiplier')->default(1.0);
            $table->float('happiness_decay_multiplier')->default(1.0);
            $table->float('trust_gain_multiplier')->default(1.0);
            $table->float('fear_sensitivity')->default(1.0);
            $table->float('affection_gain_multiplier')->default(1.0);
            $table->string('preferred_activity')->default('pet');
            $table->json('idle_dialogues')->nullable();
            $table->json('reaction_dialogues')->nullable();
            $table->timestamps();
        });

        Schema::create('cats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('gender')->default('female');
            $table->foreignId('personality_id')->constrained('cat_personalities')->cascadeOnDelete();
            $table->boolean('is_sleeping')->default(false);
            $table->string('current_room')->default('living_room');
            $table->timestamp('last_interaction_at')->nullable();
            $table->timestamp('last_fed_at')->nullable();
            $table->timestamp('last_slept_at')->nullable();
            $table->timestamp('last_calculated_at')->nullable();
            $table->timestamps();
        });

        Schema::create('cat_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cat_id')->constrained()->cascadeOnDelete();
            $table->float('hunger')->default(20); // 0 = full, 100 = starving
            $table->float('happiness')->default(80); // 0-100
            $table->float('energy')->default(85); // 0-100
            $table->float('trust')->default(50); // 0-100
            $table->float('fear')->default(10); // 0-100
            $table->float('affection')->default(60); // 0-100
            $table->timestamps();
        });

        Schema::create('cat_customizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cat_id')->constrained()->cascadeOnDelete();
            $table->string('fur_color')->default('#E69A57');
            $table->string('fur_secondary_color')->default('#FFF8F0');
            $table->string('pattern')->default('stripes'); // solid, stripes, tuxedo, calico, socks
            $table->string('pattern_color')->default('#A0522D');
            $table->string('eye_color')->default('#48BB78'); // green, gold, blue, amber, violet
            $table->string('ear_style')->default('pointy'); // pointy, folded, round
            $table->string('collar_color')->default('#D97746'); // red, blue, teal, orange, none
            $table->boolean('bell')->default(true);
            $table->string('accessory')->default('none'); // none, bow, flower, scarf, glasses
            $table->timestamps();
        });

        Schema::create('cat_interactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cat_id')->constrained()->cascadeOnDelete();
            $table->string('action_type');
            $table->json('stat_changes');
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('item_code');
            $table->string('name');
            $table->string('category'); // food, toy, comfort, care
            $table->integer('quantity')->default(1);
            $table->string('icon')->default('package');
            $table->text('description')->nullable();
            $table->string('effect_summary')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('cat_interactions');
        Schema::dropIfExists('cat_customizations');
        Schema::dropIfExists('cat_stats');
        Schema::dropIfExists('cats');
        Schema::dropIfExists('cat_personalities');
    }
};
