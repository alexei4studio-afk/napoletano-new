# Napoletano — Site Redesign

Site-ul modernizat pentru **napoletano.ro** — construit cu Next.js 14, Tailwind CSS și Framer Motion.

## Stack tehnic

- **Next.js 14** (App Router) — SSR + ISR, ultra-rapid
- **Tailwind CSS** — design system consistent, Mobile First
- **Framer Motion** — animații fluide și profesionale
- **TypeScript** — cod robust și maintainable
- **Vercel-ready** — deploy în < 2 minute

## Funcționalități

| Secțiune | Descriere |
|---|---|
| 🦸 **Hero** | Fullscreen cu imagine pizza, text animat, CTA dublu |
| 🍕 **Meniu Interactiv** | 5 categorii (Pizza, Speciale, Antipasti, Paste, Desert), filtrare cu animații |
| 📖 **Povestea Noastră** | Secțiune dark cu statistici animate și imagine |
| 🖼️ **Galerie** | Grid foto responsive cu hover effects |
| ⭐ **Recenzii** | Testimoniale + trust badges |
| 📅 **Rezervare** | Formular complet cu validare + hartă Google Maps |
| 💬 **Chatbot** | Widget plutitor cu răspunsuri automate inteligente |
| 🔻 **Footer** | CTA band, link-uri, contact, social media |

## Pornire locală

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Deploy pe Vercel

### Metoda 1 — Vercel CLI (recomandat)

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Metoda 2 — GitHub + Vercel Dashboard

1. Push pe GitHub: `git init && git add . && git commit -m "init" && git push`
2. Mergi pe [vercel.com](https://vercel.com) → **New Project**
3. Importă repo-ul → **Deploy**

✅ Deploy complet în ~90 secunde.

## Structura proiectului

```
napoletano/
├── app/
│   ├── globals.css       # Stiluri globale + Google Fonts
│   ├── layout.tsx        # Root layout + metadata SEO
│   └── page.tsx          # Pagina principală
├── components/
│   ├── Navbar.tsx        # Header fix cu scroll detection + mobile menu
│   ├── Hero.tsx          # Hero fullscreen animat
│   ├── Menu.tsx          # Meniu interactiv cu categorii
│   ├── Story.tsx         # Secțiunea "Povestea noastră"
│   ├── Gallery.tsx       # Galerie foto masonry-style
│   ├── Testimonials.tsx  # Recenzii clienți + trust badges
│   ├── Reservation.tsx   # Formular rezervare + hartă
│   ├── Footer.tsx        # Footer complet
│   └── ChatBot.tsx       # Widget chatbot plutitor
├── lib/
│   └── menuData.ts       # Date meniu (pizze, antipasti, paste, desert)
├── vercel.json           # Config Vercel cu cache headers
├── tailwind.config.js
├── next.config.js
└── tsconfig.json
```

## Personalizare

### Schimbă culorile
Editează `tailwind.config.js` → `theme.extend.colors.pomodoro`

### Actualizează meniul
Editează `lib/menuData.ts` — format simplu, fără backend necesar.

### Conectează formularul de rezervare
În `components/Reservation.tsx`, funcția `handleSubmit` — înlocuiește comentariul cu un `fetch` către API-ul tău (Resend, EmailJS, Formspree etc.).

### Adaugă Google Maps real
În `components/Reservation.tsx` — înlocuiește iframe-ul cu coordonatele exacte ale restaurantului.

## SEO

- Metadata completă în `app/layout.tsx`
- Open Graph configurat
- `themeColor` pentru mobile browser
- Titluri semantice H1→H3
- Alt text pe toate imaginile

## Performance

- Imagini cu `next/image` + lazy loading
- Fonturi Google cu `display=swap`
- Cache headers pentru assets statice (1 an)
- Bundle tree-shaking automat Next.js

---

**Napoletano Pizzeria** · Ion Nonna Otescu nr. 2, București, Sector 6 · 0731 333 112
