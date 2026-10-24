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
  RotateCcw,
  RotateCw,
  Radio,
} from "lucide-react"
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
  } = useAudio()

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds) || timeInSeconds < 0) return "00:00"
    const mins = Math.floor(timeInSeconds / 60)
    const secs = Math.floor(timeInSeconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleSkipBack = () => {
    seek(Math.max(0, currentTime - 15))
  }

  const handleSkipForward = () => {
    seek(Math.min(duration > 0 ? duration : 10800, currentTime + 15))
  }

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <div
      role="region"
      aria-label="Devotional Music Player"
      className={cn(
        "relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900/95 via-indigo-950/80 to-slate-900/95 p-5 sm:p-8 shadow-2xl backdrop-blur-xl text-white select-none transition-all",
        className
      )}
    >
      {/* Decorative Golden Aura Glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />

      {/* Header Info */}
      <div className="relative z-10 mb-6 flex flex-col items-center text-center">
        {/* Sacred Badge */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-amber-300 shadow-inner">
          <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin" style={{ animationDuration: "8s" }} />
          <span>अखंड श्री राधा नाम जाप • 11,000 Chants</span>
        </div>

        {/* Sacred Title */}
        <h3 className="font-devanagari text-4xl sm:text-5xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-200 drop-shadow-md">
          राधे राधे
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm font-medium text-slate-300 max-w-md">
          11,000 Continuous Devotional Chants — Akhand Sadhana Meditation
        </p>

        {/* Live Audio Status Indicator */}
        <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
          {isPlaying ? (
            <>
              {/* Dancing sound bars */}
              <div className="flex items-end gap-0.5 h-3 w-4" aria-hidden="true">
                <span className="w-1 bg-amber-400 rounded-full h-3 animate-pulse" />
                <span className="w-1 bg-amber-300 rounded-full h-2 animate-pulse delay-75" />
                <span className="w-1 bg-amber-400 rounded-full h-3 animate-pulse delay-150" />
              </div>
              <span className="text-amber-300 font-medium">नाम संकीर्तन चालू है • Playing</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-amber-400/60" />
              <span className="text-slate-400">संगीत रुका हुआ है • Click Play to Listen</span>
            </>
          )}
        </div>
      </div>

      {/* Browser Autoplay Notice */}
      {autoplayBlocked && !isPlaying && (
        <div className="relative z-10 mb-5 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-amber-400/50 bg-amber-500/15 p-3.5 text-xs text-amber-200 shadow-md">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Radio className="h-4 w-4 shrink-0 text-amber-400 animate-pulse" />
            <span>ब्राउज़र ने ऑटो-प्ले रोका हुआ है — नाम जाप शुरू करने के लिए Play दबाएं।</span>
          </div>
          <button
            type="button"
            onClick={togglePlay}
            className="w-full sm:w-auto h-8 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            Play Now
          </button>
        </div>
      )}

      {/* Scrubber / Progress Slider */}
      <div className="relative z-10 mb-6 space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-400 px-1">
          <span className="font-mono text-amber-300/90">{formatTime(currentTime)}</span>
          <span className="font-devanagari text-amber-400/70 text-[11px] tracking-wider">
            {isPlaying ? "श्री राधा कृपा कटाक्ष" : "अखंड साधना"}
          </span>
          <span className="font-mono text-slate-400">
            {duration > 0 ? formatTime(duration) : "∞ Loop"}
          </span>
        </div>

        <Slider
          aria-label="Seek audio position"
          value={[currentTime]}
          max={duration > 0 ? duration : 100}
          step={0.5}
          onValueChange={(val) => val[0] !== undefined && seek(val[0])}
          className="cursor-pointer"
        />
      </div>

      {/* Redesigned Controls Bar (Mobile & Desktop Friendly) */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-4 pt-1">
        {/* Left Secondary Controls: Rewind & Loop */}
        <div className="flex items-center gap-3 order-2 sm:order-1">
          {/* Loop / Repeat Toggle */}
          <button
            type="button"
            onClick={() => setLoop(!isLooping)}
            aria-label={isLooping ? "Repeat Loop Enabled" : "Repeat Loop Disabled"}
            className={cn(
              "h-11 w-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer border",
              isLooping
                ? "bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-sm shadow-amber-500/20"
                : "bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10"
            )}
            title={isLooping ? "Repeat Loop Enabled" : "Repeat Loop Disabled"}
          >
            <Repeat className="h-4 w-4" />
          </button>

          {/* 15s Rewind */}
          <button
            type="button"
            onClick={handleSkipBack}
            aria-label="Rewind 15 seconds"
            className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-amber-300 hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
            title="Rewind 15 seconds"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Center: Hero Play / Pause Button with Pulsing Halo */}
        <div className="flex flex-col items-center gap-1.5 order-1 sm:order-2">
          <div className="relative flex items-center justify-center">
            {/* Animated Ping Ring when Playing */}
            {isPlaying && (
              <span className="absolute -inset-1.5 rounded-full bg-amber-400/40 animate-ping opacity-60 pointer-events-none" />
            )}

            {/* Glowing Accent Ring */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause Radha Naam Audio" : "Play Radha Naam Audio"}
              className="relative z-10 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 shadow-xl shadow-amber-500/40 hover:shadow-amber-500/60 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center p-0 border-2 border-amber-200/80 ring-4 ring-amber-400/20 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 sm:h-9 sm:w-9 fill-slate-950 text-slate-950" />
              ) : (
                <Play className="h-8 w-8 sm:h-9 sm:w-9 fill-slate-950 text-slate-950 translate-x-0.5" />
              )}
            </button>
          </div>

          {/* Action text label below button */}
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300/90 font-sans">
            {isPlaying ? "Pause • रोकें" : "Play • सुनें"}
          </span>
        </div>

        {/* Right Secondary Controls: Fast Forward & Volume */}
        <div className="flex items-center gap-3 order-3">
          {/* 15s Forward */}
          <button
            type="button"
            onClick={handleSkipForward}
            aria-label="Forward 15 seconds"
            className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-amber-300 hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
            title="Skip forward 15 seconds"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          {/* Mute Button */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-amber-300 hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            <VolumeIcon className="h-4 w-4" />
          </button>

          {/* Volume Slider (Compact, responsive) */}
          <div className="w-20 sm:w-24">
            <Slider
              aria-label="Volume level"
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
