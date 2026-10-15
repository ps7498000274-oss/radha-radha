import React from "react"
import { Link } from "react-router-dom"
import { Sparkles, Plus, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LotusIcon } from "@/components/layout/Header"

export interface EmptyStateProps {
  /**
   * Primary title of the empty state
   */
  title: React.ReactNode
  /**
   * Detailed explanation or spiritual encouragement
   */
  description?: React.ReactNode
  /**
   * Custom icon element or Lucide icon component
   */
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>
  /**
   * Label for the primary call-to-action button
   */
  actionLabel?: string
  /**
   * Click handler for the primary action
   */
  onAction?: () => void
  /**
   * Destination path if the primary action is a link
   */
  actionHref?: string
  /**
   * Icon for primary action button
   */
  actionIcon?: React.ComponentType<{ className?: string }>
  /**
   * Label for secondary action button
   */
  secondaryActionLabel?: string
  /**
   * Click handler for secondary action
   */
  onSecondaryAction?: () => void
  /**
   * Destination path for secondary action
   */
  secondaryActionHref?: string
  /**
   * Custom container classes
   */
  className?: string
  /**
   * Whether to display the subtle 'राधे राधे' sacred blessing badge
   * @default true
   */
  showDevotionalBadge?: boolean
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionHref,
  actionIcon: ActionIcon = Plus,
  secondaryActionLabel,
  onSecondaryAction,
  secondaryActionHref,
  className,
  showDevotionalBadge = true,
}: EmptyStateProps) {
  // Render icon element properly whether passed as component or JSX element
  const renderIcon = () => {
    if (!icon) {
      return <LotusIcon className="w-10 h-10 text-amber-500" />
    }
    if (React.isValidElement(icon)) {
      return icon
    }
    const IconComp = icon as React.ComponentType<{ className?: string }>
    return <IconComp className="w-10 h-10 text-amber-500" />
  }

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-dashed border-border/80 bg-card/60 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-5 overflow-hidden transition-all duration-200 hover:border-amber-400/40",
        className
      )}
    >
      {/* Background Divine Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-400/5 dark:bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Devotional Badge */}
      {showDevotionalBadge && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-700 dark:text-amber-300 text-xs font-devanagari font-semibold">
          <Sparkles className="w-3 h-3 text-amber-500" />
          राधे राधे • पावन साधना
        </span>
      )}

      {/* Sacred Icon Circle */}
      <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/10 via-indigo-500/10 to-amber-500/15 border border-amber-400/40 text-amber-500 shadow-sm ring-4 ring-amber-400/10">
        {renderIcon()}
      </div>

      {/* Content */}
      <div className="max-w-md space-y-2 z-10">
        <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 z-10">
          {/* Primary Action */}
          {actionLabel && (
            actionHref ? (
              <Button
                asChild
                className="bg-devotional-gold hover:bg-devotional-gold-light text-slate-900 font-semibold shadow-md shadow-amber-500/20 gap-2 border border-amber-300/40"
              >
                <Link to={actionHref}>
                  <ActionIcon className="w-4 h-4" />
                  <span>{actionLabel}</span>
                </Link>
              </Button>
            ) : (
              <Button
                onClick={onAction}
                className="bg-devotional-gold hover:bg-devotional-gold-light text-slate-900 font-semibold shadow-md shadow-amber-500/20 gap-2 border border-amber-300/40"
              >
                <ActionIcon className="w-4 h-4" />
                <span>{actionLabel}</span>
              </Button>
            )
          )}

          {/* Secondary Action */}
          {secondaryActionLabel && (
            secondaryActionHref ? (
              <Button asChild variant="outline" className="gap-2">
                <Link to={secondaryActionHref}>
                  <span>{secondaryActionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            ) : (
              <Button
                onClick={onSecondaryAction}
                variant="outline"
                className="gap-2"
              >
                <span>{secondaryActionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )
          )}
        </div>
      )}
    </div>
  )
}

export default EmptyState
