"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Timer } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";

interface KitchenTimerProps {
  timer: Timer;
  onUpdate: (timer: Timer) => void;
  onRemove: () => void;
}

// Memoized timer display component
const TimerDisplay = React.memo(
  ({ remaining, isFinished }: { remaining: number; isFinished: boolean }) => {
    const formatTime = useCallback((seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }, []);

    const timeText = useMemo(
      () => formatTime(remaining),
      [remaining, formatTime]
    );
    const textColor = useMemo(() => {
      if (isFinished) return "text-green-600";
      if (remaining < 60) return "text-red-600";
      return "text-white";
    }, [isFinished, remaining]);

    return (
      <div className="text-center">
        <div className={`text-xl sm:text-2xl font-mono font-bold ${textColor}`}>
          {timeText}
        </div>
        {isFinished && (
          <div className="text-xs sm:text-sm text-green-600 font-medium">
            Time's up!
          </div>
        )}
      </div>
    );
  }
);

TimerDisplay.displayName = "TimerDisplay";

// Memoized timer controls component
const TimerControls = React.memo(
  ({
    isActive,
    isFinished,
    onToggle,
    onReset,
  }: {
    isActive: boolean;
    isFinished: boolean;
    onToggle: () => void;
    onReset: () => void;
  }) => (
    <div className="flex justify-center gap-1 sm:gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        disabled={isFinished}
        className="h-8 w-8 p-0"
      >
        {isActive ? (
          <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
        ) : (
          <Play className="w-3 h-3 sm:w-4 sm:h-4" />
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="h-8 w-8 p-0"
      >
        <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
    </div>
  )
);

TimerControls.displayName = "TimerControls";

export const KitchenTimer = React.memo(
  ({ timer, onUpdate, onRemove }: KitchenTimerProps) => {
    const [hasNotified, setHasNotified] = useState(false);

    // Memoized computed values
    const isFinished = useMemo(() => timer.remaining === 0, [timer.remaining]);
    const progress = useMemo(
      () => ((timer.duration - timer.remaining) / timer.duration) * 100,
      [timer.duration, timer.remaining]
    );
    const cardClassName = useMemo(
      () => (isFinished ? "ring-2 ring-green-500 bg-green-50" : ""),
      [isFinished]
    );

    // Memoized callback functions
    const toggleTimer = useCallback(() => {
      onUpdate({ ...timer, isActive: !timer.isActive });
    }, [timer, onUpdate]);

    const resetTimer = useCallback(() => {
      onUpdate({ ...timer, remaining: timer.duration, isActive: false });
      setHasNotified(false);
    }, [timer, onUpdate]);

    const showNotification = useCallback(() => {
      if (hasNotified) return;

      setHasNotified(true);
      toast.success(`${timer.label} timer finished!`, {
        duration: 5000,
      });

      // Play notification sound if supported
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`${timer.label} Timer`, {
          body: "Your cooking timer has finished!",
          icon: "/favicon.ico",
        });
      }
    }, [timer.label, hasNotified]);

    // Timer effect with optimized logic
    useEffect(() => {
      let interval: NodeJS.Timeout;

      if (timer.isActive && timer.remaining > 0) {
        interval = setInterval(() => {
          const newRemaining = timer.remaining - 1;
          onUpdate({ ...timer, remaining: newRemaining });

          if (newRemaining === 0) {
            showNotification();
          }
        }, 1000);
      }

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }, [timer.isActive, timer.remaining, timer, onUpdate, showNotification]);

    return (
      <Card className={cardClassName}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="font-medium text-sm sm:text-base truncate flex-1">
              {timer.label}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 h-6 w-6 p-0"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <TimerDisplay remaining={timer.remaining} isFinished={isFinished} />

            <Progress value={progress} className="h-1.5 sm:h-2" />

            <TimerControls
              isActive={timer.isActive}
              isFinished={isFinished}
              onToggle={toggleTimer}
              onReset={resetTimer}
            />
          </div>
        </CardContent>
      </Card>
    );
  }
);

KitchenTimer.displayName = "KitchenTimer";
