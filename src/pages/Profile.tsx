import React, { useState, useRef } from "react"
import {
  User,
  Mail,
  Calendar,
  Save,
  KeyRound,
  Camera,
  Trash2,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { useJapEntries } from "@/hooks/useJapEntries"
import { useAnalytics } from "@/hooks/useAnalytics"
import { MILESTONES } from "@/lib/constants"
import { formatIndianNumber, formatDate } from "@/lib/formatters"
import { useToast } from "@/components/ui/use-toast"

export default function Profile() {
  const { user, profile, resetPassword } = useAuth()
  const { updateProfile } = useProfile()
  const { entries } = useJapEntries()
  const analytics = useAnalytics(entries)
  const { toast } = useToast()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState(
    profile?.display_name || user?.user_metadata?.display_name || ""
  )
  const [dailyGoal, setDailyGoal] = useState<number>(profile?.daily_goal || 10000)
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    return (
      profile?.avatar_url ||
      (user?.id ? localStorage.getItem(`radha_avatar_${user.id}`) : null) ||
      (user as any)?.user_metadata?.avatar_url ||
      ""
    )
  })
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

  // Handle uploading and compressing avatar image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Max file size 3MB
    if (file.size > 3 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 3MB.",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        // Compress image to 256x256 max
        const canvas = document.createElement("canvas")
        const maxSize = 256
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width)
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height)
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          const base64Url = canvas.toDataURL("image/jpeg", 0.85)
          setAvatarUrl(base64Url)
          if (user?.id) {
            localStorage.setItem(`radha_avatar_${user.id}`, base64Url)
          }
          toast({
            title: "Photo Selected",
            description: "Click 'Update Profile' below to permanently save your photo.",
          })
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setAvatarUrl("")
    if (user?.id) {
      localStorage.removeItem(`radha_avatar_${user.id}`)
    }
    toast({
      title: "Photo Removed",
      description: "Default devotional monogram will be shown.",
    })
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (user?.id) {
        if (avatarUrl) {
          localStorage.setItem(`radha_avatar_${user.id}`, avatarUrl)
        } else {
          localStorage.removeItem(`radha_avatar_${user.id}`)
        }
      }

      const { error } = await updateProfile({
        display_name: displayName.trim(),
        daily_goal: Number(dailyGoal),
        avatar_url: avatarUrl || null,
      })
      if (error) {
        toast({ title: "Failed to update profile", variant: "destructive" })
      } else {
        toast({ title: "Profile Updated 🙏", description: "Your details and photo have been saved." })
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
          Manage your personal sadhana identity, profile photo, and review your spiritual journey milestones.
        </p>
      </div>

      {/* Profile Identity Card with Photo Upload */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-card via-card to-devotional-indigo/5 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          
          {/* Avatar with Camera Trigger */}
          <div className="relative group">
            <Avatar className="h-28 w-28 border-4 border-devotional-gold shadow-lg text-2xl font-bold overflow-hidden bg-devotional-indigo/20">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-devotional-indigo text-white font-serif text-3xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Change photo button overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer"
              title="Upload new picture"
            >
              <Camera className="h-6 w-6 mb-1 text-amber-300" />
              <span className="text-[10px] font-semibold">Change</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            aria-label="Upload devotee profile avatar"
            className="hidden"
            onChange={handleImageUpload}
          />

          <div className="space-y-1 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold text-foreground">
                  {displayName || "Devotee"}
                </h2>
                <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{email}</span>
                </p>
              </div>

              {/* Photo Action Buttons */}
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 gap-1.5 text-xs border-devotional-gold/40 hover:bg-devotional-gold/10"
                >
                  <Upload className="h-3.5 w-3.5 text-devotional-gold" />
                  <span>{avatarUrl ? "Change Photo" : "Upload Photo"}</span>
                </Button>

                {avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </Button>
                )}
              </div>
            </div>

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
