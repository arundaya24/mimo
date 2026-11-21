<?php

namespace Database\Seeders;

use App\Models\CatPersonality;
use Illuminate\Database\Seeder;

class CatPersonalitySeeder extends Seeder
{
    public function run(): void
    {
        $personalities = [
            [
                'code' => 'playful',
                'name' => 'Playful',
                'description' => 'Penuh energi, selalu ingin tahu, dan suka mengejar apa saja yang bergerak.',
                'hunger_decay_multiplier' => 1.2,
                'energy_decay_multiplier' => 1.3,
                'happiness_decay_multiplier' => 0.8,
                'trust_gain_multiplier' => 1.1,
                'fear_sensitivity' => 0.9,
                'affection_gain_multiplier' => 1.0,
                'preferred_activity' => 'play',
                'idle_dialogues' => [
                    'Mengibas-ngibaskan ekornya dengan semangat!',
                    'Melihat ke arah tali mainan dengan mata berbinar.',
                    'Melompat-lompat kecil di atas karpet.',
                    'Menyerang debu kecil di lantai seperti mangsa sungguhan.',
                    'Meong riang sambil mendekatkan hidung ke jarimu!'
                ],
                'reaction_dialogues' => [
                    'feed' => 'Makan dengan cepat lalu langsung siap berlari lagi!',
                    'pet' => 'Menggesekkan kepalanya sambil mendengkur cepat.',
                    'play' => 'Mengejar mainan dengan mata membesar dan melompat tinggi!',
                    'scold' => 'Terkejut sesaat, lalu mundur dengan telinga sedikit ditarik.',
                    'sleep' => 'Tidur melingkar setelah kelelahan bermain, nafasnya teratur.'
                ]
            ],
            [
                'code' => 'shy',
                'name' => 'Shy',
                'description' => 'Pemalu dan sensitif. Butuh waktu untuk percaya, tapi jika sudah sayang akan sangat setia.',
                'hunger_decay_multiplier' => 0.9,
                'energy_decay_multiplier' => 0.9,
                'happiness_decay_multiplier' => 1.1,
                'trust_gain_multiplier' => 0.65, // Needs more time to build trust
                'fear_sensitivity' => 1.6, // High fear sensitivity
                'affection_gain_multiplier' => 1.2,
                'preferred_activity' => 'pet',
                'idle_dialogues' => [
                    'Mengintip perlahan dari balik perabotan.',
                    'Duduk rapi sambil mengamati sekeliling dengan waspada.',
                    'Telinganya bergerak-gerak menangkap setiap suara halus.',
                    'Mendekat perlahan selangkah demi selangkah...',
                    'Memberikan kedipan lambat tanda mulai nyaman.'
                ],
                'reaction_dialogues' => [
                    'feed' => 'Mendekati mangkok dengan hati-hati sebelum menikmati makanannya.',
                    'pet' => 'Awalnya sedikit tegang, lalu meleleh dalam elusan lembutmu...',
                    'play' => 'Mengamati mainan dari kejauhan lalu menyentuhnya malu-malu.',
                    'scold' => 'Sangat ketakutan! Berlari ke sudut ruangan dan gemetar kecil.',
                    'sleep' => 'Tidur meringkuk erat di tempat yang paling tersembunyi.'
                ]
            ],
            [
                'code' => 'lazy',
                'name' => 'Lazy',
                'description' => 'Sangat santai, gemar rebahan di titik sinar matahari, dan cinta tidur siang yang panjang.',
                'hunger_decay_multiplier' => 0.8,
                'energy_decay_multiplier' => 0.7,
                'happiness_decay_multiplier' => 0.9,
                'trust_gain_multiplier' => 1.0,
                'fear_sensitivity' => 0.7,
                'affection_gain_multiplier' => 0.95,
                'preferred_activity' => 'sleep',
                'idle_dialogues' => [
                    'Menguap lebar lalu meregangkan keempat kakinya.',
                    'Berguling malas ke sisi lain karpet.',
                    'Menatapmu dengan mata setengah terpejam.',
                    'Menemukan titik hangat sinar matahari di lantai.',
                    'Dengkuran halus terdengar meski matanya terbuka sedikit.'
                ],
                'reaction_dialogues' => [
                    'feed' => 'Bangkit perlahan, mengunyah santai tanpa tergesa-gesa.',
                    'pet' => 'Menikmati elusan tanpa bergerak sama sekali, mendengkur berat.',
                    'play' => 'Hanya mengibaskan satu cakar ke arah mainan sambil berbaring.',
                    'scold' => 'Menatapmu tidak peduli lalu menutup mata kembali.',
                    'sleep' => 'Langsung terlelap dalam hitungan detik dengan dengkuran damai.'
                ]
            ],
            [
                'code' => 'affectionate',
                'name' => 'Affectionate',
                'description' => 'Manja, selalu ingin didekatmu, suka dielus, dan sering mendengkur keras.',
                'hunger_decay_multiplier' => 1.0,
                'energy_decay_multiplier' => 1.0,
                'happiness_decay_multiplier' => 1.3, // Gets lonely faster
                'trust_gain_multiplier' => 1.3,
                'fear_sensitivity' => 1.1,
                'affection_gain_multiplier' => 1.4,
                'preferred_activity' => 'pet',
                'idle_dialogues' => [
                    'Mengeong lembut meminta perhatianmu.',
                    'Menggesek-gesekkan pipinya ke kakimu atau layar.',
                    'Duduk sedekat mungkin sambil menatap matamu penuh kasih.',
                    'Membuat gerakan memijat (kneading) di atas bantal.',
                    'Mendengkur hangat bahkan sebelum kamu menyentuhnya.'
                ],
                'reaction_dialogues' => [
                    'feed' => 'Mengeong terima kasih sebelum melahap makanannya.',
                    'pet' => 'Memejamkan mata bahagia, mendengkur keras sambil mengangkat dagu!',
                    'play' => 'Bermain sebentar lalu kembali meminta pelukan.',
                    'scold' => 'Tampak sedih dan bingung, menatapmu dengan mata berair.',
                    'sleep' => 'Tidur sambil menempelkan kepalanya ke arahmu.'
                ]
            ],
            [
                'code' => 'grumpy',
                'name' => 'Grumpy',
                'description' => 'Berwajah judes, gengsi tinggi, tapi sebenarnya peduli dan punya hati yang hangat.',
                'hunger_decay_multiplier' => 1.1,
                'energy_decay_multiplier' => 0.9,
                'happiness_decay_multiplier' => 1.2,
                'trust_gain_multiplier' => 0.8,
                'fear_sensitivity' => 0.8,
                'affection_gain_multiplier' => 0.85,
                'preferred_activity' => 'treat',
                'idle_dialogues' => [
                    'Duduk dengan tatapan tajam yang menghakimi.',
                    'Mengibaskan ujung ekornya tanda sedang moody.',
                    'Mendengus pelan lalu membuang muka saat kamu menatap.',
                    'Berpura-pura tidak melihatmu padahal melirik diam-diam.',
                    'Mendengkur sangat samar tapi berhenti jika kamu melihat.'
                ],
                'reaction_dialogues' => [
                    'feed' => 'Makan dengan lahap tapi tetap berpura-pura tidak terlalu suka.',
                    'pet' => 'Awalnya pura-pura menolak, lalu bersandar sedikit ke tanganmu.',
                    'play' => 'Mencakar mainan dengan galak dan ekspresi sangat serius.',
                    'scold' => 'Mendesis pelan lalu memunggungi kamu dengan kesal!',
                    'sleep' => 'Tidur dengan wajah masih terlihat bersungut-sungut tapi menggemaskan.'
                ]
            ],
        ];

        foreach ($personalities as $personality) {
            CatPersonality::updateOrCreate(
                ['code' => $personality['code']],
                $personality
            );
        }
    }
}
