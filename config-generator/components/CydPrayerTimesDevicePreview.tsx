'use client';

import { useState } from 'react';
import CydPrayerTimesScreen from './CydPrayerTimesScreen';

/**
 * Wraps the CydPrayerTimesScreen in the same CYD device-frame layout used by
 * CydDevicePreview, giving the prayer-times page a consistent device preview.
 */
export default function CydPrayerTimesDevicePreview() {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative w-full min-w-0 max-w-xs mx-auto">
      <div className="relative aspect-3/4 w-full overflow-hidden">
        {/* Screen content */}
        <div
          className="absolute z-[1] rounded-sm overflow-hidden"
          style={{
            containerType: 'size',
            backgroundColor: '#0c0c0c',
            top: '22%',
            right: '24%',
            bottom: '27%',
            left: '24%',
          }}
          aria-label="Prayer times display preview"
        >
          <CydPrayerTimesScreen />
        </div>

        {/* Device frame on top */}
        {!imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/cyd-device.png"
            alt="CYD device frame"
            className="absolute inset-0 w-full h-full object-contain z-0 pointer-events-none -rotate-90"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 z-[2] rounded-lg border-4 border-amber-400/60 bg-amber-50/50 pointer-events-none -rotate-90" />
        )}
      </div>
    </div>
  );
}
