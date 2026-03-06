import { ImageResponse } from 'next/og';
import { OG_SIZE, OG_CONTENT_TYPE, OgImageTemplate, getGitHubStars } from '@/lib/og-config';

export const dynamic = 'force-static';
export const alt = 'Config Generator | CYD';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const stars = await getGitHubStars();
  return new ImageResponse(
    (
      <OgImageTemplate
        title="Config Generator"
        subtitle="Generate ESPHome YAML for CYD Home Assistant Monitor"
        stars={stars}
      />
    ),
    { ...OG_SIZE }
  );
}
