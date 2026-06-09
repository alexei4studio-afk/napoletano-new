'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { Campaign } from '@/lib/supabaseClient'
import { CAMPAIGN_COLOR_PRESETS, DEFAULT_CAMPAIGN_SETTINGS } from '@/lib/campaignPresets'
import { useCampaignBanner } from '@/lib/CampaignContext'

function resolveSettings(campaign: Campaign, index: number) {
  const preset = CAMPAIGN_COLOR_PRESETS[index % CAMPAIGN_COLOR_PRESETS.length]
  return {
    bgColor: campaign.bg_color || preset.bg,
    textColor: campaign.text_color || preset.text,
    fontSize: campaign.font_size || DEFAULT_CAMPAIGN_SETTINGS.fontSize,
    showCountdown: campaign.show_countdown !== null
      ? campaign.show_countdown
      : DEFAULT_CAMPAIGN_SETTINGS.showCountdown,
  }
}

function formatCountdown(endDate: string): string | null {
  const diff = new Date(endDate).getTime() - Date.now()
  if (diff <= 0) return null
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff / 60000) % 60)
  const s = Math.floor((diff / 1000) % 60)
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
}

export default function AnnouncementBar() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set())
  const [countdowns, setCountdowns] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const { setBannerHeight } = useCampaignBanner()

  useEffect(() => {
    const stored = sessionStorage.getItem('dismissed_campaigns')
    if (stored) {
      try { setDismissedIds(new Set(JSON.parse(stored))) } catch {}
    }

    supabase
      .from('campaigns')
      .select('*')
      .eq('active', true)
      .order('id', { ascending: true })
      .then(({ data }) => {
        if (data) {
          const now = Date.now()
          const active = data.filter((c: Campaign) => {
            if (c.starts_at && new Date(c.starts_at).getTime() > now) return false
            if (c.ends_at && new Date(c.ends_at).getTime() < now) return false
            return true
          })
          setCampaigns(active)
        }
        setLoading(false)
      })
  }, [])

  const visibleCampaigns = campaigns.filter(c => !dismissedIds.has(c.id))

  useEffect(() => {
    const withCountdown = visibleCampaigns.filter(c => c.ends_at)
    if (withCountdown.length === 0) return

    function tick() {
      const next: Record<number, string> = {}
      withCountdown.forEach(c => {
        const formatted = formatCountdown(c.ends_at!)
        if (formatted) next[c.id] = formatted
      })
      setCountdowns(next)

      const expired = withCountdown.filter(c => !next[c.id])
      if (expired.length > 0) {
        setCampaigns(prev => prev.filter(p => !expired.some(e => e.id === p.id)))
      }
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [visibleCampaigns.map(c => c.id).join(',')])

  useEffect(() => {
    const el = containerRef.current
    if (!el) { setBannerHeight(0); return }

    const observer = new ResizeObserver(() => {
      setBannerHeight(el.offsetHeight)
    })
    observer.observe(el)
    setBannerHeight(el.offsetHeight)

    return () => { observer.disconnect(); setBannerHeight(0) }
  }, [visibleCampaigns.length, setBannerHeight])

  const dismiss = useCallback((id: number) => {
    setDismissedIds(prev => {
      const next = new Set(prev)
      next.add(id)
      sessionStorage.setItem('dismissed_campaigns', JSON.stringify([...next]))
      return next
    })
  }, [])

  if (loading) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[60] bg-charcoal-900 text-white/50 text-center py-2 font-body text-xs">
        <div className="flex items-center justify-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full"
          />
          <span className="tracking-widest uppercase">Se încarcă...</span>
        </div>
      </div>
    )
  }

  if (visibleCampaigns.length === 0) return null

  return (
    <div ref={containerRef} className="fixed top-0 left-0 right-0 z-[60]">
      <AnimatePresence>
        {visibleCampaigns.map((camp, index) => {
          const s = resolveSettings(camp, index)
          return (
            <motion.div
              key={camp.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ background: s.bgColor, color: s.textColor, fontSize: s.fontSize }}
              className="relative overflow-hidden"
            >
              <div className="flex items-center justify-center gap-2 md:gap-3 py-2.5 md:py-3 px-10 text-center font-body font-bold">
                <span className="inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full bg-white/20 text-[8px] md:text-[10px] font-black uppercase tracking-widest shrink-0">
                  CAMPANIE {index + 1}
                </span>

                {camp.image_url && (
                  <img
                    src={camp.image_url}
                    alt={camp.name}
                    className="hidden md:block w-14 h-10 object-cover rounded-lg shrink-0"
                  />
                )}

                <div className="flex items-center justify-center gap-1.5 md:gap-2 flex-wrap text-xs md:text-sm">
                  <strong className="font-black text-[13px] md:text-base">{camp.name}</strong>
                  <span>
                    — Reducere de {camp.discount_percent ? `${camp.discount_percent}%` : `${camp.discount_fixed} LEI`}!
                  </span>
                </div>

                {camp.ends_at && s.showCountdown && countdowns[camp.id] && (
                  <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-lg bg-white/15 text-[11px] font-black tabular-nums tracking-wide shrink-0">
                    Expiră în: {countdowns[camp.id]}
                  </span>
                )}

                <button
                  onClick={() => dismiss(camp.id)}
                  className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1"
                  aria-label="Închide"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
