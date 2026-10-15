import React from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Shield, Lock, EyeOff, UserX } from "lucide-react"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-28 md:py-36">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-devotional-gold/30 bg-devotional-gold/10 px-4 py-1 text-xs font-semibold text-devotional-gold mb-3">
            <Shield className="h-4 w-4" />
            <span>Spiritual Privacy First</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Effective Date: October 2026 • Radha Radha Naam Jap Tracker
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-muted-foreground">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Lock className="h-5 w-5 text-devotional-indigo dark:text-devotional-lavender" />
              1. Sacred Principle: Your Sadhana is Strictly Private
            </h2>
            <p>
              Naam Jap is an intimate, sacred spiritual practice between a devotee and the Supreme. We believe sadhana records should never be commercialized, publicized, or broadcast without explicit intention.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>There are <strong>no public leaderboards</strong> or vanity rankings.</li>
              <li>Your daily counts, notes, and milestones are protected by PostgreSQL <strong>Row-Level Security (RLS)</strong>.</li>
              <li>Only your authenticated account ID (<code className="text-xs bg-muted px-1.5 py-0.5 rounded">auth.uid()</code>) can read or modify your records.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <EyeOff className="h-5 w-5 text-devotional-gold" />
              2. What Information We Collect
            </h2>
            <p>
              We collect only the bare minimum information necessary to maintain your personal sadhana log:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Credentials:</strong> Your email address and encrypted password managed securely via Supabase Auth.</li>
              <li><strong>Sadhana Data:</strong> Daily chant counts, dates, personal journal notes, active milestones, and preferences (such as audio volume and theme).</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <UserX className="h-5 w-5 text-emerald-500" />
              3. Data Ownership & Complete Deletion
            </h2>
            <p>
              You own your data completely. You may export your sadhana entries to CSV at any time from your settings page. You also have the permanent right to delete all your entries or delete your account entirely with a single confirmation, purging all records immediately from the database.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              4. Contact & Devotional Stewardship
            </h2>
            <p>
              If you have any questions or feedback regarding the security or stewardship of your data, you can reach out through the project repository or support channels.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
