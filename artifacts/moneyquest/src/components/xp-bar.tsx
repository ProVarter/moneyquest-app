import { motion } from "framer-motion";
import { Flame, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface XPBarProps {
  level: number;
  xp: number;
  streak: number;
  className?: string;
}

export function XPBar({ level, xp, streak, className }: XPBarProps) {
  const currentLevelXp = xp % 500;
  const targetXp = 500;
  const progress = Math.min(100, Math.max(0, (currentLevelXp / targetXp) * 100));

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center text-accent-foreground font-black text-lg shadow-lg shadow-accent/20 border-2 border-background z-10 relative">
              {level}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background rounded-full flex items-center justify-center z-20">
              <Star className="w-3 h-3 text-accent fill-accent" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm leading-none">Level {level} Explorer</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{currentLevelXp} / {targetXp} XP</p>
          </div>
        </div>
        
        {streak > 0 && (
          <div className="flex items-center gap-1 bg-orange-500/10 text-orange-500 px-2.5 py-1 rounded-full border border-orange-500/20">
            <Flame className="w-3.5 h-3.5 fill-orange-500" />
            <span className="text-xs font-bold">{streak} Day{streak !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
      
      <div className="h-3 w-full bg-secondary rounded-full overflow-hidden shadow-inner relative">
        <motion.div 
          className="h-full bg-gradient-to-r from-primary to-accent relative"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, type: "spring", bounce: 0.25 }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBsNDAtNDBIMjBMtMjAgMjB6TTQwIDBMMCA0MGgyMGw0MC00MHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-30" />
        </motion.div>
      </div>
    </div>
  );
}
