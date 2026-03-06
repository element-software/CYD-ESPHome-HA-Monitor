'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

const BUY_NOW_URL = 'https://amzn.to/3ZEIfdV';
const GITHUB_REPO = 'element-software/CYD-ESPHome-HA-Monitor';
const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;
const GITHUB_STARS_BADGE = `https://img.shields.io/github/stars/${GITHUB_REPO}?style=social`;

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/config-generator', label: 'Config Generator' },
];

function NavLink({
  href,
  label,
  external,
  onClick,
}: {
  href: string;
  label: string;
  external?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = !external && pathname === href;
  const className = `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
  }`;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onClick}>
      {label}
    </Link>
  );
}

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between md:h-16">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-gray-900 hover:text-amber-600 transition-colors shrink-0"
          >
            <span className="hidden sm:inline">Cheap Yellow Display</span>
            <span className="sm:hidden">CYD</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-3" aria-label="Main">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 shrink-0 opacity-90 hover:opacity-100 transition-opacity"
              aria-label="Star on GitHub"
            >
              <img
                src={GITHUB_STARS_BADGE}
                alt="GitHub stars"
                className="h-6 w-auto"
                width={96}
                height={24}
              />
            </a>
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} external={link.external} />
            ))}
            <a
              href={BUY_NOW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-amber-400 transition-colors"
            >
              BUY NOW
            </a>
          </nav>

          {/* Mobile menu button + dropdown */}
          <div className="relative md:hidden" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>

            {menuOpen && (
              <div
                id="mobile-menu"
                className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
                role="menu"
              >
                <div className="px-2 pb-2 border-b border-gray-100" role="none">
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Star on GitHub"
                  >
                    <img
                      src={GITHUB_STARS_BADGE}
                      alt="GitHub stars"
                      className="h-6 w-auto"
                      width={96}
                      height={24}
                    />
                  </a>
                </div>
                {NAV_LINKS.map((link) => (
                  <div key={link.href} className="px-2" role="none">
                    <NavLink
                      href={link.href}
                      label={link.label}
                      external={link.external}
                      onClick={() => setMenuOpen(false)}
                    />
                  </div>
                ))}
                <div className="mt-2 border-t border-gray-100 pt-2 px-2" role="none">
                  <a
                    href={BUY_NOW_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-md bg-amber-500 px-4 py-2.5 text-center text-sm font-semibold text-gray-900 hover:bg-amber-400 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    BUY NOW
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
