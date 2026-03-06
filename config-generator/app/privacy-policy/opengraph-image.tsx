import { ImageResponse } from 'next/og';
import { OG_SIZE, OG_CONTENT_TYPE, OgImageTemplate, getGitHubStars } from '@/lib/og-config';

export const dynamic = 'force-static';
export const alt = 'Privacy Policy — CYD HAMon Config Generator';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const stars = await getGitHubStars();
  return new ImageResponse(
    (
      <OgImageTemplate
        title="Privacy Policy"
        subtitle="CYD HAMon Config Generator"
        stars={stars}
      />
    ),
    { ...OG_SIZE }
  );
}
