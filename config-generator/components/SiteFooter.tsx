import Link from 'next/link';

const BUY_NOW_URL = 'https://amzn.to/3ZEIfdV';

const FOOTER_LINKS: FooterLink[] = [
  { href: '/', label: 'Home' },
  { href: '/about-cyd', label: 'About CYD' },
  { href: '/config-generator', label: 'Config Generator' },
  { href: BUY_NOW_URL, label: 'Buy now (Amazon)', external: true },
  { href: 'https://github.com/element-software/CYD-ESPHome-HA-Monitor', label: 'GitHub', external: true },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: 'https://element-software.co.uk', label: 'Software development', external: true },
  { href: 'https://element-connect.co.uk', label: 'Smart home expert', external: true },
];

type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-600" aria-label="Footer">
          {FOOTER_LINKS.map((link) => {
            const className = "hover:text-gray-900 transition-colors inline-flex items-center gap-1.5";
            if (link.external) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {link.label}
                  <span className="sr-only">(opens in new tab)</span>
                  <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              );
            }
            return (
              <Link key={link.href} href={link.href} className={className}>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <p className="mt-4 text-center text-xs text-gray-500">
          CYD config tools &amp; info · ESPHome / Home Assistant
        </p>
        <p className="mt-1 text-center text-xs text-gray-400">
          BUY NOW is an affiliate link.
        </p>
        <p className="mt-2 text-center text-xs text-gray-500">
          Powered by{' '}
          <a
            href="https://element-software.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Element Software
          </a>
        </p>
      </div>
    </footer>
  );
}
