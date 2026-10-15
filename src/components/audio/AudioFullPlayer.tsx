import React from "react"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Repeat,
  Sparkles,
  Music,
  Info,
  Radio,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useAudio } from "@/contexts/AudioContext"
import { cn } from "@/lib/utils"

export function AudioFullPlayer({ className }: { className?: string }) {
  const {
    isPlaying,
    isMuted,
    volume,
    isLooping,
    duration,
    currentTime,
    autoplayBlocked,
    togglePlay,
    setVolume,
    toggleMute,
    setLoop,
    seek,
    hasError,
  } = useAudio()

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds)) return "00:00"
    const mins = Math.floor(timeInSeconds / 60)
    const secs = Math.floor(timeInSeconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-devotional-gold/30 bg-gradient-to-br from-card via-card/95 to-devotional-indigo/10 p-6 shadow-xl backdrop-blur-md transition-all",
        className
      )}
    >
      {/* Decorative Aura */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-devotional-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-devotional-indigo/10 blur-3xl" />

      {/* Header Info */}
      <div className="relative z-10 mb-6 flex flex-col items-center text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-devotional-gold/40 bg-devotional-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-devotional-gold">
          <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "6s" }} />
          <span>Akhand Naam Jap</span>
        </div>
        <h3 className="font-devanagari text-3xl font-bold tracking-wide text-foreground">
          राधे राधे
        </h3>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          अखंड श्री राधा नाम जप (11,000 Times) — Continuous Devotional Meditation
        </p>
      </div>

      {/* Autoplay Notice */}
      {autoplayBlocked && !isPlaying && (
        <div className="relative z-10 mb-5 flex items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 shrink-0 text-amber-500 animate-pulse" />
            <span>Browser paused autoplay. Click below to begin spiritual audio.</span>
          </div>
          <Button
            size="sm"
            onClick={togglePlay}
            className="h-7 bg-amber-600 px-3 text-xs text-white hover:bg-amber-700"
          >
            Start Audio
          </Button>
        </div>
      )}

      {/* Error state hint */}
      {hasError && (
        <div className="relative z-10 mb-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-700 dark:text-blue-300">
          <div className="flex items-center gap-2 font-medium">
            <Info className="h-4 w-4 shrink-0" />
            <span>Devotional audio ready. Place your custom audio file in <code className="rounded bg-background/80 px-1 py-0.5">public/audio/radha-naam.mp3</code> or set <code className="rounded bg-background/80 px-1 py-0.5">VITE_AUDIO_URL</code>.</span>
          </div>
        </div>
      )}

      {/* Scrubber / Progress Bar */}
      <div className="relative z-10 mb-4 space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span className="font-devanagari text-devotional-gold/80">श्री राधा</span>
          <span>{duration > 0 ? formatTime(duration) : "∞ Loop"}</span>
        </div>
        <div className="relative flex items-center">
          <Slider
            value={[currentTime]}
            max={duration > 0 ? duration : 100}
            step={0.5}
            onValueChange={(val) => val[0] !== undefined && seek(val[0])}
            className="cursor-pointer"
          />
        </div>
      </div>

      {/* Controls Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-2">
        {/* Repeat Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLoop(!isLooping)}
          className={cn(
            "h-10 w-10 rounded-full transition-colors",
            isLooping
              ? "bg-devotional-gold/20 text-devotional-gold hover:bg-devotional-gold/30"
              : "text-muted-foreground hover:text-foreground"
          )}
          title={isLooping ? "Repeat Loop Enabled" : "Repeat Loop Disabled"}
        >
          <Repeat className="h-4 w-4" />
        </Button>

        {/* Play / Pause Main Button */}
        <Button
          onClick={togglePlay}
          size="lg"
          className="h-14 w-14 rounded-full bg-gradient-to-r from-devotional-indigo to-indigo-600 shadow-lg shadow-devotional-indigo/30 transition-all hover:scale-105 hover:from-devotional-indigo hover:to-indigo-500 active:scale-95"
          aria-label={isPlaying ? "Pause Radha Naam Audio" : "Play Radha Naam Audio"}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 text-white" />
          ) : (
            <Play className="ml-1 h-6 w-6 text-white" />
          )}
        </Button>

        {/* Volume & Mute */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground"
            title={isMuted ? "Unmute" : "Mute"}
          >
            <VolumeIcon className="h-4 w-4" />
          </Button>

          <div className="w-24">
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              max={100}
              step={1}
              onValueChange={(val) => {
                if (val[0] !== undefined) {
                  setVolume(val[0] / 100)
                }
              }}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
