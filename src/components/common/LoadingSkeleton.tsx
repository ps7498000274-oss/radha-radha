import React from "react"
import { cn } from "@/lib/utils"

export type SkeletonVariant =
  | "card"
  | "stat"
  | "chart"
  | "table-row"
  | "text"
  | "avatar"
  | "button"

export interface LoadingSkeletonProps {
  /**
   * Layout variant to display
   * @default "text"
   */
  variant?: SkeletonVariant
  /**
   * Number of items to render
   * @default 1
   */
  count?: number
  /**
   * Additional custom CSS classes
   */
  className?: string
  /**
   * Number of text lines when variant="text"
   * @default 3
   */
  lines?: number
}

/**
 * Base Shimmer Box Element
 */
export function SkeletonBox({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted/60 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 dark:before:via-white/5 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

/**
 * Card Skeleton
 */
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <SkeletonBox className="h-5 w-1/3 rounded-lg" />
        <SkeletonBox className="h-4 w-12 rounded-full" />
      </div>
      <SkeletonBox className="h-3 w-2/3 rounded-md" />
      <div className="space-y-2 pt-2">
        <SkeletonBox className="h-4 w-full rounded" />
        <SkeletonBox className="h-4 w-5/6 rounded" />
        <SkeletonBox className="h-4 w-4/6 rounded" />
      </div>
      <div className="pt-2 flex items-center justify-between">
        <SkeletonBox className="h-8 w-24 rounded-lg" />
        <SkeletonBox className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Stat Metric Skeleton
 */
function StatSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card p-5 shadow-sm space-y-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <SkeletonBox className="h-3.5 w-24 rounded" />
        <SkeletonBox className="h-8 w-8 rounded-lg" />
      </div>
      <div className="flex items-baseline gap-2">
        <SkeletonBox className="h-8 w-28 rounded-lg" />
        <SkeletonBox className="h-4 w-12 rounded-full" />
      </div>
      <SkeletonBox className="h-3 w-36 rounded" />
    </div>
  )
}

/**
 * Chart Skeleton
 */
function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-6",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <SkeletonBox className="h-5 w-40 rounded" />
          <SkeletonBox className="h-3.5 w-28 rounded" />
        </div>
        <div className="flex gap-2">
          <SkeletonBox className="h-8 w-16 rounded-lg" />
          <SkeletonBox className="h-8 w-16 rounded-lg" />
        </div>
      </div>

      {/* Simulated bar chart heights */}
      <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-border/60">
        {[45, 75, 30, 90, 60, 85, 40, 100, 70, 50, 65, 80].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <SkeletonBox
              className="w-full rounded-t-md transition-all"
              style={{ height: `${h}%` }}
            />
            <SkeletonBox className="h-2 w-4 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Table Row Skeleton
 */
function TableRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border-b border-border/60 bg-card/50 gap-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <SkeletonBox className="h-9 w-9 rounded-full flex-shrink-0" />
        <div className="space-y-1.5">
          <SkeletonBox className="h-4 w-32 rounded" />
          <SkeletonBox className="h-3 w-20 rounded" />
        </div>
      </div>
      <SkeletonBox className="h-4 w-24 rounded hidden sm:block" />
      <SkeletonBox className="h-4 w-16 rounded hidden md:block" />
      <div className="flex items-center gap-2">
        <SkeletonBox className="h-7 w-16 rounded-lg" />
        <SkeletonBox className="h-7 w-7 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Multi-line Text Skeleton
 */
function TextSkeleton({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  const widths = ["w-full", "w-11/12", "w-4/5", "w-3/4", "w-2/3"]
  return (
    <div className={cn("space-y-2.5", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          className={cn(
            "h-4 rounded",
            widths[i % widths.length] || "w-full"
          )}
        />
      ))}
    </div>
  )
}

/**
 * Avatar Skeleton
 */
function AvatarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <SkeletonBox className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="space-y-1.5 flex-1">
        <SkeletonBox className="h-4 w-28 rounded" />
        <SkeletonBox className="h-3 w-20 rounded" />
      </div>
    </div>
  )
}

/**
 * Button Skeleton
 */
function ButtonSkeleton({ className }: { className?: string }) {
  return <SkeletonBox className={cn("h-10 w-28 rounded-lg", className)} />
}

/**
 * Main LoadingSkeleton component supporting multiple devotional UI variants.
 */
export function LoadingSkeleton({
  variant = "text",
  count = 1,
  className,
  lines = 3,
}: LoadingSkeletonProps) {
  const renderVariant = (index: number) => {
    switch (variant) {
      case "card":
        return <CardSkeleton key={index} className={className} />
      case "stat":
        return <StatSkeleton key={index} className={className} />
      case "chart":
        return <ChartSkeleton key={index} className={className} />
      case "table-row":
        return <TableRowSkeleton key={index} className={className} />
      case "avatar":
        return <AvatarSkeleton key={index} className={className} />
      case "button":
        return <ButtonSkeleton key={index} className={className} />
      case "text":
      default:
        return <TextSkeleton key={index} lines={lines} className={className} />
    }
  }

  if (count <= 1) {
    return <>{renderVariant(0)}</>
  }

  return (
    <div
      className={cn(
        variant === "stat"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          : variant === "card"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-3"
      )}
    >
      {Array.from({ length: count }).map((_, i) => renderVariant(i))}
    </div>
  )
}

export default LoadingSkeleton
