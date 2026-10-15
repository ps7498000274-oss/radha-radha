import React, { useState } from "react"
import {
  Settings as SettingsIcon,
  Volume2,
  Bell,
  Globe,
  Sun,
  Moon,
  Laptop,
  Shield,
  Download,
  Trash2,
  AlertTriangle,
  Save,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { useAudio } from "@/contexts/AudioContext"
import { useSettings } from "@/hooks/useSettings"
import { useProfile } from "@/hooks/useProfile"
import { useJapEntries } from "@/hooks/useJapEntries"
import { formatIndianNumber } from "@/lib/formatters"
import { COMMON_TIMEZONES } from "@/lib/constants"
import { useToast } from "@/components/ui/use-toast"

export default function Settings() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const {
    volume,
    setVolume,
    isLooping,
    setLoop,
    isPlaying,
    togglePlay,
  } = useAudio()
  const { settings, updateSettings } = useSettings()
  const { profile, updateDailyGoal, updateTimezone } = useProfile()
  const { entries } = useJapEntries()
  const { toast } = useToast()

  // Form local state
  const [goalInput, setGoalInput] = useState<number>(profile?.daily_goal || 10000)
  const [selectedTz, setSelectedTz] = useState<string>(profile?.timezone || "Asia/Kolkata")
  const [reminderTime, setReminderTime] = useState<string>(
    settings?.daily_reminder_time || "06:00"
  )
  const [isSavingGoal, setIsSavingGoal] = useState(false)
  const [isSavingTz, setIsSavingTz] = useState(false)

  // Save Daily Goal
  const handleSaveGoal = async () => {
    setIsSavingGoal(true)
    try {
      const { error } = await updateDailyGoal(Number(goalInput))
      if (error) {
        toast({ title: "Failed to update daily goal", variant: "destructive" })
      } else {
        toast({ title: "Daily Goal Saved 🙏", description: `${formatIndianNumber(goalInput)} Radha Naam.` })
      }
    } finally {
      setIsSavingGoal(false)
    }
  }

  // Save Timezone
  const handleSaveTimezone = async () => {
    setIsSavingTz(true)
    try {
      const { error } = await updateTimezone(selectedTz)
      if (error) {
        toast({ title: "Failed to update timezone", variant: "destructive" })
      } else {
        toast({ title: "Timezone Updated", description: selectedTz })
      }
    } finally {
      setIsSavingTz(false)
    }
  }

  // Export Data CSV
  const handleExportCSV = () => {
    if (entries.length === 0) return
    const headers = "Date,Naam Jap Count,Notes,Created At\n"
    const rows = entries
      .map(
        (e) =>
          `"${e.entry_date}",${e.jap_count},"${(e.notes || "").replace(/"/g, '""')}","${e.created_at}"`
      )
      .join("\n")

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `radha_radha_backup_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: "Sadhana Data Exported as CSV" })
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-devotional-gold/40 bg-devotional-gold/10 px-3 py-1 text-xs font-semibold text-devotional-gold mb-2">
          <SettingsIcon className="h-3.5 w-3.5" />
          <span>Sadhana Preferences</span>
        </div>
        <h1 className="font-devanagari text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          प्राथमिकताएं एवं सेटिंग्स
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your daily sadhana goal, audio environment, theme, and data management.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. DAILY GOAL SETTING */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-devotional-indigo/10 flex items-center justify-center text-devotional-indigo dark:text-devotional-lavender">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Daily Naam Jap Goal</h2>
              <p className="text-xs text-muted-foreground">
                Your daily progress ring and pace forecasts compare against this target
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
            <div className="relative w-full sm:w-64">
              <Input
                type="number"
                min="108"
                max="1000000"
                value={goalInput}
                onChange={(e) => setGoalInput(Number(e.target.value))}
                className="font-bold text-base"
              />
            </div>
            <Button
              onClick={handleSaveGoal}
              disabled={isSavingGoal}
              className="w-full sm:w-auto bg-gradient-to-r from-devotional-indigo to-indigo-600 gap-2"
            >
              <Save className="h-4 w-4" />
              <span>{isSavingGoal ? "Saving..." : "Save Goal"}</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Current: <strong>{formatIndianNumber(profile?.daily_goal || 10000)}</strong> Radha Naam / day
          </p>
        </div>

        {/* 2. AUDIO PREFERENCES */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-devotional-gold/10 flex items-center justify-center text-devotional-gold">
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Devotional Audio Playback</h2>
              <p className="text-xs text-muted-foreground">
                Continuous sacred background chant while navigating between app pages
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {/* Volume */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Playback Volume</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={(val) => val[0] !== undefined && setVolume(val[0] / 100)}
              />
            </div>

            {/* Loop Toggle */}
            <div className="flex items-center justify-between border-t border-border/50 pt-3">
              <div>
                <Label className="text-sm font-semibold">Continuous Infinite Loop</Label>
                <p className="text-xs text-muted-foreground">
                  Seamlessly replay the Radha Naam recording without stopping
                </p>
              </div>
              <Switch checked={isLooping} onCheckedChange={setLoop} />
            </div>

            {/* Test Play */}
            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={togglePlay}>
                {isPlaying ? "Pause Test Audio" : "Test Play Radha Naam"}
              </Button>
            </div>
          </div>
        </div>

        {/* 3. APPEARANCE & THEME */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Visual Theme</h2>
              <p className="text-xs text-muted-foreground">
                Select your preferred sacred visual atmosphere
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-3 rounded-xl border text-center transition-all ${
                theme === "light"
                  ? "border-devotional-indigo bg-devotional-indigo/10 shadow-xs"
                  : "border-border/60 hover:border-border"
              }`}
            >
              <Sun className="h-5 w-5 mx-auto mb-1 text-amber-500" />
              <span className="text-xs font-semibold block">Devotional Cream</span>
              <span className="text-[10px] text-muted-foreground">Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-3 rounded-xl border text-center transition-all ${
                theme === "dark"
                  ? "border-devotional-indigo bg-devotional-indigo/10 shadow-xs"
                  : "border-border/60 hover:border-border"
              }`}
            >
              <Moon className="h-5 w-5 mx-auto mb-1 text-indigo-400" />
              <span className="text-xs font-semibold block">Midnight Navy</span>
              <span className="text-[10px] text-muted-foreground">Dark Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`p-3 rounded-xl border text-center transition-all ${
                theme === "system"
                  ? "border-devotional-indigo bg-devotional-indigo/10 shadow-xs"
                  : "border-border/60 hover:border-border"
              }`}
            >
              <Laptop className="h-5 w-5 mx-auto mb-1 text-slate-400" />
              <span className="text-xs font-semibold block">System Sync</span>
              <span className="text-[10px] text-muted-foreground">Auto</span>
            </button>
          </div>
        </div>

        {/* 4. TIMEZONE */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Timezone</h2>
              <p className="text-xs text-muted-foreground">
                Accurately maps daily streaks and midnight resets according to your geographic location
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
            <select
              value={selectedTz}
              onChange={(e) => setSelectedTz(e.target.value)}
              className="w-full sm:w-80 h-10 px-3 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <Button
              onClick={handleSaveTimezone}
              disabled={isSavingTz}
              className="w-full sm:w-auto bg-gradient-to-r from-devotional-indigo to-indigo-600 gap-2"
            >
              <span>{isSavingTz ? "Saving..." : "Save Timezone"}</span>
            </Button>
          </div>
        </div>

        {/* 5. DATA MANAGEMENT & ACCOUNT */}
        <div className="rounded-2xl border border-destructive/20 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Data Ownership & Security</h2>
              <p className="text-xs text-muted-foreground">
                Export your sacred history or manage your account
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button variant="outline" onClick={handleExportCSV} className="gap-2">
              <Download className="h-4 w-4" />
              <span>Export All Sadhana Data (CSV)</span>
            </Button>

            <Button
              variant="destructive"
              onClick={() => signOut()}
              className="gap-2"
            >
              <span>Sign Out of Account</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
