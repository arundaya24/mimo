import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Cat, InventoryItem, InteractionLog } from '../types/pet';
import { petService } from '../services/petService';
import { RoomEnvironment } from '../components/environment/RoomEnvironment';
import { StatBar } from '../components/ui/StatBar';
import { CatSpeechBubble } from '../components/cat/CatSpeechBubble';
import { CatCustomizer } from '../components/cat/CatCustomizer';
import { sounds } from '../audio/soundSynth';
import {
  Utensils,
  Hand,
  Gamepad2,
  Moon,
  Sun,
  ShoppingBag,
  BookOpen,
  SlidersHorizontal,
  AlertOctagon,
  Heart,
  X,
  Activity,
  Brush,
  Sparkles,
  Shield,
  Clock,
  Check
} from 'lucide-react';

interface PetDashboardPageProps {
  initialCat: Cat;
  onUpdateCat: (cat: Cat) => void;
  onAdoptNew: () => void;
}

export const PetDashboardPage: React.FC<PetDashboardPageProps> = ({
  initialCat,
  onUpdateCat,
}) => {
  const [cat, setCat] = useState<Cat>(initialCat);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{
    message: string;
    changes?: Record<string, number | boolean>;
  } | null>(null);

  // Modals
  const [showInventory, setShowInventory] = useState(false);
  const [showDiary, setShowDiary] = useState(false);
  const [showCloset, setShowCloset] = useState(false);

  // Inventory & History data
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [history, setHistory] = useState<InteractionLog[]>([]);

  // Local game clock
  const [gameTime, setGameTime] = useState<string>('');

  useEffect(() => {
    setCat(initialCat);
  }, [initialCat]);

  // Update game clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setGameTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sync elapsed time periodically (every 45s while dashboard is active)
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        const res = await petService.getCat();
        if (res.cat) {
          setCat(res.cat);
          onUpdateCat(res.cat);
        }
      } catch {}
    }, 45000);
    return () => clearInterval(syncInterval);
  }, [onUpdateCat]);

  // Fetch inventory
  const loadInventory = async () => {
    try {
      const items = await petService.getInventory();
      setInventory(items);
    } catch {}
  };

  // Fetch history
  const loadHistory = async () => {
    try {
      const logs = await petService.getHistory();
      setHistory(logs);
    } catch {}
  };

  const showToast = (message: string, changes?: Record<string, number | boolean>) => {
    setFeedbackToast({ message, changes });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3800);
  };

  // Execute Core Interactions
  const handleAction = async (action: string, itemCode?: string) => {
    if (loadingAction) return;
    setLoadingAction(action);

    if (action === 'feed') sounds.playCrunch();
    else if (action === 'pet') sounds.playPurr();
    else if (action === 'play') sounds.playPounce();
    else if (action === 'groom') sounds.playBrush();
    else if (action === 'clean_room') sounds.playClick();
    else if (action === 'scold') sounds.playScoldReaction();
    else if (action === 'sleep') sounds.playSleepChime();
    else if (action === 'cat_grass') sounds.playGrassCrunch();
    else if (action === 'water_fountain') sounds.playWaterStream();
    else if (action === 'scratch_tree') sounds.playScratch();
    else if (action === 'treat') sounds.playCrunch();
    else sounds.playClick();

    try {
      const result = await petService.interact(action, itemCode);
      if (result.cat) {
        setCat(result.cat);
        onUpdateCat(result.cat);
      }

      showToast(result.message, result.stat_changes);

      if (action === 'pet' || action === 'play' || action === 'groom') {
        confetti({
          particleCount: 22,
          spread: 35,
          origin: { y: 0.7 },
        });
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Tindakan gagal diproses.');
    } finally {
      setLoadingAction(null);
    }
  };

  // Handle room object clicks
  const handleObjectClick = (objectType: string) => {
    if (objectType === 'bowl') handleAction('feed');
    else if (objectType === 'bed') handleAction('sleep');
    else if (objectType === 'toy' || objectType === 'butterfly') handleAction('play');
    else if (objectType === 'cat_grass') handleAction('cat_grass');
    else if (objectType === 'water_fountain') handleAction('water_fountain');
    else if (objectType === 'scratch_tree') handleAction('scratch_tree');
    else if (objectType === 'treat') handleAction('treat');
  };

  // Handle direct cat click
  const handleCatClick = () => {
    handleAction('pet');
  };

  // Switch Room
  const handleRoomChange = async (room: string) => {
    try {
      const res = await petService.updateRoom(room);
      setCat(res.cat);
      onUpdateCat(res.cat);
    } catch {}
  };

  // Use Item from Inventory
  const handleUseItem = async (item: InventoryItem) => {
    sounds.playClick();
    try {
      const res = await petService.useItem(item.item_code);
      setCat(res.cat);
      onUpdateCat(res.cat);
      showToast(res.message, res.stat_changes);
      loadInventory();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Gagal menggunakan item.');
    }
  };

  // Save updated customizations from closet
  const handleSaveCustomization = async (newCustomization: Cat['customization']) => {
    try {
      const res = await petService.updateCustomization(newCustomization);
      setCat(res.cat);
      onUpdateCat(res.cat);
      showToast('Penampilan berhasil diperbarui.');
    } catch {}
  };

  const favoriteFoodDisplay = cat.favorite_food
    ? cat.favorite_food.replace('_', ' ').toUpperCase()
    : 'CANNED TUNA';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 text-left">
      
      {/* Top Header & Telemetry Bar */}
      <div className="bento-card rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Cat Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#22201D] dark:bg-[#F6F4EE] text-[#FCFBF8] dark:text-[#121110] flex items-center justify-center font-mono font-bold text-sm border border-[#22201D] dark:border-[#F6F4EE]">
            {cat.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#141311] dark:text-[#F6F4EE]">
                {cat.name}
              </h1>
              <span className="font-mono text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#F8F6F1] dark:bg-[#1E1C1A] text-[#5A5046] dark:text-[#B5ACA1]">
                STATE: {cat.current_state}
              </span>

              {/* Boredom Indicator */}
              {(cat.boredom_counter ?? 0) >= 3 && (
                <span className="font-mono text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                  BUTUH JEDA MAIN
                </span>
              )}
            </div>
            <p className="font-mono text-[11px] text-[#756A5E] dark:text-[#B5ACA1] flex flex-wrap items-center gap-2 mt-0.5 uppercase tracking-wider">
              <span className={`font-semibold px-1.5 py-0.2 rounded border ${
                cat.gender === 'male'
                  ? 'text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40'
                  : 'text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40'
              }`}>
                {cat.gender === 'male' ? '♂ JANTAN' : '♀ BETINA'}
              </span>
              <span>/</span>
              <span>{cat.personality.name}</span>
              <span>/</span>
              <span>FAV: {favoriteFoodDisplay}</span>
              <span>/</span>
              <span>LOCAL TIME {gameTime}</span>
            </p>
          </div>
        </div>

        {/* Modal Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              loadInventory();
              setShowInventory(true);
            }}
            className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] hover:border-[#C8BFB3] dark:hover:border-[#48433E] text-xs font-mono font-medium text-[#47433E] dark:text-[#F6F4EE] transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>INVENTORY</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              loadHistory();
              setShowDiary(true);
            }}
            className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] hover:border-[#C8BFB3] dark:hover:border-[#48433E] text-xs font-mono font-medium text-[#47433E] dark:text-[#F6F4EE] transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#756A5E] dark:text-[#B5ACA1]" />
            <span>DIARY</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setShowCloset(true);
            }}
            className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] hover:border-[#C8BFB3] dark:hover:border-[#48433E] text-xs font-mono font-medium text-[#47433E] dark:text-[#F6F4EE] transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#756A5E] dark:text-[#B5ACA1]" />
            <span>PHENOTYPE</span>
          </button>
        </div>
      </div>

      {/* Floating Action Feedback Notification */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#181614] dark:bg-[#201D1A] text-[#F8F6F1] px-4 py-2.5 rounded-lg border border-[#322F2B] dark:border-[#423C36] flex flex-wrap items-center justify-between gap-4 text-xs font-mono shadow-md"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span>{feedbackToast.message}</span>
            </div>

            {feedbackToast.changes && (
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                {Object.entries(feedbackToast.changes).map(([k, v]) => {
                  if (typeof v !== 'number' || v === 0) return null;
                  const isPositive = v > 0;
                  return (
                    <span
                      key={k}
                      className={`px-1.5 py-0.2 rounded font-semibold ${
                        isPositive ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-800' : 'text-rose-300 bg-rose-950/80 border border-rose-800'
                      }`}
                    >
                      {k.toUpperCase()}: {isPositive ? `+${v}` : v}
                    </span>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Room Showcase + Thought Bubble */}
      <div className="space-y-3">
        <CatSpeechBubble
          thought={cat.current_thought}
          state={cat.current_state}
          catName={cat.name}
          gender={cat.gender}
        />

        <RoomEnvironment
          customization={cat.customization}
          state={cat.current_state}
          catName={cat.name}
          isSleeping={cat.is_sleeping}
          gender={cat.gender}
          stats={cat.stats}
          personality={cat.personality}
          onCatClick={handleCatClick}
          onObjectClick={handleObjectClick}
          currentRoom={cat.current_room}
          onRoomChange={handleRoomChange}
        />
      </div>

      {/* Primary Interaction Dock */}
      <div className="bento-card rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#756A5E] dark:text-[#B5ACA1]">
            DIRECT INTERACTION DOCK
          </span>
          <span className="font-mono text-[10px] text-[#9E9284] dark:text-[#7E756B]">
            DETERMINISTIC SIMULATION // SERVER SYNC
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          
          {/* 01: Feed */}
          <button
            onClick={() => handleAction('feed')}
            disabled={loadingAction !== null || cat.is_sleeping}
            className="btn-press p-3 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] hover:border-[#C8BFB3] dark:hover:border-[#48433E] text-left flex flex-col gap-1 disabled:opacity-40"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#9E9284] dark:text-[#7E756B]">01</span>
              <Utensils className="w-3.5 h-3.5 text-[var(--accent)]" />
            </div>
            <span className="font-mono text-xs font-semibold text-[#141311] dark:text-[#F6F4EE]">FEED</span>
            <span className="font-mono text-[9px] text-[#756A5E] dark:text-[#B5ACA1]">HUNGER -35%</span>
          </button>

          {/* 02: Pet */}
          <button
            onClick={() => handleAction('pet')}
            disabled={loadingAction !== null}
            className="btn-press p-3 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] hover:border-[#C8BFB3] dark:hover:border-[#48433E] text-left flex flex-col gap-1 disabled:opacity-40"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#9E9284] dark:text-[#7E756B]">02</span>
              <Hand className="w-3.5 h-3.5 text-[var(--accent)]" />
            </div>
            <span className="font-mono text-xs font-semibold text-[#141311] dark:text-[#F6F4EE]">PET</span>
            <span className="font-mono text-[9px] text-[#756A5E] dark:text-[#B5ACA1]">AFFECTION +12%</span>
          </button>

          {/* 03: Play */}
          <button
            onClick={() => handleAction('play')}
            disabled={loadingAction !== null || cat.is_sleeping}
            className="btn-press p-3 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] hover:border-[#C8BFB3] dark:hover:border-[#48433E] text-left flex flex-col gap-1 disabled:opacity-40"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#9E9284] dark:text-[#7E756B]">03</span>
              <Gamepad2 className="w-3.5 h-3.5 text-[#4A7C59]" />
            </div>
            <span className="font-mono text-xs font-semibold text-[#141311] dark:text-[#F6F4EE]">PLAY</span>
            <span className="font-mono text-[9px] text-[#756A5E] dark:text-[#B5ACA1]">HAPPINESS +25%</span>
          </button>

          {/* 04: Groom (Sisir Bulu) */}
          <button
            onClick={() => handleAction('groom')}
            disabled={loadingAction !== null || cat.is_sleeping}
            className="btn-press p-3 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] hover:border-[#C8BFB3] dark:hover:border-[#48433E] text-left flex flex-col gap-1 disabled:opacity-40"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#9E9284] dark:text-[#7E756B]">04</span>
              <Brush className="w-3.5 h-3.5 text-[#D97706]" />
            </div>
            <span className="font-mono text-xs font-semibold text-[#141311] dark:text-[#F6F4EE]">GROOM</span>
            <span className="font-mono text-[9px] text-[#756A5E] dark:text-[#B5ACA1]">CLEAN +25%</span>
          </button>

          {/* 05: Clean Room */}
          <button
            onClick={() => handleAction('clean_room')}
            disabled={loadingAction !== null}
            className="btn-press p-3 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] hover:border-[#C8BFB3] dark:hover:border-[#48433E] text-left flex flex-col gap-1 disabled:opacity-40"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#9E9284] dark:text-[#7E756B]">05</span>
              <Sparkles className="w-3.5 h-3.5 text-[#475569] dark:text-[#94A3B8]" />
            </div>
            <span className="font-mono text-xs font-semibold text-[#141311] dark:text-[#F6F4EE]">CLEAN</span>
            <span className="font-mono text-[9px] text-[#756A5E] dark:text-[#B5ACA1]">COMFORT +25%</span>
          </button>

          {/* 06: Sleep / Wake */}
          <button
            onClick={() => handleAction('sleep')}
            disabled={loadingAction !== null}
            className="btn-press p-3 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] hover:border-[#C8BFB3] dark:hover:border-[#48433E] text-left flex flex-col gap-1 disabled:opacity-40"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#9E9284] dark:text-[#7E756B]">06</span>
              {cat.is_sleeping ? <Sun className="w-3.5 h-3.5 text-[#B88728]" /> : <Moon className="w-3.5 h-3.5 text-[#5A5046] dark:text-[#B5ACA1]" />}
            </div>
            <span className="font-mono text-xs font-semibold text-[#141311] dark:text-[#F6F4EE]">
              {cat.is_sleeping ? 'WAKE' : 'SLEEP'}
            </span>
            <span className="font-mono text-[9px] text-[#756A5E] dark:text-[#B5ACA1]">ENERGY CYCLE</span>
          </button>

          {/* 07: Scold */}
          <button
            onClick={() => {
              if (window.confirm(`Konfirmasi teguran untuk ${cat.name}? Tingkat fear akan meningkat.`)) {
                handleAction('scold');
              }
            }}
            disabled={loadingAction !== null}
            className="btn-press col-span-2 sm:col-span-1 p-3 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] hover:border-[#C8BFB3] dark:hover:border-[#48433E] text-left flex flex-col gap-1 disabled:opacity-40"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#9E9284] dark:text-[#7E756B]">07</span>
              <AlertOctagon className="w-3.5 h-3.5 text-[#A84534]" />
            </div>
            <span className="font-mono text-xs font-semibold text-[#A84534]">SCOLD</span>
            <span className="font-mono text-[9px] text-[#756A5E] dark:text-[#B5ACA1]">FEAR SPIKE</span>
          </button>

        </div>
      </div>

      {/* 8 Parameter HUD Bento Grid */}
      <div className="bento-card rounded-xl p-4 sm:p-5 text-left">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E7E2DA] dark:border-[#2D2A26]">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9284] dark:text-[#7E756B]">
              TELEMETRY SENSORS
            </span>
            <h3 className="font-bold text-base text-[#141311] dark:text-[#F6F4EE]">
              Status Parameter Fisik, Mental & Lingkungan
            </h3>
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F8F6F1] dark:bg-[#1E1C1A] border border-[#E7E2DA] dark:border-[#2D2A26] text-[#5A5046] dark:text-[#B5ACA1]">
            SCALE 0 - 100
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatBar
            label="HUNGER"
            value={cat.stats.hunger}
            icon={<Utensils className="w-3 h-3" />}
            color="terracotta"
            isHunger={true}
            hint="Rasa lapar bertambah berdasarkan durasi server."
          />

          <StatBar
            label="HAPPINESS"
            value={cat.stats.happiness}
            icon={<Activity className="w-3 h-3" />}
            color="amber"
            hint="Meningkat via permainan dan elusan rutin."
          />

          <StatBar
            label="ENERGY"
            value={cat.stats.energy}
            icon={<Sun className="w-3 h-3" />}
            color="sage"
            hint="Dipulihkan saat tidur aktif di unit kasur."
          />

          <StatBar
            label="COMFORT"
            value={cat.stats.comfort ?? 85}
            icon={<Sparkles className="w-3 h-3" />}
            color="amber"
            hint="Tingkat kenyamanan ruang dan ketenangan kucing."
          />

          <StatBar
            label="CLEANLINESS"
            value={cat.stats.cleanliness ?? 90}
            icon={<Brush className="w-3 h-3" />}
            color="sage"
            hint="Kebersihan bulu. Sisir bulu kucing secara teratur."
          />

          <StatBar
            label="TRUST"
            value={cat.stats.trust}
            icon={<Heart className="w-3 h-3" />}
            color="slate"
            hint="Kepercayaan dibangun bertahap dari interaksi positif."
          />

          <StatBar
            label="AFFECTION"
            value={cat.stats.affection}
            icon={<Heart className="w-3 h-3" />}
            color="charcoal"
            hint="Kerapatan ikatan emosional terhadap pemilik."
          />

          <StatBar
            label="FEAR"
            value={cat.stats.fear}
            icon={<AlertOctagon className="w-3 h-3" />}
            color="rose"
            hint="Meningkat jika dibentak, menurun seiring waktu."
          />
        </div>
      </div>

      {/* ================= MODAL 1: INVENTORY ================= */}
      <AnimatePresence>
        {showInventory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#FCFBF8] dark:bg-[#181615] w-full max-w-md rounded-xl border border-[#E7E2DA] dark:border-[#2D2A26] p-5 text-left space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA] dark:border-[#2D2A26]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[var(--accent)]" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#141311] dark:text-[#F6F4EE]">
                    INVENTORY STORAGE
                  </span>
                </div>
                <button
                  onClick={() => setShowInventory(false)}
                  className="btn-press p-1 text-[#756A5E] hover:text-[#141311] dark:hover:text-[#F6F4EE]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {inventory.length === 0 ? (
                  <p className="text-center py-8 font-mono text-xs text-[#9E9284]">
                    INVENTORY KOSONG
                  </p>
                ) : (
                  inventory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FAF8F5] dark:bg-[#1E1C1A] flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#141311] dark:text-[#F6F4EE]">
                            {item.name}
                          </span>
                          <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-[#E7E2DA] dark:bg-[#2D2A26] text-[#5A5046] dark:text-[#B5ACA1]">
                            QTY: {item.quantity}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5A5046] dark:text-[#B5ACA1] mt-0.5">
                          {item.description}
                        </p>
                        <span className="font-mono text-[10px] text-[#4A7C59] dark:text-[#5B946D] block mt-0.5">
                          {item.effect_summary}
                        </span>
                      </div>

                      <button
                        onClick={() => handleUseItem(item)}
                        disabled={item.quantity <= 0 || cat.is_sleeping}
                        className="btn-press px-3 py-1.5 rounded bg-[#22201D] dark:bg-[#F6F4EE] text-[#FCFBF8] dark:text-[#121110] font-mono text-[10px] font-semibold uppercase disabled:opacity-40"
                      >
                        USE
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 2: DIARY ================= */}
      <AnimatePresence>
        {showDiary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#FCFBF8] dark:bg-[#181615] w-full max-w-md rounded-xl border border-[#E7E2DA] dark:border-[#2D2A26] p-5 text-left space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA] dark:border-[#2D2A26]">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#756A5E] dark:text-[#B5ACA1]" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#141311] dark:text-[#F6F4EE]">
                    ACTIVITY LOGS // {cat.name}
                  </span>
                </div>
                <button
                  onClick={() => setShowDiary(false)}
                  className="btn-press p-1 text-[#756A5E] hover:text-[#141311] dark:hover:text-[#F6F4EE]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <p className="text-center py-8 font-mono text-xs text-[#9E9284]">
                    BELUM ADA LOG TERCATAT
                  </p>
                ) : (
                  history.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FAF8F5] dark:bg-[#1E1C1A] font-mono text-[11px] space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold uppercase text-[var(--accent)]">
                          ACTION: {log.action_type}
                        </span>
                        <span className="text-[10px] text-[#9E9284] dark:text-[#7E756B]">
                          {log.time_ago}
                        </span>
                      </div>
                      <p className="text-[#322F2B] dark:text-[#F6F4EE] font-sans text-xs">{log.notes}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 3: CLOSET ================= */}
      <AnimatePresence>
        {showCloset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#FCFBF8] dark:bg-[#181615] w-full max-w-2xl rounded-xl border border-[#E7E2DA] dark:border-[#2D2A26] p-6 max-h-[88vh] overflow-y-auto text-left space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA] dark:border-[#2D2A26]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[var(--accent)]" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#141311] dark:text-[#F6F4EE]">
                    PHENOTYPE & ACCESSORY EDITOR
                  </span>
                </div>
                <button
                  onClick={() => setShowCloset(false)}
                  className="btn-press p-1 text-[#756A5E] hover:text-[#141311] dark:hover:text-[#F6F4EE]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <CatCustomizer
                customization={cat.customization}
                onChange={(updated) => {
                  setCat({ ...cat, customization: updated });
                }}
              />

              <div className="pt-4 border-t border-[#E7E2DA] dark:border-[#2D2A26] flex justify-end gap-2.5">
                <button
                  onClick={() => setShowCloset(false)}
                  className="btn-press px-4 py-2 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] font-mono text-xs font-semibold text-[#5A5046] dark:text-[#B5ACA1]"
                >
                  BATAL
                </button>
                <button
                  onClick={() => {
                    handleSaveCustomization(cat.customization);
                    setShowCloset(false);
                  }}
                  className="btn-press cta-shimmer px-5 py-2 rounded-lg bg-[#22201D] dark:bg-[#F6F4EE] text-[#FCFBF8] dark:text-[#121110] font-mono text-xs font-semibold tracking-wider uppercase border border-[#22201D] dark:border-[#F6F4EE]"
                >
                  SIMPAN PERUBAHAN
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
