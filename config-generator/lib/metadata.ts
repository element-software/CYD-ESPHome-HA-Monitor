import type { Metadata } from 'next';

const DEFAULT_SITE_ORIGIN = 'https://cheapyellowdisplay.co.uk';
const RAW_BASE_PATH = process.env.PAGES_BASE_PATH ?? '';
const NORMALIZED_BASE_PATH =
  RAW_BASE_PATH && RAW_BASE_PATH !== '/'
    ? `/${RAW_BASE_PATH.replace(/^\/+|\/+$/g, '')}`
    : '';
const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_ORIGIN).replace(/\/$/, '');

const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

function withBasePath(pathname: string): string {
  const normalizedPathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${NORMALIZED_BASE_PATH}${normalizedPathname}`;
}

export const METADATA_BASE = new URL(`${SITE_ORIGIN}${NORMALIZED_BASE_PATH}/`);

export function getStaticAssetUrl(pathname: string): string {
  return `${SITE_ORIGIN}${withBasePath(pathname)}`;
}

type BuildPageMetadataArgs = {
  title: string;
  description: string;
  imagePath: string;
  imageAlt: string;
};

export function buildPageMetadata({
  title,
  description,
  imagePath,
  imageAlt,
}: BuildPageMetadataArgs): Metadata {
  const imageUrl = getStaticAssetUrl(imagePath);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}
