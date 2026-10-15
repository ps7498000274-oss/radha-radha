import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  PlusCircle,
  Calendar,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  FileText,
  Clock,
  Edit2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { dailyEntrySchema, type DailyEntryFormData } from "@/lib/validators"
import { useJapEntries } from "@/hooks/useJapEntries"
import { QUICK_ADD_VALUES, MAX_DAILY_JAP } from "@/lib/constants"
import { formatIndianNumber, formatDate } from "@/lib/formatters"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export default function DailyEntry() {
  const { entries, addEntry, getEntryByDate } = useJapEntries()
  const { toast } = useToast()

  const todayStr = new Date().toISOString().split("T")[0] || ""
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const [entryMode, setEntryMode] = useState<"add" | "set">("add")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if an entry already exists for selectedDate
  const existingEntry = getEntryByDate(selectedDate)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DailyEntryFormData>({
    resolver: zodResolver(dailyEntrySchema),
    defaultValues: {
      entry_date: todayStr,
      jap_count: 108,
      notes: "",
    },
  })

  const currentCountValue = watch("jap_count") || 0

  // When date changes, update form
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    setSelectedDate(newDate)
    setValue("entry_date", newDate)
  }

  // Quick add increments current form value
  const handleQuickAdd = (amount: number) => {
    const nextVal = Math.min(MAX_DAILY_JAP, (Number(currentCountValue) || 0) + amount)
    setValue("jap_count", nextVal, { shouldValidate: true })
  }

  const onSubmit = async (data: DailyEntryFormData) => {
    setIsSubmitting(true)
    try {
      const isOverwrite = entryMode === "set"
      const { error } = await addEntry(
        data.entry_date,
        Number(data.jap_count),
        data.notes || undefined,
        isOverwrite
      )

      if (error) {
        toast({
          title: "Failed to record Jap",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Sadhana Entry Saved 🙏",
          description: `Recorded ${formatIndianNumber(data.jap_count)} Radha Naam on ${data.entry_date}.`,
          variant: "default",
        })
        // Reset count to 108 for next quick entry
        setValue("jap_count", 108)
        setValue("notes", "")
      }
    } catch (err: any) {
      toast({
        title: "Error saving entry",
        description: err?.message || "Please check your network and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const recentEntries = entries.slice(0, 5)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-devotional-gold/40 bg-devotional-gold/10 px-3 py-1 text-xs font-semibold text-devotional-gold mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Daily Sadhana Log</span>
        </div>
        <h1 className="font-devanagari text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          आज का नाम जप दर्ज करें
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record your daily Radha naam chants with clarity and mindfulness.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Column (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
            {/* Existing Entry Notice */}
            {existingEntry && (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Info className="h-4 w-4 text-amber-500" />
                  <span>Existing Entry Found for {selectedDate}</span>
                </div>
                <p>
                  You already have <strong>{formatIndianNumber(existingEntry.jap_count)}</strong> naam recorded for this date.
                </p>
                {existingEntry.notes && (
                  <p className="italic text-muted-foreground">Notes: "{existingEntry.notes}"</p>
                )}
                <div className="pt-1 flex items-center gap-2">
                  <span className="font-semibold">Action Mode:</span>
                  <div className="inline-flex rounded-lg border border-amber-500/30 bg-background/80 p-0.5">
                    <button
                      type="button"
                      onClick={() => setEntryMode("add")}
                      className={cn(
                        "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors",
                        entryMode === "add"
                          ? "bg-amber-500 text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      + Add to Existing
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntryMode("set")}
                      className={cn(
                        "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors",
                        entryMode === "set"
                          ? "bg-amber-500 text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Set as New Total
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Date Input */}
              <div className="space-y-2">
                <Label htmlFor="entry_date" className="text-sm font-semibold">
                  Sadhana Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="entry_date"
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="pl-10"
                    max={todayStr}
                  />
                </div>
                {errors.entry_date && (
                  <p className="text-xs text-destructive">{errors.entry_date.message}</p>
                )}
              </div>

              {/* Large Numeric Jap Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="jap_count" className="text-sm font-semibold">
                    Number of Radha Naam Jap
                  </Label>
                  <span className="text-xs font-serif font-bold text-devotional-indigo dark:text-devotional-lavender">
                    Formatted: {formatIndianNumber(Number(currentCountValue) || 0)}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id="jap_count"
                    type="number"
                    min="1"
                    max={MAX_DAILY_JAP}
                    className="text-2xl sm:text-3xl font-extrabold h-16 tracking-wide text-center"
                    {...register("jap_count", { valueAsNumber: true })}
                  />
                </div>
                {errors.jap_count && (
                  <p className="text-xs text-destructive">{errors.jap_count.message}</p>
                )}
              </div>

              {/* Quick Add Increment Buttons */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Quick Increment Helpers
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {QUICK_ADD_VALUES.map((val) => (
                    <Button
                      key={val}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAdd(val)}
                      className="font-bold hover:border-devotional-gold hover:bg-devotional-gold/10"
                    >
                      +{formatIndianNumber(val)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Notes Input */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-semibold">
                  Personal Reflections / Sadhana Notes (Optional)
                </Label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="e.g. Completed during Brahma Muhurta, felt deep peace and focus..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  {...register("notes")}
                />
                {errors.notes && (
                  <p className="text-xs text-destructive">{errors.notes.message}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-devotional-indigo to-indigo-600 hover:from-devotional-indigo hover:to-indigo-500 font-bold gap-2 shadow-lg shadow-devotional-indigo/20"
                >
                  <Save className="h-5 w-5" />
                  <span>
                    {isSubmitting
                      ? "Recording..."
                      : entryMode === "add" && existingEntry
                      ? "Add to Existing Count"
                      : "Save Today's Sadhana"}
                  </span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setValue("jap_count", 108)
                    setValue("notes", "")
                  }}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset</span>
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar / Recent Entries Column */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-devotional-indigo dark:text-devotional-lavender" />
              <span>Recent Entries</span>
            </h3>

            {recentEntries.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-4">
                No entries recorded yet. Add your first sadhana entry on the left!
              </p>
            ) : (
              <div className="space-y-3">
                {recentEntries.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold block text-foreground">
                        {formatDate(item.entry_date, "EEE, dd MMM yyyy")}
                      </span>
                      {item.notes && (
                        <p className="text-muted-foreground line-clamp-1 mt-0.5">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                    <span className="font-extrabold text-sm text-devotional-indigo dark:text-devotional-lavender whitespace-nowrap">
                      {formatIndianNumber(item.jap_count)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
