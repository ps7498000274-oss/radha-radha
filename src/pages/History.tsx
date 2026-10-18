import React, { useState, useMemo } from "react"
import {
  History as HistoryIcon,
  Search,
  Calendar,
  ArrowUpDown,
  Edit2,
  Trash2,
  Filter,
  Download,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { useJapEntries } from "@/hooks/useJapEntries"
import { formatIndianNumber, formatDate, sanitizeCsvCell } from "@/lib/formatters"
import { type DailyJapEntry } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { EmptyState } from "@/components/common/EmptyState"

export default function HistoryPage() {
  const { entries, updateEntry, deleteEntry } = useJapEntries()
  const { toast } = useToast()

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "count-desc" | "count-asc">("date-desc")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  // Edit Modal State
  const [editingEntry, setEditingEntry] = useState<DailyJapEntry | null>(null)
  const [editCount, setEditCount] = useState<number>(0)
  const [editNotes, setEditNotes] = useState<string>("")
  const [isUpdating, setIsUpdating] = useState(false)

  // Delete Alert State
  const [deletingEntry, setDeletingEntry] = useState<DailyJapEntry | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Pagination
  const [page, setPage] = useState(1)
  const pageSize = 20

  // Filtered & Sorted Entries
  const filteredEntries = useMemo(() => {
    return entries
      .filter((e) => {
        if (searchTerm && !e.notes?.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false
        }
        if (fromDate && e.entry_date < fromDate) {
          return false
        }
        if (toDate && e.entry_date > toDate) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === "date-desc") return b.entry_date.localeCompare(a.entry_date)
        if (sortBy === "date-asc") return a.entry_date.localeCompare(b.entry_date)
        if (sortBy === "count-desc") return b.jap_count - a.jap_count
        if (sortBy === "count-asc") return a.jap_count - b.jap_count
        return 0
      })
  }, [entries, searchTerm, fromDate, toDate, sortBy])

  const totalFilteredCount = useMemo(() => {
    return filteredEntries.reduce((acc, curr) => acc + curr.jap_count, 0)
  }, [filteredEntries])

  const totalPages = Math.ceil(filteredEntries.length / pageSize) || 1
  const paginatedEntries = filteredEntries.slice((page - 1) * pageSize, page * pageSize)

  // Handle Edit Save
  const handleSaveEdit = async () => {
    if (!editingEntry) return
    setIsUpdating(true)
    try {
      const { error } = await updateEntry(editingEntry.id, {
        jap_count: Number(editCount),
        notes: editNotes || null,
      })
      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Entry Updated",
          description: `Updated ${editingEntry.entry_date} to ${formatIndianNumber(editCount)} Radha Naam.`,
        })
        setEditingEntry(null)
      }
    } catch (err: any) {
      toast({
        title: "Error updating",
        description: err?.message,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deletingEntry) return
    setIsDeleting(true)
    try {
      const { error } = await deleteEntry(deletingEntry.id)
      if (error) {
        toast({
          title: "Delete failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Entry Deleted",
          description: `Removed record for ${deletingEntry.entry_date}.`,
        })
      }
    } catch (err: any) {
      toast({
        title: "Error deleting",
        description: err?.message,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeletingEntry(null)
    }
  }

  // Export to CSV
  const handleExportCSV = () => {
    if (entries.length === 0) return
    const headers = "Date,Naam Jap Count,Notes,Created At\n"
    const rows = entries
      .map(
        (e) =>
          `${sanitizeCsvCell(e.entry_date)},${Number(e.jap_count)},${sanitizeCsvCell(e.notes || "")},${sanitizeCsvCell(e.created_at)}`
      )
      .join("\n")

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `radha_radha_sadhana_history_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-devotional-gold/40 bg-devotional-gold/10 px-3 py-1 text-xs font-semibold text-devotional-gold mb-2">
            <HistoryIcon className="h-3.5 w-3.5" />
            <span>Sadhana Chronicles</span>
          </div>
          <h1 className="font-devanagari text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            नाम जप इतिहास एवं संशोधन
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse, search, edit, and audit every devotional record in your sadhana history.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleExportCSV}
          disabled={entries.length === 0}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search by Notes */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-xs"
            />
          </div>

          {/* Sort selector */}
          <div className="relative">
            <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="date-desc">Newest Date First</option>
              <option value="date-asc">Oldest Date First</option>
              <option value="count-desc">Highest Jap Count</option>
              <option value="count-asc">Lowest Jap Count</option>
            </select>
          </div>

          {/* From Date */}
          <div className="relative">
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              placeholder="From Date"
              className="text-xs"
            />
          </div>

          {/* To Date */}
          <div className="relative">
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder="To Date"
              className="text-xs"
            />
          </div>
        </div>

        {/* Summary Metric Strip */}
        <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
          <span>
            Showing <strong>{filteredEntries.length}</strong> of {entries.length} entries
          </span>
          <span>
            Filtered Total:{" "}
            <strong className="text-foreground font-bold">
              {formatIndianNumber(totalFilteredCount)}
            </strong>{" "}
            Radha Naam
          </span>
        </div>
      </div>

      {/* Table / List View */}
      {filteredEntries.length === 0 ? (
        <EmptyState
          title="No Matching Entries"
          description={
            entries.length === 0
              ? "You haven't recorded any sadhana entries yet. Start logging your daily Radha naam!"
              : "No records match your selected filters. Try clearing the search or date range."
          }
          actionLabel="Log Naam Jap"
          actionHref="/add-jap"
        />
      ) : (
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-36 font-bold">Date</TableHead>
                  <TableHead className="w-36 font-bold">Naam Jap</TableHead>
                  <TableHead className="font-bold">Reflection Notes</TableHead>
                  <TableHead className="w-28 text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEntries.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatDate(row.entry_date, "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="font-extrabold text-devotional-indigo dark:text-devotional-lavender whitespace-nowrap">
                      {formatIndianNumber(row.jap_count)}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs sm:max-w-md truncate">
                      {row.notes || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingEntry(row)
                            setEditCount(row.jap_count)
                            setEditNotes(row.notes || "")
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Edit Entry"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingEntry(row)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Delete Entry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border/60 text-xs">
              <span className="text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Entry Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">
              Edit Sadhana Entry ({editingEntry?.entry_date})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="editCount">Naam Jap Count</Label>
              <Input
                id="editCount"
                type="number"
                min="1"
                value={editCount}
                onChange={(e) => setEditCount(Number(e.target.value))}
                required
              />
              <span className="text-xs text-muted-foreground">
                Formatted: {formatIndianNumber(editCount || 0)}
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editNotes">Notes</Label>
              <textarea
                id="editNotes"
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full rounded-xl border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setEditingEntry(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Entry Alert */}
      <AlertDialog open={!!deletingEntry} onOpenChange={() => setDeletingEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sadhana Record?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete the entry for{" "}
              <strong>{deletingEntry?.entry_date}</strong>? This will reduce your lifetime total
              count by{" "}
              <strong>{formatIndianNumber(deletingEntry?.jap_count || 0)}</strong> Radha Naam.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Record"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
