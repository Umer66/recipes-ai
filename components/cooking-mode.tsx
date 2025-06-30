"use client";

import { useState } from "react";
import { Recipe, Timer } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Timer as TimerIcon,
  CheckCircle,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { KitchenTimer } from "@/components/kitchen-timer";
import { extractTimeFromInstruction } from "@/lib/recipe-utils";

interface CookingModeProps {
  recipe: Recipe;
  onExit: () => void;
  timers: Timer[];
  setTimers: (timers: Timer[]) => void;
}

export function CookingMode({
  recipe,
  onExit,
  timers,
  setTimers,
}: CookingModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const instruction = recipe.instructions[currentStep];
  const hasTimer = extractTimeFromInstruction(instruction.description);
  const progress = ((currentStep + 1) / recipe.instructions.length) * 100;

  const goToStep = (stepIndex: number) => {
    setCurrentStep(
      Math.max(0, Math.min(stepIndex, recipe.instructions.length - 1))
    );
  };

  const markStepComplete = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (currentStep < recipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const addTimer = () => {
    const timeInMinutes = extractTimeFromInstruction(instruction.description);
    if (!timeInMinutes) return;

    const newTimer: Timer = {
      id: crypto.randomUUID(),
      label: `Step ${instruction.step}`,
      duration: timeInMinutes * 60,
      remaining: timeInMinutes * 60,
      isActive: false,
    };

    setTimers([...timers, newTimer]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile-optimized Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-30 flex-shrink-0 shadow-sm">
        <div className="w-full max-w-none px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">
                {recipe.recipeName}
              </h1>
              <p className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {recipe.instructions.length}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={onExit}
              className="flex-shrink-0 h-11 w-11 p-0 rounded-full"
              aria-label="Exit cooking mode"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-4 py-4 lg:py-6">
          <div className="h-full flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Main Instruction Area */}
            <div className="lg:col-span-2 flex flex-col gap-4 lg:gap-6 min-h-0">
              {/* Current Step Card */}
              <Card className="flex-shrink-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center font-bold text-sm sm:text-base text-primary-foreground flex-shrink-0">
                        {instruction.step}
                      </div>
                      <span className="text-base sm:text-lg lg:text-xl font-semibold truncate">
                        Step {instruction.step}
                      </span>
                    </div>
                    {completedSteps.has(currentStep) && (
                      <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-4 sm:p-6 rounded-lg">
                    <p className="text-base sm:text-lg leading-relaxed break-words">
                      {instruction.description}
                    </p>
                  </div>

                  {/* Mobile-optimized Action Buttons */}
                  <div className="flex flex-col gap-3">
                    {/* Navigation Buttons - Optimized for mobile */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => goToStep(currentStep - 1)}
                        disabled={currentStep === 0}
                        className="h-12 text-sm font-medium"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => goToStep(currentStep + 1)}
                        disabled={
                          currentStep === recipe.instructions.length - 1
                        }
                        className="h-12 text-sm font-medium"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>

                    {/* Timer Button - Full width on mobile for better touch target */}
                    {hasTimer && (
                      <Button
                        variant="outline"
                        onClick={addTimer}
                        className="h-12 w-full text-sm font-medium"
                      >
                        <TimerIcon className="w-4 h-4 mr-2" />
                        Start Timer ({hasTimer} min)
                      </Button>
                    )}

                    {/* Complete Step Button - Prominent on mobile */}
                    <Button
                      onClick={markStepComplete}
                      disabled={completedSteps.has(currentStep)}
                      className="h-14 w-full text-base font-semibold bg-primary hover:bg-primary/90"
                      size="lg"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {completedSteps.has(currentStep)
                        ? "Step Completed"
                        : "Mark Complete"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Step Navigation */}
              <Card className="block sm:hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MoreHorizontal className="w-4 h-4" />
                    Quick Navigation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex overflow-x-auto gap-2 pb-2">
                    {recipe.instructions.map((inst, index) => (
                      <button
                        key={inst.step}
                        onClick={() => goToStep(index)}
                        className={`flex-shrink-0 w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                          index === currentStep
                            ? "border-primary bg-primary text-primary-foreground"
                            : completedSteps.has(index)
                            ? "border-success bg-success/10 text-success"
                            : "border-border bg-background text-muted-foreground hover:bg-muted"
                        }`}
                        aria-label={`Go to step ${inst.step}`}
                      >
                        {inst.step}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Desktop Step Navigation */}
              <Card className="hidden sm:block flex-1 min-h-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm sm:text-base lg:text-lg">
                    All Steps
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full overflow-y-auto">
                  <div className="space-y-2">
                    {recipe.instructions.map((inst, index) => (
                      <button
                        key={inst.step}
                        onClick={() => goToStep(index)}
                        className={`w-full p-3 sm:p-4 text-left rounded-lg border-2 transition-colors ${
                          index === currentStep
                            ? "border-primary bg-primary/10 text-primary"
                            : completedSteps.has(index)
                            ? "border-success bg-success/10 text-success"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        }`}
                        aria-label={`Step ${
                          inst.step
                        }: ${inst.description.substring(0, 50)}...`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                              index === currentStep
                                ? "bg-primary text-primary-foreground"
                                : completedSteps.has(index)
                                ? "bg-success text-success-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {inst.step}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm mb-1">
                              Step {inst.step}
                              {completedSteps.has(index) && (
                                <CheckCircle className="w-4 h-4 inline ml-2" />
                              )}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {inst.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timer Sidebar */}
            <div className="lg:col-span-1 flex flex-col gap-4 lg:gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Kitchen Timers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {timers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No active timers
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {timers.map((timer) => (
                        <KitchenTimer
                          key={timer.id}
                          timer={timer}
                          onUpdate={(updatedTimer) => {
                            setTimers(
                              timers.map((t) =>
                                t.id === timer.id ? updatedTimer : t
                              )
                            );
                          }}
                          onRemove={() => {
                            setTimers(timers.filter((t) => t.id !== timer.id));
                          }}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
