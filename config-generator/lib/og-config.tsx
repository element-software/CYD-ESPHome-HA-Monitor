/**
 * Shared Open Graph image config for Next.js opengraph-image.tsx convention.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
 */

export const OG_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const OG_CONTENT_TYPE = 'image/png' as const;

/** Brand accent used across OG images (amber to match site CTA) */
const OG_ACCENT = '#f59e0b';
const OG_BG = '#111827';
const OG_TEXT = '#f9fafb';
const OG_SUBTEXT = '#9ca3af';

export const GITHUB_REPO = 'element-software/CYD-ESPHome-HA-Monitor';
const GITHUB_API_REPO = `https://api.github.com/repos/${GITHUB_REPO}`;

/**
 * Fetches GitHub star count at build time. Use in opengraph-image.tsx and pass to OgImageTemplate.
 * Returns undefined if the request fails (template will still show icon + repo name).
 */
export async function getGitHubStars(): Promise<number | undefined> {
  try {
    const res = await fetch(GITHUB_API_REPO, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { stargazers_count?: number };
    return typeof data.stargazers_count === 'number' ? data.stargazers_count : undefined;
  } catch {
    return undefined;
  }
}

export type OGImageProps = {
  title: string;
  subtitle?: string;
  /** Optional star count to show next to GitHub icon (e.g. from env at build time) */
  stars?: number;
};

/** GitHub mark icon (inline SVG) for OG images */
function GitHubIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={OG_TEXT}
      style={{ flexShrink: 0 }}
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

/** Star icon (inline SVG) for GitHub stars count - avoids font glyph issues in Satori */
function StarIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={OG_ACCENT}
      style={{ flexShrink: 0 }}
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

/**
 * Shared JSX template for OG images. Use inside ImageResponse in each route's opengraph-image.tsx.
 */
export function OgImageTemplate({ title, subtitle, stars }: OGImageProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: OG_BG,
        padding: 48,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* GitHub + stars strip (top-right) */}
      <div
        style={{
          position: 'absolute',
          top: 32,
          right: 48,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <GitHubIcon size={28} />
        <span
          style={{
            fontSize: 20,
            color: OG_SUBTEXT,
          }}
        >
          {GITHUB_REPO}
        </span>
        {stars != null && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 20,
              color: OG_ACCENT,
              fontWeight: 600,
            }}
          >
            <StarIcon size={20} />
            {stars.toLocaleString()}
          </span>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: subtitle ? 16 : 0,
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: OG_TEXT,
            lineHeight: 1.2,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: 28,
              color: OG_SUBTEXT,
              maxWidth: 800,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          left: 48,
          right: 48,
          height: 4,
          backgroundColor: OG_ACCENT,
          borderRadius: 2,
        }}
      />
    </div>
  );
}
