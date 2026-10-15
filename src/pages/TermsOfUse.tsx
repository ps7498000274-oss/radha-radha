import React from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { FileText, Heart, AlertTriangle } from "lucide-react"

export default function TermsOfUse() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-28 md:py-36">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-devotional-gold/30 bg-devotional-gold/10 px-4 py-1 text-xs font-semibold text-devotional-gold mb-3">
            <FileText className="h-4 w-4" />
            <span>Devotional Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Terms of Use</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Last Updated: October 2026 • Radha Radha — Naam Jap Tracker
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-muted-foreground">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              1. Purpose of the Application
            </h2>
            <p>
              “Radha Radha — Naam Jap Tracker” is created as a digital devotional companion to encourage spiritual consistency, peace of mind, and regular chanting of the holy names.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              2. No Guarantees on Spiritual Outcomes
            </h2>
            <p>
              While this application assists in numerical tracking and estimating milestone pacing (such as 1 Crore or 12 Crore), <strong>we make no claims or guarantees regarding metaphysical, spiritual, or karmic outcomes</strong>. True sadhana is rooted in devotion, humility, and sincerity, not solely arithmetic.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              3. User Responsibilities & Acceptable Use
            </h2>
            <p>
              You agree to use the service respectfully and in alignment with its devotional spirit:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Maintain the confidentiality of your login credentials.</li>
              <li>Do not attempt to compromise system integrity, circumvent Row-Level Security, or disrupt the service for other devotees.</li>
              <li>Keep personal reflection notes aligned with spiritual contemplation.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              4. Audio & Intellectual Property
            </h2>
            <p>
              Devotional audio capabilities are designed to facilitate peaceful meditation. You may utilize user-configured audio paths or local audio files in accordance with applicable copyright laws.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
