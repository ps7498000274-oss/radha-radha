import React from "react"
import { Link } from "react-router-dom"
import { Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LotusIcon } from "@/components/layout/Header"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground text-center relative overflow-hidden">
      {/* Decorative Aura */}
      <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-devotional-indigo/10 blur-3xl" />

      <div className="relative z-10 max-w-md mx-auto space-y-6">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-devotional-gold/10 border border-devotional-gold/30 text-devotional-gold shadow-lg shadow-devotional-gold/10">
          <LotusIcon className="h-10 w-10 text-devotional-gold" />
        </div>

        <div className="space-y-2">
          <h1 className="font-devanagari text-6xl font-extrabold text-foreground">
            राधे राधे
          </h1>
          <p className="font-serif text-xl font-semibold text-devotional-indigo dark:text-devotional-lavender">
            Page Not Found (404)
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This spiritual path doesn't seem to exist in our garden of devotion. Let us return to your sacred sanctuary.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-devotional-indigo to-indigo-600 gap-2">
              <Home className="h-4 w-4" />
              <span>Return to Home</span>
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Go to Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
