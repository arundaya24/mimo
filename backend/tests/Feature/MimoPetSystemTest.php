<?php

namespace Tests\Feature;

use App\Models\Cat;
use App\Models\CatPersonality;
use App\Models\InventoryItem;
use App\Models\User;
use App\Services\CatEmotionalService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MimoPetSystemTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\CatPersonalitySeeder::class);
    }

    public function test_personalities_are_seeded_correctly(): void
    {
        $response = $this->getJson('/api/personalities');
        $response->assertStatus(200);
        $response->assertJsonCount(5, 'personalities');
    }

    public function test_user_registration_and_login(): void
    {
        $regResponse = $this->postJson('/api/auth/register', [
            'name' => 'Kalingga',
            'email' => 'kalingga@mimo.test',
            'password' => 'secret123',
        ]);

        $regResponse->assertStatus(201)
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);

        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'kalingga@mimo.test',
            'password' => 'secret123',
        ]);

        $loginResponse->assertStatus(200)
            ->assertJsonStructure(['token', 'user']);
    }

    public function test_cat_adoption_and_initial_inventory(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/cat/adopt', [
            'name' => 'Mimo',
            'gender' => 'female',
            'personality_code' => 'playful',
            'fur_color' => '#E69A57',
            'pattern' => 'stripes',
            'eye_color' => '#48BB78',
            'ear_style' => 'pointy',
            'collar_color' => '#D97746',
            'bell' => true,
            'accessory' => 'bow',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('cat.name', 'Mimo');
        $response->assertJsonPath('cat.personality.code', 'playful');
        $response->assertJsonPath('cat.customization.accessory', 'bow');

        // Assert starter inventory was generated
        $this->assertDatabaseHas('inventory_items', [
            'user_id' => $user->id,
            'item_code' => 'dry_kibble',
        ]);
    }

    public function test_feed_and_pet_interactions(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->postJson('/api/cat/adopt', [
            'name' => 'Mimo',
            'personality_code' => 'playful',
            'fur_color' => '#E69A57',
            'pattern' => 'stripes',
            'eye_color' => '#48BB78',
        ]);

        // Test Pet
        $petResponse = $this->actingAs($user)->postJson('/api/cat/interact', [
            'action' => 'pet',
        ]);
        $petResponse->assertStatus(200);
        $this->assertTrue($petResponse->json('cat.stats.affection') > 60);

        // Test Feed
        $feedResponse = $this->actingAs($user)->postJson('/api/cat/interact', [
            'action' => 'feed',
        ]);
        $feedResponse->assertStatus(200);
        $this->assertEquals('eating', $feedResponse->json('cat.current_state'));
    }

    public function test_scold_interaction_increases_fear_and_lowers_trust(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->postJson('/api/cat/adopt', [
            'name' => 'Mimo',
            'personality_code' => 'shy',
            'fur_color' => '#E69A57',
            'pattern' => 'solid',
            'eye_color' => '#48BB78',
        ]);

        $scoldResponse = $this->actingAs($user)->postJson('/api/cat/interact', [
            'action' => 'scold',
        ]);

        $scoldResponse->assertStatus(200);
        // Shy cats have 1.6x fear sensitivity: fear should spike > 50
        $this->assertTrue($scoldResponse->json('cat.stats.fear') >= 50);
        $this->assertEquals('scared', $scoldResponse->json('cat.current_state'));
    }

    public function test_elapsed_time_decay_simulation(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->postJson('/api/cat/adopt', [
            'name' => 'Mimo',
            'personality_code' => 'playful',
            'fur_color' => '#E69A57',
            'pattern' => 'stripes',
            'eye_color' => '#48BB78',
        ]);

        $cat = Cat::where('user_id', $user->id)->first();
        $cat->stats()->update(['hunger' => 20.0, 'energy' => 80.0]);
        // Simulate cat went to sleep 3 hours ago
        $cat->update([
            'is_sleeping' => true,
            'last_calculated_at' => Carbon::now()->subHours(3),
        ]);

        $service = app(CatEmotionalService::class);
        $syncedCat = $service->syncElapsedTime($cat);

        // Hunger should have increased from 20 due to 3 hours of elapsed time
        $this->assertTrue($syncedCat->stats->hunger > 20.0);
        // Sleeping cat energy should have recovered
        $this->assertTrue($syncedCat->stats->energy >= 90.0);
    }
}
