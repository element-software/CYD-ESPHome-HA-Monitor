'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

const BUY_NOW_URL = 'https://amzn.to/3ZEIfdV';
const GITHUB_REPO = 'element-software/CYD-ESPHome-HA-Monitor';
const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;
const GITHUB_STARS_BADGE = `https://img.shields.io/github/stars/${GITHUB_REPO}?style=social`;

type NavLink = {
  href: string;
  labelKey: 'home' | 'aboutCyd' | 'configGenerator';
  external?: boolean;
};

const NAV_LINK_DEFS: NavLink[] = [
  { href: '/', labelKey: 'home' },
  { href: '/about-cyd', labelKey: 'aboutCyd' },
  { href: '/config-generator', labelKey: 'configGenerator' },
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

function ThemeToggle({ label }: { label: string }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setIsDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      aria-label={label}
      title={label}
    >
      {isDark ? (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
        </svg>
      )}
    </button>
  );
}

export default function SiteHeader() {
  const t = useTranslations('nav');
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
              aria-label={t('starOnGithub')}
            >
              <img
                src={GITHUB_STARS_BADGE}
                alt={t('githubStars')}
                className="h-6 w-auto"
                width={96}
                height={24}
              />
            </a>
            {NAV_LINK_DEFS.map((link) => (
              <NavLink key={link.href} href={link.href} label={t(link.labelKey)} external={link.external} />
            ))}
            <ThemeToggle label={t('toggleTheme')} />
            <LanguageSwitcher />
            <a
              href={BUY_NOW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-amber-400 transition-colors"
            >
              {t('buyNow')}
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
              aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
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
                    aria-label={t('starOnGithub')}
                  >
                    <img
                      src={GITHUB_STARS_BADGE}
                      alt={t('githubStars')}
                      className="h-6 w-auto"
                      width={96}
                      height={24}
                    />
                  </a>
                </div>
                {NAV_LINK_DEFS.map((link) => (
                  <div key={link.href} className="px-2" role="none">
                    <NavLink
                      href={link.href}
                      label={t(link.labelKey)}
                      external={link.external}
                      onClick={() => setMenuOpen(false)}
                    />
                  </div>
                ))}
                <div className="mt-2 border-t border-gray-100 pt-2 px-2" role="none">
                  <div className="px-1 pb-2 flex items-center justify-between">
                    <LanguageSwitcher />
                    <ThemeToggle label={t('toggleTheme')} />
                  </div>
                  <a
                    href={BUY_NOW_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-md bg-amber-500 px-4 py-2.5 text-center text-sm font-semibold text-gray-900 hover:bg-amber-400 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('buyNow')}
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
