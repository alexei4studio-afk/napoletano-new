import type { Metadata, Viewport } from 'next'
// @ts-ignore
import './globals.css'

// 1. SEO & Social Media (Metadata)
export const metadata: Metadata = {
  title: 'Napoletano — L\'Arte della Pizza Napoletana | București',
  description: 'Autentică pizzerie napoletană în București. Pizza napolitană veritabilă, ingrediente importate din Italia, cuptor cu lemne. Ion Nonna Otescu nr. 2, Sector 6.',
  keywords: ['pizza napoletana', 'pizzerie bucuresti', 'pizza napolitana', 'restaurant italian bucuresti'],
  openGraph: {
    title: 'Napoletano — L\'Arte della Pizza Napoletana',
    description: 'Autentică pizzerie napoletană în inima Bucureștiului.',
    url: 'https://napoletano.ro',
    siteName: 'Napoletano',
    locale: 'ro_RO',
    type: 'website',
  },
}

// 2. Setări Ecran & Culori Sistem (Viewport) - REPARAT AICI
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
      <body>{children}</body>
    </html>
  )
}