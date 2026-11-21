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
  Package,
  Check,
  Activity
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
    }, 3500);
  };

  // Execute Core Interactions
  const handleAction = async (action: string, itemCode?: string) => {
    if (loadingAction) return;
    setLoadingAction(action);

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

      if (action === 'pet' || action === 'play') {
        confetti({
          particleCount: 20,
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
    else if (objectType === 'toy') handleAction('play');
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 bg-[#F8F6F1]">
      
      {/* Top Header & Telemetry Bar */}
      <div className="bento-card rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-left">
        
        {/* Cat Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#22201D] text-[#FCFBF8] flex items-center justify-center font-mono font-bold text-sm border border-[#22201D]">
            {cat.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#141311]">
                {cat.name}
              </h1>
              <span className="font-mono text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border border-[#E7E2DA] bg-[#F8F6F1] text-[#5A5046]">
                STATE: {cat.current_state}
              </span>
            </div>
            <p className="font-mono text-[11px] text-[#756A5E] flex items-center gap-2 mt-0.5 uppercase tracking-wider">
              <span>{cat.gender}</span>
              <span>/</span>
              <span>{cat.personality.name}</span>
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
            className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7E2DA] bg-[#FCFBF8] hover:border-[#C8BFB3] text-xs font-mono font-medium text-[#47433E] transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#C75D35]" />
            <span>INVENTORY</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              loadHistory();
              setShowDiary(true);
            }}
            className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7E2DA] bg-[#FCFBF8] hover:border-[#C8BFB3] text-xs font-mono font-medium text-[#47433E] transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#756A5E]" />
            <span>DIARY</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setShowCloset(true);
            }}
            className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7E2DA] bg-[#FCFBF8] hover:border-[#C8BFB3] text-xs font-mono font-medium text-[#47433E] transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#756A5E]" />
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
            className="bg-[#181614] text-[#F8F6F1] px-4 py-2.5 rounded-lg border border-[#322F2B] flex items-center justify-between gap-4 text-xs font-mono"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C75D35]" />
              <span>{feedbackToast.message}</span>
            </div>

            {feedbackToast.changes && (
              <div className="flex items-center gap-1.5 text-[10px]">
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
        />

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
      <div className="bento-card rounded-xl p-4 sm:p-5 text-left">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#756A5E]">
            DIRECT INTERACTION DOCK
          </span>
          <span className="font-mono text-[10px] text-[#9E9284]">
            LATENCY: DETERMINISTIC // SERVER SYNC
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          
          {/* Feed */}
          <button
            onClick={() => handleAction('feed')}
            disabled={loadingAction !== null || cat.is_sleeping}
            className="btn-press p-3 rounded-lg border border-[#E7E2DA] bg-[#FCFBF8] hover:border-[#C8BFB3] text-left flex flex-col gap-1 disabled:opacity-40"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#9E9284]">01</span>
              <Utensils className="w-3.5 h-3.5 text-[#C75D35]" />
            </div>
            <span className="font-mono text-xs font-semibold text-[#141311]">FEED</span>
            <span className="font-mono text-[9px] text-[#756A5E]">HUNGER -35%</span>
          </button>

          {/* Pet */}
          <button
            onClick={() => handleAction('pet')}
            disabled={loadingAction !== null}
            className="btn-press p-3 rounded-lg border border-[#E7E2DA] bg-[#FCFBF8] hover:border-[#C8BFB3] text-left flex flex-col gap-1 disabled:opacity-40"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#9E9284]">02</span>
              <Hand className="w-3.5 h-3.5 text-[#C75D35]" />
            </div>
            <span className="font-mono text-xs font-semibold text-[#141311]">PET</span>
            <span className="font-mono text-[9px] text-[#756A5E]">AFFECTION +12%</span>
          </button>

          {/* Play */}
          <button
            onClick={() => handleAction('play')}
            disabled={loadingAction !== null || cat.is_sleeping}
            className="btn-press p-3 rounded-lg border border-[#E7E2DA] bg-[#FCFBF8] hover:border-[#C8BFB3] text-left flex flex-col gap-1 disabled:opacity-40"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#9E9284]">03</span>
              <Gamepad2 className="w-3.5 h-3.5 text-[#4A7C59]" />
            </div>
            <span className="font-mono text-xs font-semibold text-[#141311]">PLAY</span>
            <span className="font-mono text-[9px] text-[#756A5E]">HAPPINESS +25%</span>
          </button>

          {/* Sleep / Wake */}
          <button
            onClick={() => handleAction('sleep')}
            disabled={loadingAction !== null}
            className="btn-press p-3 rounded-lg border border-[#E7E2DA] bg-[#FCFBF8] hover:border-[#C8BFB3] text-left flex flex-col gap-1 disabled:opacity-40"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#9E9284]">04</span>
              {cat.is_sleeping ? <Sun className="w-3.5 h-3.5 text-[#B88728]" /> : <Moon className="w-3.5 h-3.5 text-[#5A5046]" />}
            </div>
            <span className="font-mono text-xs font-semibold text-[#141311]">
              {cat.is_sleeping ? 'WAKE' : 'SLEEP'}
            </span>
            <span className="font-mono text-[9px] text-[#756A5E]">ENERGY CYCLE</span>
          </button>

          {/* Scold */}
          <button
            onClick={() => {
              if (window.confirm(`Konfirmasi teguran untuk ${cat.name}? Tingkat fear akan meningkat.`)) {
                handleAction('scold');
              }
            }}
            disabled={loadingAction !== null}
            className="btn-press col-span-2 sm:col-span-1 p-3 rounded-lg border border-[#E7E2DA] bg-[#FCFBF8] hover:border-[#C8BFB3] text-left flex flex-col gap-1 disabled:opacity-40"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#9E9284]">05</span>
              <AlertOctagon className="w-3.5 h-3.5 text-[#A84534]" />
            </div>
            <span className="font-mono text-xs font-semibold text-[#A84534]">SCOLD</span>
            <span className="font-mono text-[9px] text-[#756A5E]">FEAR SPIKE</span>
          </button>

        </div>
      </div>

      {/* 6 Parameter HUD Bento Grid */}
      <div className="bento-card rounded-xl p-4 sm:p-5 text-left">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E7E2DA]">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9284]">
              TELEMETRY
            </span>
            <h3 className="font-bold text-base text-[#141311]">
              Status Parameter Fisik & Emosi
            </h3>
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F8F6F1] border border-[#E7E2DA] text-[#5A5046]">
            SCALE 0 - 100
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
            hint="Dipulihkan saat status tidur aktif di unit kasur."
          />

          <StatBar
            label="TRUST"
            value={cat.stats.trust}
            icon={<Heart className="w-3 h-3" />}
            color="slate"
            hint="Kepercayaan dibangun bertahap dari interaksi positif."
          />

          <StatBar
            label="FEAR"
            value={cat.stats.fear}
            icon={<AlertOctagon className="w-3 h-3" />}
            color="rose"
            hint="Meningkat jika dibentak, menurun seiring waktu."
          />

          <StatBar
            label="AFFECTION"
            value={cat.stats.affection}
            icon={<Heart className="w-3 h-3" />}
            color="charcoal"
            hint="Kerapatan ikatan emosional terhadap pemilik."
          />
        </div>
      </div>

      {/* ================= MODAL 1: INVENTORY ================= */}
      <AnimatePresence>
        {showInventory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141311]/40 backdrop-blur-2xs">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#FCFBF8] w-full max-w-md rounded-xl border border-[#E7E2DA] p-5 text-left space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#C75D35]" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#141311]">
                    INVENTORY STORAGE
                  </span>
                </div>
                <button
                  onClick={() => setShowInventory(false)}
                  className="btn-press p-1 text-[#756A5E] hover:text-[#141311]"
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
                      className="p-3 rounded-lg border border-[#E7E2DA] bg-[#FAF8F5] flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#141311]">
                            {item.name}
                          </span>
                          <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-[#E7E2DA] text-[#5A5046]">
                            QTY: {item.quantity}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5A5046] mt-0.5">
                          {item.description}
                        </p>
                        <span className="font-mono text-[10px] text-[#4A7C59] block mt-0.5">
                          {item.effect_summary}
                        </span>
                      </div>

                      <button
                        onClick={() => handleUseItem(item)}
                        disabled={item.quantity <= 0 || cat.is_sleeping}
                        className="btn-press px-3 py-1.5 rounded bg-[#22201D] text-[#FCFBF8] font-mono text-[10px] font-semibold uppercase disabled:opacity-40"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141311]/40 backdrop-blur-2xs">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#FCFBF8] w-full max-w-md rounded-xl border border-[#E7E2DA] p-5 text-left space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA]">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#756A5E]" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#141311]">
                    ACTIVITY LOGS // {cat.name}
                  </span>
                </div>
                <button
                  onClick={() => setShowDiary(false)}
                  className="btn-press p-1 text-[#756A5E] hover:text-[#141311]"
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
                      className="p-2.5 rounded-lg border border-[#E7E2DA] bg-[#FAF8F5] font-mono text-[11px] space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold uppercase text-[#C75D35]">
                          ACTION: {log.action_type}
                        </span>
                        <span className="text-[10px] text-[#9E9284]">
                          {log.time_ago}
                        </span>
                      </div>
                      <p className="text-[#322F2B] font-sans text-xs">{log.notes}</p>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141311]/40 backdrop-blur-2xs">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#FCFBF8] w-full max-w-2xl rounded-xl border border-[#E7E2DA] p-6 max-h-[88vh] overflow-y-auto text-left space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#C75D35]" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#141311]">
                    PHENOTYPE & ACCESSORY EDITOR
                  </span>
                </div>
                <button
                  onClick={() => setShowCloset(false)}
                  className="btn-press p-1 text-[#756A5E] hover:text-[#141311]"
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

              <div className="pt-4 border-t border-[#E7E2DA] flex justify-end gap-2.5">
                <button
                  onClick={() => setShowCloset(false)}
                  className="btn-press px-4 py-2 rounded-lg border border-[#E7E2DA] font-mono text-xs font-semibold text-[#5A5046]"
                >
                  BATAL
                </button>
                <button
                  onClick={() => {
                    handleSaveCustomization(cat.customization);
                    setShowCloset(false);
                  }}
                  className="btn-press cta-shimmer px-5 py-2 rounded-lg bg-[#22201D] text-[#FCFBF8] font-mono text-xs font-semibold tracking-wider uppercase border border-[#22201D]"
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
