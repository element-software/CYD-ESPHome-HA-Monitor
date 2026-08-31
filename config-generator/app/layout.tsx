import type { Metadata } from 'next'
import './globals.css'
import '@material-design-icons/font/index.css'
import CookieConsentManager from '@/components/CookieConsentManager'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import LocaleProvider from '@/components/LocaleProvider'
import { buildPageMetadata, METADATA_BASE } from '@/lib/metadata'

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: 'Cheap Yellow Display (CYD) – Config & Info',
    description:
      'Information about the ESP32 CYD (Cheap Yellow Display) and the Config Generator to build ESPHome YAML for the Home Assistant monitor',
    imagePath: '/og/home.png',
    imageAlt: 'Cheap Yellow Display (CYD) – Config & Info',
  }),
  metadataBase: METADATA_BASE,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght@24,400&display=block"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <LocaleProvider>
          <SiteHeader />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <SiteFooter />
          <CookieConsentManager />
        </LocaleProvider>
      </body>
    </html>
  )
}
