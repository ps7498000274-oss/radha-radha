import React from "react"
import { Link } from "react-router-dom"
import { Heart, Sparkles, ExternalLink } from "lucide-react"
import { LotusIcon } from "@/components/layout/Header"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-indigo-900/40 select-none">
      {/* Top Banner: Sacred Maha Mantra */}
      <div className="border-b border-indigo-900/30 bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-indigo-950/60 py-4 px-4 text-center">
        <p className="font-devanagari text-sm sm:text-base text-amber-300 font-semibold tracking-wider">
          हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे । हरे राम हरे राम राम राम हरे हरे ॥
        </p>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Brand & Spiritual Mission */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-amber-300 flex items-center justify-center ring-1 ring-amber-400/40 shadow-md">
                <LotusIcon className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <span className="font-serif font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
                  Radha Radha
                </span>
                <span className="block text-[11px] font-devanagari text-amber-400 font-semibold -mt-0.5">
                  नाम जप साधना ट्रैकर
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              A sacred companion designed to cultivate mindfulness, consistency, and devotion in your daily Naam Jap sadhana. Track every chant, achieve spiritual milestones, and surrender in divine love.
            </p>

            <div className="pt-1 flex items-center gap-1.5 text-xs text-amber-300 font-devanagari">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>राधे राधे बोल, श्याम आएंगे</span>
            </div>
          </div>

          {/* Column 2: Navigation & Sadhana */}
          <div className="space-y-3">
            <h3 className="font-serif font-semibold text-sm text-white tracking-wide uppercase text-amber-400/90">
              Sadhana Navigation
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Home (गृह)
                </Link>
              </li>
              <li>
                <a
                  href="/#features"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Features & Tools (विशेषताएं)
                </a>
              </li>
              <li>
                <a
                  href="/#about"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  About the Tracker (परिचय)
                </a>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Devotee Dashboard (साधना डैशबोर्ड)
                </Link>
              </li>
              <li>
                <Link
                  to="/add-jap"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Count Chants (जप माला)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Devotional Wisdom */}
          <div className="space-y-3">
            <h3 className="font-serif font-semibold text-sm text-white tracking-wide uppercase text-amber-400/90">
              Spiritual Wisdom
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-300 font-medium block">
                  Glories of Naam Jap
                </span>
                <span className="text-[11px] text-slate-400">
                  Chanting purifies the heart and cleanses millions of sins.
                </span>
              </li>
              <li>
                <span className="text-slate-300 font-medium block">
                  Brahma Muhurta Sadhana
                </span>
                <span className="text-[11px] text-slate-400">
                  The ideal pre-dawn window for steady contemplation.
                </span>
              </li>
              <li>
                <span className="text-slate-300 font-medium block">
                  108 Beads of Devotion
                </span>
                <span className="text-[11px] text-slate-400">
                  One complete mala connecting microcosm to macrocosm.
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Contact */}
          <div className="space-y-3">
            <h3 className="font-serif font-semibold text-sm text-white tracking-wide uppercase text-amber-400/90">
              Legal & Support
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/privacy"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <a
                  href="mailto:devotion@radharadha.app"
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Contact Seva Team</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <span className="text-[11px] text-slate-400 block pt-1">
                  100% Free & Open Sadhana Seva. No commercial ads, ever.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-indigo-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Radha Radha — Naam Jap Tracker &copy; {currentYear}</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-amber-400 font-devanagari">
              सर्वं श्रीकृष्णार्पणमस्तु
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <span>Made with</span>
            <span className="text-amber-400">🙏</span>
            <span>devotion for devotees worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
