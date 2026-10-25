"use client";

import { useState } from "react";
import { ConfigData } from "@/types/config";
import CydScreenGrid from "./CydScreenGrid";

interface CydDevicePreviewProps {
  config: ConfigData;
  activeScreenIndex?: number;
  onNavigateScreen?: (index: number) => void;
}

/**
 * Preview of the CYD device with the current config rendered in the screen area.
 * Add your device frame to public/cyd-device.png. When you have an image with the
 * screen area transparent, use that so the grid content shows through the cutout.
 */
export default function CydDevicePreview({
  config,
  activeScreenIndex = 0,
  onNavigateScreen,
}: CydDevicePreviewProps) {
  const [imageError, setImageError] = useState(false);
  const isLandscape = config.orientation === "landscape";

  return (
    <div className="relative w-full min-w-0">
      <p className="text-center text-lg font-bold text-gray-700 mt-2 truncate">
        {config.friendlyName || config.deviceName} Device Preview
      </p>
      <p className="text-sm text-center w-full text-gray-500">
        Click binary/light/switch sensors to toggle state. Click a numeric sensor value to enter a test number and see how thresholds affect the icon and colour.
      </p>
      <div className={`relative w-full overflow-hidden ${isLandscape ? "aspect-[654/382]" : "aspect-3/4"}`}>
        <div
          className="absolute z-1 rounded-sm overflow-hidden"
          style={{
            containerType: "size",
            backgroundColor: config.screens?.[activeScreenIndex]?.backgroundColor || "#0f1419",
            ...(isLandscape
              ? { top: "5.5%", right: "13.6%", bottom: "7.6%", left: "19.6%" }
              : { top: "22%", right: "24%", bottom: "27%", left: "24%" }),
          }}
          aria-hidden
        >
          <CydScreenGrid
            config={config}
            activeScreenIndex={activeScreenIndex}
            onNavigateScreen={onNavigateScreen}
          />
        </div>
        {/* Portrait rotates the landscape device photo 90°. Landscape uses the photo as-is. */}
        {!imageError ? (
          <img
            src="/cyd-device.png"
            alt="CYD device preview"
            className={`absolute inset-0 w-full h-full object-contain z-0 pointer-events-none${isLandscape ? "" : " -rotate-90"}`}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`absolute inset-0 z-10 rounded-lg border-4 border-amber-400/60 bg-amber-50/50 pointer-events-none${isLandscape ? "" : " rotate-90"}`} />
        )}
      </div>
    </div>
  );
}
