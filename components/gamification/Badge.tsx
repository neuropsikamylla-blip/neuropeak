"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BadgeProps {
  icon: string;
  title: string;
  description: string;
  unlocked?: boolean;
  new?: boolean;
  className?: string;
}

export function AchievementBadge({
  icon,
  title,
  description,
  unlocked = true,
  new: isNew = false,
  className,
}: BadgeProps) {
  return (
    <motion.div
      className={cn(
        "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all",
        unlocked
          ? "border-yellow-400 bg-yellow-50 shadow-md"
          : "border-gray-200 bg-gray-50 opacity-50 grayscale",
        className
      )}
      whileHover={unlocked ? { scale: 1.05 } : {}}
    >
      {isNew && (
        <motion.div
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          NOVO!
        </motion.div>
      )}
      <span className="text-4xl mb-2">{icon}</span>
      <span className="font-bold text-sm text-center text-gray-800">{title}</span>
      <span className="text-xs text-center text-gray-500 mt-1">{description}</span>
    </motion.div>
  );
}

interface AchievementPopupProps {
  icon: string;
  title: string;
  description: string;
  show: boolean;
  onClose: () => void;
}

export function AchievementPopup({ icon, title, description, show, onClose }: AchievementPopupProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-4 right-4 z-50 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl shadow-2xl p-6 max-w-sm"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={onClose}
        >
          <div className="flex items-center gap-4">
            <motion.span
              className="text-5xl"
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {icon}
            </motion.span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide opacity-80">
                Conquista Desbloqueada!
              </p>
              <p className="font-bold text-lg">{title}</p>
              <p className="text-sm opacity-90">{description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
