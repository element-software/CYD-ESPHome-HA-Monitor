"use client";

import { useState } from "react";
import { ConfigData } from "@/types/config";
import CydScreenGrid from "./CydScreenGrid";

interface CydDevicePreviewProps {
  config: ConfigData;
}

/**
 * Preview of the CYD device with the current config rendered in the screen area.
 * Add your device frame to public/cyd-device.png. When you have an image with the
 * screen area transparent, use that so the grid content shows through the cutout.
 */
export default function CydDevicePreview({ config }: CydDevicePreviewProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative w-full min-w-0">
      <p className="text-center text-lg font-bold text-gray-700 mt-2 truncate">
        {config.friendlyName || config.deviceName} Device Preview
      </p>
      <p className="text-sm text-center w-full text-gray-500">
        Click binary/light/switch sensors to toggle state. Click a numeric sensor value to enter a test number and see how thresholds affect the icon and colour.
      </p>
      <div className="relative aspect-3/4 w-full overflow-hidden">
        <div
          className="absolute z-1 rounded-sm overflow-hidden"
          style={{
            containerType: "size",
            backgroundColor: "#0f1419",
            top: "22%",
            right: "24%",
            bottom: "27%",
            left: "24%",
          }}
          aria-hidden
        >
          <CydScreenGrid config={config} />
        </div>
        {/* Device frame on top: rotated 90° so device appears in portrait */}
        {!imageError ? (
          <img
            src="/cyd-device.png"
            alt="CYD device preview"
            className="absolute inset-0 w-full h-full object-contain z-0 pointer-events-none -rotate-90"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 z-10 rounded-lg border-4 border-amber-400/60 bg-amber-50/50 pointer-events-none rotate-90" />
        )}
      </div>
    </div>
  );
}
