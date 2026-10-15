import React, { useState } from "react"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Repeat,
  Music2,
  Sparkles,
  Info,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAudio } from "@/contexts/AudioContext"

export function AudioMiniPlayer() {
  const [showConfigTip, setShowConfigTip] = useState(false)

  // Safe Audio context integration
  const audioContext = useAudio ? useAudio() : null

  const isPlaying = audioContext?.isPlaying ?? false
  const isMuted = audioContext?.isMuted ?? false
  const isLooping = audioContext?.isLooping ?? true
  const volume = audioContext?.volume ?? 0.75
  const currentTime = audioContext?.currentTime ?? 0
  const duration = audioContext?.duration ?? 0
  const trackTitle = "श्री राधा नाम जप — Divine Naam Jap"
  const hasTrack = !audioContext?.hasError

  const handleTogglePlay = () => {
    if (audioContext?.togglePlay) {
      audioContext.togglePlay()
    }
  }

  const handleToggleMute = () => {
    if (audioContext?.toggleMute) {
      audioContext.toggleMute()
    }
  }

  const handleToggleLoop = () => {
    if (audioContext?.setLoop) {
      audioContext.setLoop(!isLooping)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    if (audioContext?.setVolume) {
      audioContext.setVolume(val)
    }
  }

  // Volume icon helper
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <div
      role="region"
      aria-label="Devotional Audio Player"
      className="fixed bottom-0 left-0 right-0 z-40 h-14 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white border-t border-amber-500/25 shadow-2xl backdrop-blur-xl px-3 sm:px-6 flex items-center justify-between select-none"
    >
      {/* Left: Track Information & Sacred Waveform */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1 max-w-xs sm:max-w-md">
        {/* Sacred Lotus / Glow Bead */}
        <div className="relative flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow-inner">
          <Music2 className="w-4 h-4 text-amber-300" />
          {isPlaying && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
          )}
        </div>

        {/* Title and Devanagari Mantra */}
        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="font-devanagari font-bold text-amber-400 text-xs sm:text-sm tracking-wide shrink-0">
              राधे राधे
            </span>
            <span className="hidden sm:inline-block text-[10px] text-amber-300/60">•</span>
            <p className="text-xs font-medium text-slate-200 truncate">
              {trackTitle}
            </p>
          </div>

          {/* Equalizer animation & Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-end gap-0.5 h-3 w-5" aria-hidden="true">
              <span
                className={cn(
                  "w-1 bg-amber-400 rounded-full transition-all duration-300",
                  isPlaying ? "h-3 animate-pulse" : "h-1"
                )}
              />
              <span
                className={cn(
                  "w-1 bg-amber-300 rounded-full transition-all duration-300 delay-75",
                  isPlaying ? "h-2.5 animate-pulse" : "h-1.5"
                )}
              />
              <span
                className={cn(
                  "w-1 bg-amber-400 rounded-full transition-all duration-300 delay-150",
                  isPlaying ? "h-3 animate-pulse" : "h-1"
                )}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-sans hidden md:inline">
              {isPlaying ? "Chanting in progress..." : "Devotional audio stream"}
            </span>
            {!hasTrack && (
              <button
                type="button"
                onClick={() => setShowConfigTip(!showConfigTip)}
                className="text-[10px] text-amber-400/80 hover:text-amber-300 underline flex items-center gap-0.5"
                title="Audio configuration notice"
              >
                <Info className="w-2.5 h-2.5" />
                <span>Stream Info</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Center: Play/Pause Big Button & Loop */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleTogglePlay}
          className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30 ring-2 ring-amber-300/40 transition-transform active:scale-95"
          aria-label={isPlaying ? "Pause chanting" : "Play chanting"}
          title={isPlaying ? "Pause Chant" : "Play Chant"}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-slate-950" />
          ) : (
            <Play className="w-4 h-4 fill-slate-950 translate-x-0.5" />
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleToggleLoop}
          className={cn(
            "w-8 h-8 rounded-lg transition-colors",
            isLooping
              ? "text-amber-400 bg-amber-400/10 hover:bg-amber-400/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          )}
          aria-label={isLooping ? "Continuous loop on" : "Continuous loop off"}
          title={isLooping ? "Continuous Repeat (Infinite Chanting)" : "Repeat Off"}
        >
          <Repeat className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Right: Volume Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleToggleMute}
          className="w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          aria-label={isMuted ? "Unmute" : "Mute"}
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          <VolumeIcon className="w-4 h-4" />
        </Button>

        {/* Small Slider */}
        <div className="hidden sm:flex items-center w-16 md:w-24">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            aria-label="Audio Volume"
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
          />
        </div>
      </div>

      {/* Config notice popover */}
      {showConfigTip && (
        <div className="absolute bottom-16 left-4 right-4 sm:left-6 sm:right-auto sm:w-96 p-4 rounded-xl bg-slate-900 border border-amber-500/40 shadow-2xl text-xs text-slate-300 z-50 animate-fade-in backdrop-blur-md">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="font-semibold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Devotional Audio Configuration
            </span>
            <button
              onClick={() => setShowConfigTip(false)}
              className="text-slate-400 hover:text-white text-sm"
              aria-label="Close message"
            >
              ✕
            </button>
          </div>
          <p className="leading-relaxed text-slate-300 mb-2">
            To stream live Radha Naam Dhun or kirtan audio, add your favorite audio stream URL to the{" "}
            <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded font-mono">
              VITE_AUDIO_URL
            </code>{" "}
            variable in your <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded font-mono">.env</code> file.
          </p>
          <p className="text-[11px] text-slate-400">
            A built-in sacred meditative chime stream is ready to soothe your chanting environment.
          </p>
        </div>
      )}
    </div>
  )
}

export default AudioMiniPlayer
