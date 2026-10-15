import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  Hand,
  RotateCcw,
  Sparkles,
  Award,
  Volume2,
  VolumeX,
  CheckCircle2,
  Calendar,
  Save,
  HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useJapEntries } from "@/hooks/useJapEntries"
import { formatIndianNumber, formatDate } from "@/lib/formatters"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export default function TapCounter() {
  const { user } = useAuth()
  const { entries, addEntry, fetchEntries } = useJapEntries()
  const { toast } = useToast()

  const todayStr = new Date().toISOString().split("T")[0]!
  const storageKey = `radha_tap_counter_${user?.id || "guest"}_${todayStr}`
  const lastDateKey = `radha_tap_last_date_${user?.id || "guest"}`

  // Sound & vibration preference
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem("radha_tap_sound") !== "false"
  })

  // Today's tap count in local state
  const [tapCount, setTapCount] = useState<number>(() => {
    const saved = localStorage.getItem(storageKey)
    return saved ? parseInt(saved, 10) : 0
  })

  // Animation ripple state
  const [isPressing, setIsPressing] = useState<boolean>(false)
  const [rippleEffect, setRippleEffect] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // Audio chime for each 108 malas
  const audioContextRef = useRef<AudioContext | null>(null)

  const playClickSound = useCallback(() => {
    if (!soundEnabled) return
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioContextRef.current
      if (ctx.state === "suspended") {
        ctx.resume()
      }
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(528, ctx.currentTime) // 528Hz Solfeggio frequency
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.12)
    } catch {
      // AudioContext not allowed or not supported
    }
  }, [soundEnabled])

  // Vibration on tap if supported on mobile
  const triggerHaptic = useCallback(() => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15)
      } catch {
        // ignore
      }
    }
  }, [])

  // Auto-save to localStorage whenever count changes
  useEffect(() => {
    localStorage.setItem(storageKey, tapCount.toString())
  }, [tapCount, storageKey])

  // Midnight Auto-Sync: Check if day rolled over
  const checkDayRolloverAndSync = useCallback(async () => {
    const currentDate = new Date().toISOString().split("T")[0]!
    const recordedLastDate = localStorage.getItem(lastDateKey)

    if (recordedLastDate && recordedLastDate !== currentDate) {
      // Day has changed! Retrieve the unsubmitted taps from yesterday
      const yesterdayStorageKey = `radha_tap_counter_${user?.id || "guest"}_${recordedLastDate}`
      const yesterdayTaps = parseInt(localStorage.getItem(yesterdayStorageKey) || "0", 10)

      if (yesterdayTaps > 0) {
        try {
          await addEntry(recordedLastDate, yesterdayTaps, "Auto-saved from Live Tap Counter", false)
          localStorage.removeItem(yesterdayStorageKey)
          toast({
            title: "Day Changed (12:00 AM) — Auto-Saved! 🙏",
            description: `Yesterday's ${formatIndianNumber(yesterdayTaps)} Radha Naam were automatically added to your Sadhana records.`,
          })
          if (fetchEntries) fetchEntries()
        } catch (err) {
          console.error("Failed to auto-save yesterday taps:", err)
        }
      }
      // Reset for today
      setTapCount(0)
    }
    localStorage.setItem(lastDateKey, currentDate)
  }, [addEntry, fetchEntries, lastDateKey, toast, user?.id])

  // Run day-check on mount and every minute
  useEffect(() => {
    checkDayRolloverAndSync()
    const interval = setInterval(checkDayRolloverAndSync, 60000)
    return () => clearInterval(interval)
  }, [checkDayRolloverAndSync])

  // Tap handler
  const handleTap = () => {
    setTapCount((prev) => {
      const next = prev + 1
      // If user reaches 108 multiple, trigger celebratory haptic
      if (next % 108 === 0) {
        if ("vibrate" in navigator) {
          try {
            navigator.vibrate([30, 50, 30])
          } catch {
            // ignore
          }
        }
        toast({
          title: "1 Mala Complete! 📿",
          description: `You have completed ${next / 108} malas (${next} Radha Naam)!`,
        })
      }
      return next
    })

    setIsPressing(true)
    setRippleEffect(true)
    playClickSound()
    triggerHaptic()

    setTimeout(() => setIsPressing(false), 120)
    setTimeout(() => setRippleEffect(false), 400)
  }

  // Keyboard Space/Enter tap support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault()
        handleTap()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleTap])

  // Manual Instant Save button
  const handleManualSaveNow = async () => {
    if (tapCount <= 0) {
      toast({
        title: "No counts to save",
        description: "Tap the counter to chant Radha Naam first.",
      })
      return
    }

    setIsSaving(true)
    try {
      const { error } = await addEntry(
        todayStr,
        tapCount,
        "Saved from Live Digital Tap Counter",
        false
      )

      if (error) {
        toast({
          title: "Save Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Synced to Daily Jap! 🙏",
          description: `${formatIndianNumber(tapCount)} Radha Naam added to today's record (${todayStr}).`,
        })
        // Reset local counter after successfully syncing
        setTapCount(0)
        localStorage.removeItem(storageKey)
        if (fetchEntries) fetchEntries()
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Reset counter
  const handleReset = () => {
    if (tapCount === 0) return
    if (confirm("Are you sure you want to reset today's active tap counter back to 0?")) {
      setTapCount(0)
      localStorage.removeItem(storageKey)
      toast({ title: "Counter reset to 0" })
    }
  }

  // Calculations for Malas
  const malasCompleted = Math.floor(tapCount / 108)
  const currentMalaBead = tapCount % 108

  // Today's total in database
  const todaySavedEntry = entries.find((e) => e.entry_date.split("T")[0] === todayStr)
  const todaySavedCount = todaySavedEntry?.jap_count || 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-devotional-gold/40 bg-devotional-gold/10 px-3 py-1 text-xs font-semibold text-devotional-gold mb-2">
            <Hand className="h-3.5 w-3.5" />
            <span>Live Digital Mala Counter</span>
          </div>
          <h1 className="font-devanagari text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            लाइव नाम जप काउंटर (Digital Mala)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Har naam bolne par screen par tap karein. Raat 12 baje ye automatic aapke us din ke naam jap me jud jayega!
          </p>
        </div>

        {/* Sound toggle & Info */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const next = !soundEnabled
              setSoundEnabled(next)
              localStorage.setItem("radha_tap_sound", String(next))
            }}
            className="h-8 gap-1.5 text-xs border-border"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Sound On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Mute</span>
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={tapCount === 0}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      {/* Main Counter Arena */}
      <div className="relative overflow-hidden rounded-3xl border border-devotional-gold/40 bg-gradient-to-b from-card via-card to-devotional-indigo/10 p-6 sm:p-10 shadow-2xl text-center space-y-8">
        
        {/* Decorative Lotus Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-devotional-gold/15 blur-3xl" />

        {/* Current Mala & Beads status */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <div className="flex items-center gap-2 bg-muted/60 px-4 py-1.5 rounded-full border border-border/80">
            <span className="text-devotional-gold">📿 Malas:</span>
            <span className="text-foreground text-sm font-bold">{malasCompleted}</span>
          </div>

          <div className="flex items-center gap-2 bg-muted/60 px-4 py-1.5 rounded-full border border-border/80">
            <span className="text-devotional-gold">Bead (दाना):</span>
            <span className="text-foreground text-sm font-bold">{currentMalaBead} / 108</span>
          </div>

          <div className="flex items-center gap-2 bg-muted/60 px-4 py-1.5 rounded-full border border-border/80">
            <span className="text-emerald-500">Already Saved Today:</span>
            <span className="text-foreground text-sm font-bold">{formatIndianNumber(todaySavedCount)}</span>
          </div>
        </div>

        {/* Sacred Tap Button */}
        <div className="relative z-10 flex flex-col items-center justify-center py-4">
          <button
            type="button"
            onClick={handleTap}
            className={cn(
              "relative flex flex-col items-center justify-center w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-devotional-gold/60 shadow-2xl transition-all duration-150 cursor-pointer focus:outline-none focus:ring-4 focus:ring-devotional-gold/50 active:scale-95",
              isPressing
                ? "bg-gradient-to-br from-amber-500/30 via-indigo-600/40 to-slate-900 scale-95"
                : "bg-gradient-to-br from-indigo-900/40 via-card to-amber-500/10 hover:border-devotional-gold hover:shadow-devotional-gold/20"
            )}
            style={{
              boxShadow: isPressing
                ? "0 0 45px rgba(245, 158, 11, 0.4), inset 0 0 25px rgba(245, 158, 11, 0.3)"
                : "0 10px 40px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Animated Ripple Wave */}
            {rippleEffect && (
              <span className="absolute inset-0 rounded-full border-2 border-devotional-gold animate-ping opacity-75" />
            )}

            <span className="text-xs font-semibold tracking-widest uppercase text-devotional-gold mb-1">
              Tap To Chant
            </span>

            <span className="font-devanagari text-4xl sm:text-5xl font-extrabold text-foreground tracking-wide drop-shadow-sm my-1">
              राधे राधे
            </span>

            {/* Big Counter Display */}
            <span className="text-4xl sm:text-5xl font-black text-amber-400 font-mono tracking-tight mt-1">
              {formatIndianNumber(tapCount)}
            </span>

            <span className="text-[11px] text-muted-foreground mt-2">
              (Ya Keyboard par Space दबाएं)
            </span>
          </button>
        </div>

        {/* Auto-sync Notification Info Banner */}
        <div className="relative z-10 mx-auto max-w-xl rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-3 text-left">
          <Calendar className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">⏰ 12:00 AM Midnight Auto-Sync Active:</p>
            <p className="text-[11px] leading-relaxed opacity-90">
              Aapko baar-baar save karne ki zaroorat nahi hai. Raat 12 baje jaise hi din badlega, aapke dwara tap kiya hua ye poora count aapke us din ke Naam Jap me automatically save ho jayega.
            </p>
          </div>
        </div>

        {/* Action Button: Manual Sync Now */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Button
            size="lg"
            onClick={handleManualSaveNow}
            disabled={tapCount === 0 || isSaving}
            className="w-full sm:w-auto bg-gradient-to-r from-devotional-indigo to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold gap-2 px-8 shadow-lg"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Saving..." : "Save Today's Taps Now (तुरंत जोड़ें)"}</span>
          </Button>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-1.5 shadow-sm">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>1 Mala = 108 Naam</span>
          </span>
          <p className="text-muted-foreground">
            Har 108 tap poore hone par special sound aur vibration se alert milega.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1.5 shadow-sm">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <Hand className="w-3.5 h-3.5 text-indigo-400" />
            <span>Anywhere Tap</span>
          </span>
          <p className="text-muted-foreground">
            Mobile par screen button par tap karein ya laptop par <strong>Spacebar</strong> press karke bina dekhe jap karein.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1.5 shadow-sm">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Data Loss</span>
          </span>
          <p className="text-muted-foreground">
            Agar aap page refresh karein ya band bhi kar dein, aapka count browser memory me bilkul safe rahega.
          </p>
        </div>
      </div>
    </div>
  )
}
