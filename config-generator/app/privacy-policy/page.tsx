import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/metadata';
import PrivacyPolicyContent from '@/components/PrivacyPolicyContent';

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy Policy — CYD HAMon Config Generator',
  description: 'Privacy policy for the CYD HAMon Config Generator.',
  imagePath: '/og/privacy-policy.png',
  imageAlt: 'Privacy Policy — CYD HAMon Config Generator',
});

export default function PrivacyPolicy() {
  return <PrivacyPolicyContent />;
}
