import type { Metadata } from 'next'
import { Cormorant_Garamond, Outfit, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import './globals.css'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Lumeriq Visuals',
  description:
    'Client galleries and photography studio — Lumeriq Visuals, Ilorin',
}

const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('lumeriq-theme');
    document.documentElement.setAttribute('data-theme', t || 'atelier');
    var m = localStorage.getItem('lumeriq-mode');
    if (m !== 'light' && m !== 'dark') {
      m = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-mode', m);
    if (m === 'dark') document.documentElement.classList.add('dark');
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'atelier');
    document.documentElement.setAttribute('data-mode', 'light');
  }
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="atelier" data-mode="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${outfit.variable} ${cormorant.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
