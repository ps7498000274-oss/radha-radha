import React, { useState } from "react"
import {
  User,
  Mail,
  Calendar,
  Award,
  Flame,
  Trophy,
  Shield,
  Save,
  KeyRound,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { useJapEntries } from "@/hooks/useJapEntries"
import { useAnalytics } from "@/hooks/useAnalytics"
import { LotusIcon } from "@/components/layout/Header"
import { MILESTONES } from "@/lib/constants"
import { formatIndianNumber, formatDate } from "@/lib/formatters"
import { useToast } from "@/components/ui/use-toast"

export default function Profile() {
  const { user, profile, resetPassword } = useAuth()
  const { updateProfile } = useProfile()
  const { entries } = useJapEntries()
  const analytics = useAnalytics(entries)
  const { toast } = useToast()

  const [displayName, setDisplayName] = useState(
    profile?.display_name || user?.user_metadata?.display_name || ""
  )
  const [dailyGoal, setDailyGoal] = useState<number>(profile?.daily_goal || 10000)
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)

  const email = user?.email || "devotee@radha.org"
  const initials = displayName
    ? displayName.slice(0, 2).toUpperCase()
    : email.slice(0, 2).toUpperCase()

  const memberSince = user?.created_at
    ? formatDate(user.created_at, "dd MMMM yyyy")
    : formatDate(new Date(), "dd MMMM yyyy")

  const completedMilestonesCount = MILESTONES.filter(
    (m) => analytics.allTimeTotalJapCount >= m.count
  ).length

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const { error } = await updateProfile({
        display_name: displayName.trim(),
        daily_goal: Number(dailyGoal),
      })
      if (error) {
        toast({ title: "Failed to update profile", variant: "destructive" })
      } else {
        toast({ title: "Profile Updated 🙏", description: "Your details have been saved." })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleRequestPasswordReset = async () => {
    if (!user?.email) return
    setIsSendingReset(true)
    try {
      const { error } = await resetPassword(user.email)
      if (error) {
        toast({ title: "Failed to send reset link", variant: "destructive" })
      } else {
        toast({
          title: "Password Reset Email Sent",
          description: `Instructions sent to ${user.email}.`,
        })
      }
    } finally {
      setIsSendingReset(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-devotional-gold/40 bg-devotional-gold/10 px-3 py-1 text-xs font-semibold text-devotional-gold mb-2">
          <User className="h-3.5 w-3.5" />
          <span>Devotee Profile</span>
        </div>
        <h1 className="font-devanagari text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          साधक परिचय एवं विवरण
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal sadhana identity and review your spiritual journey milestones.
        </p>
      </div>

      {/* Profile Identity Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-card via-card to-devotional-indigo/5 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <Avatar className="h-24 w-24 border-2 border-devotional-gold shadow-md text-2xl font-bold">
            <AvatarFallback className="bg-devotional-indigo text-white font-serif">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-foreground">
              {displayName || "Devotee"}
            </h2>
            <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              <span>{email}</span>
            </p>
            <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 pt-1">
              <Calendar className="h-3.5 w-3.5 text-devotional-gold" />
              <span>Sadhana Began: {memberSince}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Summary Lifetime Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/80 bg-card p-4 text-center shadow-sm">
          <span className="text-xs text-muted-foreground block">Lifetime Naam</span>
          <p className="text-xl font-extrabold text-devotional-indigo dark:text-devotional-lavender mt-1">
            {formatIndianNumber(analytics.allTimeTotalJapCount)}
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 text-center shadow-sm">
          <span className="text-xs text-muted-foreground block">Active Days</span>
          <p className="text-xl font-extrabold text-foreground mt-1">
            {entries.filter((e) => e.jap_count > 0).length} Days
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 text-center shadow-sm">
          <span className="text-xs text-muted-foreground block">Best Streak</span>
          <p className="text-xl font-extrabold text-foreground mt-1">
            {analytics.streakData.best} Days
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 text-center shadow-sm">
          <span className="text-xs text-muted-foreground block">Milestones Done</span>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">
            {completedMilestonesCount} / {MILESTONES.length}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
        <h3 className="font-bold text-base text-foreground">Edit Devotee Details</h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Devotee Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Radhika Das"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountEmail">Email Address (Read-only)</Label>
            <Input id="accountEmail" value={email} disabled className="bg-muted text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dailyGoal">Daily Jap Goal</Label>
            <Input
              id="dailyGoal"
              type="number"
              min="108"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              required
            />
            <p className="text-xs text-muted-foreground">
              Formatted: {formatIndianNumber(dailyGoal || 0)} Radha Naam
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            className="bg-gradient-to-r from-devotional-indigo to-indigo-600 gap-2 font-semibold"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Saving..." : "Update Profile"}</span>
          </Button>
        </form>
      </div>

      {/* Security & Password Reset */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-devotional-gold" />
          <h3 className="font-bold text-base text-foreground">Security & Password</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Need to change your password? We will deliver a secure, time-limited reset link to your verified email address.
        </p>
        <Button
          variant="outline"
          onClick={handleRequestPasswordReset}
          disabled={isSendingReset}
          className="gap-2"
        >
          <span>{isSendingReset ? "Sending Link..." : "Send Password Reset Email"}</span>
        </Button>
      </div>
    </div>
  )
}
