import { ImageResponse } from 'next/og';
import { OG_SIZE, OG_CONTENT_TYPE, OgImageTemplate, getGitHubStars } from '@/lib/og-config';

export const dynamic = 'force-static';
export const alt = 'Cheap Yellow Display (CYD) – Config & Info';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const stars = await getGitHubStars();
  return new ImageResponse(
    (
      <OgImageTemplate
        title="Cheap Yellow Display (CYD)"
        subtitle="Configuration tools and information for the ESP32-2432S028"
        stars={stars}
      />
    ),
    { ...OG_SIZE }
  );
}
