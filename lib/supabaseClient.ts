import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Types that mirror the DB schema ─────────────────────────────────────
export type GalleryItem = {
  id:         number
  url:        string
  category:   string
  type:       'image' | 'video'
  alt_text:   string
  created_at: string
}

export type MenuItemRow = {
  id:          number
  category_id: string
  name:        string
  name_it:     string | null
  ingredients: string
  price:       number
  weight:      string | null
  badge:       string | null
  sort_order:  number
}

export type Campaign = {
  id:               number
  name:             string
  discount_percent: number | null
  discount_fixed:   number | null
  category_id:      number | null
  active:           boolean
  starts_at:        string | null
  ends_at:          string | null
  bg_color:         string | null
  text_color:       string | null
  font_size:        string | null
  placement:        string | null
  show_countdown:   boolean | null
  image_url:        string | null
  created_at:       string
}
