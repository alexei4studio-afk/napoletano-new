import type { Metadata, Viewport } from 'next'
// @ts-ignore
import './globals.css'

const OG_IMAGE = 'https://ebzvrpnngblxninmifee.supabase.co/storage/v1/object/public/gallery/napoletano-bucuresti-terasa-1775503085263.webp'

// 1. SEO & Social Media (Metadata)
export const metadata: Metadata = {
  metadataBase: new URL('https://napoletano.ro'),
  title: 'Napoletano — L\'Arte della Pizza Napoletana | București',
  description: 'Autentică pizzerie napoletană în București. Pizza napolitană veritabilă, ingrediente importate din Italia, cuptor cu lemne. Ion Nonna Otescu nr. 2, Sector 6.',
  keywords: ['pizza napoletana', 'pizzerie bucuresti', 'pizza napolitana', 'restaurant italian bucuresti'],
  alternates: {
    canonical: 'https://napoletano.ro',
  },
  openGraph: {
    title: 'Napoletano — L\'Arte della Pizza Napoletana',
    description: 'Autentică pizzerie napoletană în inima Bucureștiului.',
    url: 'https://napoletano.ro',
    siteName: 'Napoletano',
    locale: 'ro_RO',
    type: 'website',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Napoletano Pizzeria Napoletana — Terasa București',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Napoletano — L\'Arte della Pizza Napoletana | București',
    description: 'Autentică pizzerie napoletană în București. Ingrediente italiene, cuptor cu lemne.',
    images: [OG_IMAGE],
  },
}

// 2. Setări Ecran & Culori Sistem (Viewport)
export const viewport: Viewport = {
  themeColor: '#c0392b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro">
      <head>
        <link rel="preconnect" href="https://ebzvrpnngblxninmifee.supabase.co" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Restaurant",
              "name": "Napoletano Pizzeria Napoletana",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Ion Nonna Otescu nr. 2",
                "addressLocality": "București",
                "addressRegion": "Sector 6",
                "postalCode": "060057",
                "addressCountry": "RO"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 44.444636,
                "longitude": 26.046522
              },
              "image": OG_IMAGE,
              "url": "https://napoletano.ro",
              "telephone": "+40731333112",
              "priceRange": "€€",
              "servesCuisine": "Italian, Pizza Napoletana",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "312"
              },
              "sameAs": [
                "https://www.facebook.com/ventonapoletano",
                "https://www.instagram.com/ventonapoletano",
                "https://www.tiktok.com/@ventonapoletano",
                "https://wolt.com/ro-ro/rou/bucharest/restaurant/napoletano-6881e1f8128fa8d9f6654e08",
                "https://glovoapp.com/ro/ro/bucharest/stores/napoletan-buc",
                "https://food.bolt.eu/ro-ro/325-bucharest/p/152391-napoletano/"
              ],
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"],
                  "opens": "12:00",
                  "closes": "23:00"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Friday", "Saturday", "Sunday"],
                  "opens": "12:00",
                  "closes": "00:00"
                }
              ]
            })
          }}
        />
      </body>
    </html>
  )
}
