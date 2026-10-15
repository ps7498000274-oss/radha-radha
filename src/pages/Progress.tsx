import React, { useState } from "react"
import {
  Award,
  Sparkles,
  Target,
  CheckCircle2,
  Calendar,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useJapEntries } from "@/hooks/useJapEntries"
import { useTargets } from "@/hooks/useTargets"
import { useAuth } from "@/contexts/AuthContext"
import { useAnalytics } from "@/hooks/useAnalytics"
import { LotusIcon } from "@/components/layout/Header"
import { MILESTONES } from "@/lib/constants"
import {
  formatIndianNumber,
  formatCompactNumber,
  formatPercentage,
  formatDate,
} from "@/lib/formatters"
import { calculateMilestoneProgress, calculateEstimatedCompletion } from "@/lib/calculations"
import { useToast } from "@/components/ui/use-toast"

export default function ProgressPage() {
  const { entries } = useJapEntries()
  const {
    targets,
    activeTarget,
    customTargets,
    setActiveTarget,
    createCustomTarget,
    deleteTarget,
  } = useTargets()
  const { profile } = useAuth()
  const { toast } = useToast()

  const analytics = useAnalytics(entries, {
    targetCount: activeTarget?.target_count,
    dailyGoal: profile?.daily_goal,
    timezone: profile?.timezone,
  })

  // Custom Target Dialog State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [customTitle, setCustomTitle] = useState("")
  const [customCount, setCustomCount] = useState<number>(100000)
  const [isCreating, setIsCreating] = useState(false)

  // Target to delete
  const [targetToDelete, setTargetToDelete] = useState<string | null>(null)

  const lifetimeTotal = analytics.allTimeTotalJapCount
  const pace = analytics.avgPerActiveDay > 0 ? analytics.avgPerActiveDay : profile?.daily_goal || 10000

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customTitle.trim() || customCount <= 0) return

    setIsCreating(true)
    try {
      const { error } = await createCustomTarget(customTitle.trim(), Number(customCount))
      if (error) {
        toast({
          title: "Failed to create target",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Custom Target Created",
          description: `Created "${customTitle}" for ${formatIndianNumber(customCount)} Radha Naam.`,
        })
        setCustomTitle("")
        setCustomCount(100000)
        setDialogOpen(false)
      }
    } catch (err: any) {
      toast({
        title: "Error creating target",
        description: err?.message,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteTarget = async () => {
    if (!targetToDelete) return
    try {
      const { error } = await deleteTarget(targetToDelete)
      if (error) {
        toast({
          title: "Failed to delete target",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({ title: "Custom Target Removed" })
      }
    } finally {
      setTargetToDelete(null)
    }
  }

  const handleSetActive = async (targetId: string, title: string) => {
    try {
      await setActiveTarget(targetId)
      toast({
        title: "Active Target Updated",
        description: `Now focusing on "${title}".`,
      })
    } catch (err: any) {
      toast({
        title: "Error setting active target",
        description: err?.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-devotional-gold/40 bg-devotional-gold/10 px-3 py-1 text-xs font-semibold text-devotional-gold mb-2">
            <Award className="h-3.5 w-3.5" />
            <span>Spiritual Milestones & Goals</span>
          </div>
          <h1 className="font-devanagari text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            साधना लक्ष्य एवं प्रगति
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your cumulative lifetime milestones: 1 Crore, 3 Crore, 5 Crore, and 12 Crore.
          </p>
        </div>

        {/* Create Custom Target Modal Trigger */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-devotional-indigo to-indigo-600 gap-2 font-bold shadow-md">
              <Plus className="h-4 w-4" />
              <span>Create Custom Target</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif">Create New Sadhana Target</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCustom} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="target_title">Target Title</Label>
                <Input
                  id="target_title"
                  placeholder="e.g. Purushottam Maas Anushthan, 25 Lakh"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_count">Target Count (Total Naam)</Label>
                <Input
                  id="target_count"
                  type="number"
                  min="108"
                  value={customCount}
                  onChange={(e) => setCustomCount(Number(e.target.value))}
                  required
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: "5,000 (5K)", val: 5000 },
                    { label: "50,000 (50K)", val: 50000 },
                    { label: "1 Lakh", val: 100000 },
                    { label: "25 Lakh", val: 2500000 },
                    { label: "50 Lakh", val: 5000000 },
                    { label: "1 Crore", val: 10000000 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setCustomCount(preset.val)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        customCount === preset.val
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 hover:bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Formatted: {formatIndianNumber(customCount || 0)}
                </p>
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Saving..." : "Create Target"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ACTIVE TARGET FEATURED CARD */}
      {activeTarget && (
        <div className="relative overflow-hidden rounded-3xl border border-devotional-gold/40 bg-gradient-to-br from-card via-card to-devotional-gold/5 p-6 sm:p-8 shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-devotional-gold/15 blur-3xl" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-devotional-gold">
                  Currently Active Target
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
                  {activeTarget.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Target: <strong>{formatIndianNumber(activeTarget.target_count)}</strong> Radha Naam
                </p>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-3xl sm:text-4xl font-extrabold text-devotional-indigo dark:text-devotional-lavender">
                  {formatPercentage(
                    Math.min(100, (lifetimeTotal / activeTarget.target_count) * 100),
                    1
                  )}
                </span>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress
                value={Math.min(100, (lifetimeTotal / activeTarget.target_count) * 100)}
                className="h-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>Completed: {formatIndianNumber(lifetimeTotal)}</span>
                <span>
                  Remaining:{" "}
                  {formatIndianNumber(Math.max(0, activeTarget.target_count - lifetimeTotal))}
                </span>
              </div>
            </div>

            {/* Estimation Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              <div className="rounded-xl border border-border/80 bg-muted/30 p-3 text-xs">
                <span className="text-muted-foreground block">Active Daily Pace</span>
                <strong className="text-sm text-foreground">
                  {formatIndianNumber(pace)} / day
                </strong>
              </div>

              {(() => {
                const rem = Math.max(0, activeTarget.target_count - lifetimeTotal)
                const est = calculateEstimatedCompletion(rem, pace)
                return (
                  <>
                    <div className="rounded-xl border border-border/80 bg-muted/30 p-3 text-xs">
                      <span className="text-muted-foreground block">Estimated Days Left</span>
                      <strong className="text-sm text-foreground">
                        {rem === 0
                          ? "Target Reached!"
                          : est
                          ? `${formatIndianNumber(est.days)} Days`
                          : "—"}
                      </strong>
                    </div>

                    <div className="rounded-xl border border-border/80 bg-muted/30 p-3 text-xs">
                      <span className="text-muted-foreground block">Projected Completion</span>
                      <strong className="text-sm text-foreground">
                        {rem === 0
                          ? "Completed ✅"
                          : est
                          ? formatDate(est.date, "dd MMMM yyyy")
                          : "Need more data"}
                      </strong>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* CORE 4 LIFETIME MILESTONES */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <LotusIcon className="h-5 w-5 text-devotional-gold" />
          <span>Core Lifetime Milestones (1 Cr — 12 Cr)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MILESTONES.map((m) => {
            const prog = calculateMilestoneProgress(lifetimeTotal, m.count)
            const isCompleted = prog.completed >= m.count
            const rem = Math.max(0, m.count - lifetimeTotal)
            const est = calculateEstimatedCompletion(rem, pace)
            const isActive = activeTarget?.title === m.name

            return (
              <div
                key={m.name}
                className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4 hover:border-devotional-gold/40 transition-colors"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-devotional-indigo/10 flex items-center justify-center text-devotional-indigo dark:text-devotional-lavender font-serif font-bold">
                      <LotusIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-foreground">
                        {m.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatIndianNumber(m.count)} Sacred Chants
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Completed
                      </span>
                    ) : isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-devotional-indigo/15 px-2.5 py-1 text-xs font-bold text-devotional-indigo dark:text-devotional-lavender">
                        Active Target
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetActive(`milestone-${m.count}`, m.name)}
                        className="text-xs h-7 text-muted-foreground hover:text-foreground"
                      >
                        Set Active
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">
                      Chanted: {formatIndianNumber(prog.completed)}
                    </span>
                    <span className="text-devotional-indigo dark:text-devotional-lavender font-bold">
                      {formatPercentage(prog.percentage, 1)}
                    </span>
                  </div>
                  <Progress value={prog.percentage} className="h-2.5" />
                </div>

                {/* Card Footer details */}
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-border/50 pt-3">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Remaining</span>
                    <strong className="text-foreground">
                      {rem === 0 ? "0 (Done)" : formatIndianNumber(rem)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Est. Completion</span>
                    <strong className="text-foreground">
                      {rem === 0
                        ? "Completed 🙏"
                        : est
                        ? formatDate(est.date, "dd MMM yyyy")
                        : "Need more data"}
                    </strong>
                  </div>
                </div>

                {/* Celebration Banner when completed */}
                {isCompleted && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs text-center font-medium">
                    🎉 धन्य हो! आपने {m.name} नाम जप का पावन संकल्प सिद्ध किया।
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* CUSTOM TARGETS */}
      {customTargets.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-devotional-indigo dark:text-devotional-lavender" />
            <span>Personal Custom Targets</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customTargets.map((ct) => {
              const prog = calculateMilestoneProgress(lifetimeTotal, ct.target_count)
              const isCompleted = prog.completed >= ct.target_count
              const rem = Math.max(0, ct.target_count - lifetimeTotal)
              const est = calculateEstimatedCompletion(rem, pace)
              const isActive = activeTarget?.id === ct.id

              return (
                <div
                  key={ct.id}
                  className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-foreground">{ct.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {formatIndianNumber(ct.target_count)} Naam
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetActive(ct.id, ct.title)}
                          className="text-xs h-7"
                        >
                          Set Active
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTargetToDelete(ct.id)}
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">
                        {formatIndianNumber(prog.completed)} / {formatIndianNumber(ct.target_count)}
                      </span>
                      <span>{formatPercentage(prog.percentage, 1)}</span>
                    </div>
                    <Progress value={prog.percentage} className="h-2" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!targetToDelete} onOpenChange={() => setTargetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Target?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this custom target? Your recorded naam jap entries will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTarget}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Target
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
