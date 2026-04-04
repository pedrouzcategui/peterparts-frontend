"use client";

import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { StorefrontPickupLocation } from "@/lib/storefront-settings";

interface ProductLocationsMapProps {
  locations: StorefrontPickupLocation[];
}

export default function ProductLocationsMap({
  locations,
}: ProductLocationsMapProps) {
  const positions = locations.map(
    (location) => [location.latitude, location.longitude] as [number, number],
  );

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[#e7dfd6] bg-[#f6f0e8] shadow-[0_24px_64px_rgba(26,23,20,0.08)] dark:border-border dark:bg-card dark:shadow-none">
      <MapContainer
        bounds={positions}
        boundsOptions={{ padding: [36, 36] }}
        scrollWheelZoom={false}
        className="h-[22rem] w-full md:h-[28rem]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((location) => (
          <CircleMarker
            key={location.name}
            center={[location.latitude, location.longitude]}
            radius={12}
            pathOptions={{
              color: "#630E19",
              weight: 2,
              fillColor: "#D91E36",
              fillOpacity: 0.95,
            }}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold text-[#1A1714]">{location.name}</p>
                <p className="text-sm text-[#5b5248]">{location.description}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
