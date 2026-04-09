# Napoletano — CLAUDE.md

Proiect site web pentru restaurantul **Napoletano Pizzeria Napoletana** din București.

---

## Stack Tehnologic

| Tehnologie | Versiune | Rol |
|---|---|---|
| Next.js | 14.2.5 | Framework (App Router) |
| React | 18 | UI |
| TypeScript | 5 | Limbaj principal |
| Tailwind CSS | 3.4 | Stilizare |
| Framer Motion | 11 | Animații |
| Supabase | 2 | Bază de date + Storage |
| Lucide React | 0.400 | Iconițe |
| Vercel | — | Deployment |

---

## Structura Proiectului

```
app/
  page.tsx                    — Homepage (asamblare componente)
  layout.tsx                  — Root layout (fonts, metadata)
  globals.css                 — Stiluri globale
  galerie-napoletano/
    page.tsx                  — Pagina dedicată galerie (filtre + lightbox)
  admin-napoletano/           — Panou admin (upload galerie etc.)

components/
  Navbar.tsx                  — Navigație fixă (desktop + mobile drawer)
  Hero.tsx                    — Secțiunea hero
  Menu.tsx                    — Meniu cu categorii
  GalleryPreview.tsx          — Preview galerie (ultimele 6 poze din Supabase)
  Gallery.tsx                 — Galerie inline pe homepage
  Story.tsx                   — Povestea restaurantului
  Events.tsx                  — Secțiunea evenimente / capacitate
  Testimonials.tsx            — Recenzii clienți
  Reservation.tsx             — Formular rezervare
  Footer.tsx                  — Footer
  ChatBot.tsx                 — Chatbot integrat

lib/
  supabaseClient.ts           — Singleton Supabase client (folosit în componente client)
  menuData.ts                 — Date statice meniu
```

---

## Design System (Tailwind)

### Fonturi
- `font-display` — Cormorant Garamond (titluri elegante, serif)
- `font-body` — DM Sans (text curent, sans-serif)
- `font-accent` — Playfair Display (accente)

### Culori custom
- `pomodoro-600` `#c0392b` — roșu principal (CTA, accente)
- `charcoal-900` `#0d0d0d` — negru profund (fundaluri dark)
- `charcoal-800` `#1a1a1a`
- `cream-50/100/200/300` — crem/bej (fundaluri light)
- `olive` `#5a6b3a` — verde oliv (accent secundar)

### Paleta paginilor
- Pagini dark (galerie, hero): `bg-black text-white`
- Pagini light (navbar scrolled, secțiuni): `bg-cream-50 text-charcoal-900`

---

## Baza de Date Supabase

### Tabel `gallery_items`
| Coloană | Tip | Descriere |
|---|---|---|
| id | int | PK |
| url | text | URL fișier (Supabase Storage sau extern) |
| category | text | `restaurant` / `terasa` / `evenimente` |
| type | text | `image` / `video` |
| alt_text | text | Text alternativ SEO |
| created_at | timestamp | Data adăugării |

Client Supabase: importat din `@/lib/supabaseClient` în componente `'use client'`.  
Variabile de mediu necesare: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## Reguli de Codare

1. **Toate componentele care folosesc hooks sau Supabase** trebuie să aibă `'use client'` la prima linie.
2. **Navigație**: folosește `<Link href="...">` (Next.js) pentru rute interne (`/`), și `<a href="...">` pentru ancore (`#`).
3. **Imagini din galerie**: folosește `<img>` standard (nu `next/image`) deoarece URL-urile vin din Supabase Storage și nu sunt în `remotePatterns`.
4. **Fonturi**: titluri principale → `font-display`, text curent → `font-body`.
5. **Animații**: folosește `motion.*` și `AnimatePresence` din Framer Motion. Nu adăuga animații CSS custom dacă Framer Motion acoperă cazul.
6. **Nu modifica** `package-lock.json` sau `node_modules` manual.
7. **Fără comentarii** în cod dacă logica e evidentă. Comentează doar comportamente neobișnuite.
8. **TypeScript strict**: definește interfețe pentru toate datele venite din Supabase.
9. **Mobile-first**: clasele Tailwind se scriu mobile-first (`grid-cols-2 md:grid-cols-3`).
10. **Nu adăuga dependențe noi** fără aprobare explicită din partea utilizatorului.

---

## Comenzi Principale

```bash
# Dezvoltare locală
npm run dev          # pornește pe http://localhost:3000

# Build de producție
npm run build        # compilează pentru Vercel
npm start            # pornește build-ul local

# Verificare cod
npm run lint         # ESLint (Next.js config)

# Deployment
git push origin main # Vercel detectează automat și face deploy
```

---

## Note Deployment

- Deployment automat pe **Vercel** la fiecare push pe `main`.
- Repository: `https://github.com/alexei4studio-afk/napoletano-new`
- Variabilele de mediu (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) trebuie setate în Vercel Dashboard → Settings → Environment Variables.
