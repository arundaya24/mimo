import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Cat, PetState, InventoryItem, InteractionLog } from '../types/pet';
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
  Volume2,
  Moon,
  Sun,
  Sparkles,
  ShoppingBag,
  BookOpen,
  Settings,
  AlertTriangle,
  Heart,
  Clock,
  X,
  Plus
} from 'lucide-react';

interface PetDashboardPageProps {
  initialCat: Cat;
  onUpdateCat: (cat: Cat) => void;
  onAdoptNew: () => void;
}

export const PetDashboardPage: React.FC<PetDashboardPageProps> = ({
  initialCat,
  onUpdateCat,
  onAdoptNew,
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

  // Update game clock every minute
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

  // Fetch inventory when opened
  const loadInventory = async () => {
    try {
      const items = await petService.getInventory();
      setInventory(items);
    } catch {}
  };

  // Fetch history when opened
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
    }, 4000);
  };

  // Execute Core Interactions
  const handleAction = async (action: string, itemCode?: string) => {
    if (loadingAction) return;
    setLoadingAction(action);

    // Audio feedback triggers
    if (action === 'feed') sounds.playCrunch();
    else if (action === 'pet') sounds.playPurr();
    else if (action === 'play') sounds.playPounce();
    else if (action === 'scold') sounds.playScoldReaction();
    else if (action === 'sleep') sounds.playSleepChime();
    else sounds.playClick();

    try {
      const result = await petService.interact(action, itemCode);
      if (result.cat) {
        setCat(result.cat);
        onUpdateCat(result.cat);
      }

      showToast(result.message, result.stat_changes);

      // Trigger sparkles for joyful actions
      if (action === 'pet' || action === 'play' || action === 'treat') {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.7 },
        });
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Tindakan gagal.');
    } finally {
      setLoadingAction(null);
    }
  };

  // Handle room object clicks
  const handleObjectClick = (objectType: string) => {
    if (objectType === 'bowl') {
      handleAction('feed');
    } else if (objectType === 'bed') {
      handleAction('sleep');
    } else if (objectType === 'toy') {
      handleAction('play');
    }
  };

  // Handle direct cat click
  const handleCatClick = () => {
    if (cat.is_sleeping) {
      handleAction('pet'); // Petting gently in sleep
    } else {
      handleAction('pet');
    }
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
      loadInventory(); // Refresh remaining quantity
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
      showToast('Penampilan berhasil diperbarui!');
    } catch {}
  };

  const emotionLabels: Record<string, { label: string; badgeColor: string }> = {
    idle: { label: 'Santai', badgeColor: 'bg-cream-200 text-charcoal-700' },
    walking: { label: 'Jalan-jalan', badgeColor: 'bg-cream-200 text-charcoal-700' },
    sitting: { label: 'Duduk Rapi', badgeColor: 'bg-cream-200 text-charcoal-700' },
    sleeping: { label: 'Tidur Nyenyak', badgeColor: 'bg-indigo-100 text-indigo-700' },
    eating: { label: 'Makan Lahap', badgeColor: 'bg-honey-100 text-amber-800' },
    playing: { label: 'Bermain Lincah', badgeColor: 'bg-emerald-100 text-emerald-800' },
    happy: { label: 'Sangat Bahagia', badgeColor: 'bg-amber-100 text-amber-800' },
    scared: { label: 'Ketakutan / Waspada', badgeColor: 'bg-sky-100 text-sky-800' },
    angry: { label: 'Marah / Kesal', badgeColor: 'bg-rose-100 text-rose-800' },
    curious: { label: 'Penasaran', badgeColor: 'bg-purple-100 text-purple-800' },
    affectionate: { label: 'Penuh Kasih', badgeColor: 'bg-terracotta-100 text-terracotta-800' },
  };

  const currentEmotion = emotionLabels[cat.current_state] || {
    label: cat.current_state,
    badgeColor: 'bg-cream-200 text-charcoal-700',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 paper-texture">
      
      {/* Top Header & Cat Identity Bar */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-cream-300 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Cat Identity Info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-terracotta-500 text-white flex items-center justify-center text-2xl shadow-sm">
            🐾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-charcoal-900">
                {cat.name}
              </h1>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${currentEmotion.badgeColor}`}>
                {currentEmotion.label}
              </span>
            </div>
            <p className="text-xs text-brown-500 flex items-center gap-2 mt-0.5">
              <span className="capitalize font-medium">{cat.gender}</span>
              <span>•</span>
              <span className="text-terracotta-600 font-semibold">
                Karakter {cat.personality.name}
              </span>
              <span>•</span>
              <span className="text-brown-400">Jam: {gameTime}</span>
            </p>
          </div>
        </div>

        {/* Right: Quick Action Modals (Tas, Buku Harian, Lemari) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              loadInventory();
              setShowInventory(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-cream-100 hover:bg-cream-200 border border-cream-300 text-xs font-semibold text-charcoal-700 transition-all shadow-2xs"
            title="Buka Tas / Inventory"
          >
            <ShoppingBag className="w-4 h-4 text-terracotta-600" />
            <span className="hidden sm:inline">Tas Item</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              loadHistory();
              setShowDiary(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-cream-100 hover:bg-cream-200 border border-cream-300 text-xs font-semibold text-charcoal-700 transition-all shadow-2xs"
            title="Buku Harian / Diary"
          >
            <BookOpen className="w-4 h-4 text-brown-600" />
            <span className="hidden sm:inline">Buku Harian</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setShowCloset(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-cream-100 hover:bg-cream-200 border border-cream-300 text-xs font-semibold text-charcoal-700 transition-all shadow-2xs"
            title="Atur Penampilan"
          >
            <Settings className="w-4 h-4 text-brown-500" />
            <span className="hidden sm:inline">Lemari</span>
          </button>
        </div>
      </div>

      {/* Floating Action Feedback Notification */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="bg-charcoal-900 text-cream-50 px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-xs sm:text-sm font-medium z-30 border border-charcoal-700"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <span>{feedbackToast.message}</span>
            </div>

            {feedbackToast.changes && (
              <div className="flex items-center gap-2 text-xs font-mono font-semibold">
                {Object.entries(feedbackToast.changes).map(([k, v]) => {
                  if (typeof v !== 'number' || v === 0) return null;
                  const isPositive = v > 0;
                  return (
                    <span
                      key={k}
                      className={`px-1.5 py-0.5 rounded ${
                        isPositive ? 'bg-emerald-800 text-emerald-200' : 'bg-rose-800 text-rose-200'
                      }`}
                    >
                      {k}: {isPositive ? `+${v}` : v}
                    </span>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Living Room Showcase with Speech Bubble */}
      <div className="space-y-4">
        {/* Cat dynamic thought bubble */}
        <CatSpeechBubble
          thought={cat.current_thought}
          state={cat.current_state}
          catName={cat.name}
        />

        {/* 2D Interactive Room Environment */}
        <RoomEnvironment
          customization={cat.customization}
          state={cat.current_state}
          catName={cat.name}
          isSleeping={cat.is_sleeping}
          onCatClick={handleCatClick}
          onObjectClick={handleObjectClick}
          currentRoom={cat.current_room}
          onRoomChange={handleRoomChange}
        />
      </div>

      {/* Primary Interaction Dock */}
      <div className="bg-white/95 rounded-3xl border-2 border-cream-300 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-brown-600">
            Aksi Interaksi Langsung
          </span>
          <span className="text-[11px] text-brown-400">
            Respon bergantung pada kepribadian {cat.name}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          
          {/* 1. Feed */}
          <button
            onClick={() => handleAction('feed')}
            disabled={loadingAction !== null || cat.is_sleeping}
            className="tactile-btn p-3.5 rounded-2xl bg-honey-100 hover:bg-honey-200 text-amber-900 border border-honey-300 font-semibold text-xs sm:text-sm flex flex-col items-center gap-1.5 disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-amber-700 shadow-2xs">
              <Utensils className="w-5 h-5" />
            </div>
            <span>Beri Makan</span>
            <span className="text-[10px] text-amber-700/80 font-normal">Kenyang -35%</span>
          </button>

          {/* 2. Pet (Elus) */}
          <button
            onClick={() => handleAction('pet')}
            disabled={loadingAction !== null}
            className="tactile-btn p-3.5 rounded-2xl bg-terracotta-100 hover:bg-terracotta-200 text-terracotta-900 border border-terracotta-300 font-semibold text-xs sm:text-sm flex flex-col items-center gap-1.5 disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-terracotta-700 shadow-2xs">
              <Hand className="w-5 h-5" />
            </div>
            <span>Elus Lembut</span>
            <span className="text-[10px] text-terracotta-700/80 font-normal">Kasih +12%</span>
          </button>

          {/* 3. Play */}
          <button
            onClick={() => handleAction('play')}
            disabled={loadingAction !== null || cat.is_sleeping}
            className="tactile-btn p-3.5 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-semibold text-xs sm:text-sm flex flex-col items-center gap-1.5 disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-emerald-700 shadow-2xs">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <span>Ajak Bermain</span>
            <span className="text-[10px] text-emerald-700/80 font-normal">Bahagia +25%</span>
          </button>

          {/* 4. Sleep / Wake */}
          <button
            onClick={() => handleAction('sleep')}
            disabled={loadingAction !== null}
            className="tactile-btn p-3.5 rounded-2xl bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-300 font-semibold text-xs sm:text-sm flex flex-col items-center gap-1.5 disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-indigo-700 shadow-2xs">
              {cat.is_sleeping ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-700" />}
            </div>
            <span>{cat.is_sleeping ? 'Bangunkan' : 'Tidurkan'}</span>
            <span className="text-[10px] text-indigo-700/80 font-normal">Pulihkan Energi</span>
          </button>

          {/* 5. Scold */}
          <button
            onClick={() => {
              if (window.confirm(`Yakin ingin membentak ${cat.name}? Ini akan menaikkan rasa takut dan menurunkan kepercayaan.`)) {
                handleAction('scold');
              }
            }}
            disabled={loadingAction !== null}
            className="tactile-btn col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 font-semibold text-xs sm:text-sm flex flex-col items-center gap-1.5 disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-rose-700 shadow-2xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span>Tegur / Bentak</span>
            <span className="text-[10px] text-rose-700/80 font-normal">Takut +28%</span>
          </button>

        </div>
      </div>

      {/* Pet Emotional Stats Grid (6 Parameters: 0-100) */}
      <div className="bg-white/95 rounded-3xl border-2 border-cream-300 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-lg text-charcoal-900">
              Kondisi Mental & Fisik
            </h3>
            <p className="text-xs text-brown-500">
              Perhitungan parameter deterministik yang tersinkronisasi server
            </p>
          </div>
          <span className="text-xs bg-cream-200 px-3 py-1 rounded-full text-brown-600 font-medium">
            Skala 0 - 100
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* 1. Hunger */}
          <StatBar
            label="Tingkat Lapar (Hunger)"
            value={cat.stats.hunger}
            icon={<Utensils className="w-3.5 h-3.5" />}
            color="orange"
            isHunger={true}
            hint="Makin rendah makin kenyang. Beri makan teratur."
          />

          {/* 2. Happiness */}
          <StatBar
            label="Kebahagiaan (Happiness)"
            value={cat.stats.happiness}
            icon={<Sparkles className="w-3.5 h-3.5" />}
            color="yellow"
            hint="Meningkat saat diajak bermain dan dielus."
          />

          {/* 3. Energy */}
          <StatBar
            label="Energi (Energy)"
            value={cat.stats.energy}
            icon={<Sun className="w-3.5 h-3.5" />}
            color="green"
            hint="Berkurang saat bermain, pulih saat tidur di kasur."
          />

          {/* 4. Trust */}
          <StatBar
            label="Kepercayaan (Trust)"
            value={cat.stats.trust}
            icon={<Heart className="w-3.5 h-3.5" />}
            color="purple"
            hint="Dibangun perlahan lewat kasih sayang yang konsisten."
          />

          {/* 5. Fear */}
          <StatBar
            label="Rasa Takut (Fear)"
            value={cat.stats.fear}
            icon={<AlertTriangle className="w-3.5 h-3.5" />}
            color="red"
            hint="Meningkat drastis jika dibentak. Mereda seiring waktu."
          />

          {/* 6. Affection */}
          <StatBar
            label="Kasih Sayang (Affection)"
            value={cat.stats.affection}
            icon={<Heart className="w-3.5 h-3.5" />}
            color="orange"
            hint="Kucing akan mendengkur hangat saat kasih sayang tinggi."
          />
        </div>
      </div>

      {/* ================= MODAL 1: INVENTORY TAS ================= */}
      <AnimatePresence>
        {showInventory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/50 backdrop-blur-2xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-3xl border-2 border-cream-300 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-terracotta-600" />
                  <h3 className="font-heading font-bold text-lg text-charcoal-900">
                    Tas Item Pemilik
                  </h3>
                </div>
                <button
                  onClick={() => setShowInventory(false)}
                  className="p-1 rounded-xl text-brown-400 hover:text-charcoal-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {inventory.length === 0 ? (
                  <p className="text-center py-8 text-xs text-brown-400">
                    Tas kamu saat ini kosong.
                  </p>
                ) : (
                  inventory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-cream-50 border border-cream-300 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-sm text-charcoal-800">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-semibold bg-terracotta-100 text-terracotta-700 px-2 py-0.5 rounded-full">
                            Qty: {item.quantity}
                          </span>
                        </div>
                        <p className="text-xs text-brown-500 mt-0.5">
                          {item.description}
                        </p>
                        <span className="text-[11px] text-emerald-700 font-medium">
                          ✦ {item.effect_summary}
                        </span>
                      </div>

                      <button
                        onClick={() => handleUseItem(item)}
                        disabled={item.quantity <= 0 || cat.is_sleeping}
                        className="tactile-btn px-4 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold text-xs whitespace-nowrap disabled:opacity-50"
                      >
                        Gunakan
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 2: CAT DIARY / LOG ================= */}
      <AnimatePresence>
        {showDiary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/50 backdrop-blur-2xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-3xl border-2 border-cream-300 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brown-600" />
                  <h3 className="font-heading font-bold text-lg text-charcoal-900">
                    Buku Catatan Kenangan {cat.name}
                  </h3>
                </div>
                <button
                  onClick={() => setShowDiary(false)}
                  className="p-1 rounded-xl text-brown-400 hover:text-charcoal-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <p className="text-center py-8 text-xs text-brown-400">
                    Belum ada riwayat aktivitas yang tercatat.
                  </p>
                ) : (
                  history.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-2xl bg-cream-50 border border-cream-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold uppercase tracking-wider text-terracotta-700">
                          {log.action_type}
                        </span>
                        <span className="text-[10px] text-brown-400">
                          {log.time_ago}
                        </span>
                      </div>
                      <p className="text-charcoal-700 font-medium">{log.notes}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 3: CLOSET / APPEARANCE ================= */}
      <AnimatePresence>
        {showCloset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/50 backdrop-blur-2xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-3xl border-2 border-cream-300 p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-terracotta-600" />
                  <h3 className="font-heading font-bold text-lg text-charcoal-900">
                    Lemari Aksesori & Bulu {cat.name}
                  </h3>
                </div>
                <button
                  onClick={() => setShowCloset(false)}
                  className="p-1 rounded-xl text-brown-400 hover:text-charcoal-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <CatCustomizer
                customization={cat.customization}
                onChange={(updated) => {
                  setCat({ ...cat, customization: updated });
                }}
              />

              <div className="pt-4 border-t border-cream-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowCloset(false)}
                  className="px-4 py-2 rounded-xl border border-cream-300 text-xs font-semibold text-brown-600"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    handleSaveCustomization(cat.customization);
                    setShowCloset(false);
                  }}
                  className="tactile-btn px-5 py-2 rounded-xl bg-terracotta-500 text-white font-semibold text-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
