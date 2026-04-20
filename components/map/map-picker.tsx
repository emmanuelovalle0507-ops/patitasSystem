"use client";
import { useState } from "react";
import Map, { Marker, NavigationControl, type ViewState } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin } from "lucide-react";
import { TECAMAC_CENTER, isWithinCoverage, COVERAGE_BBOX } from "@/lib/geo";

/**
 * Estilo de mapa gratuito y open-source servido por OpenFreeMap.
 * No requiere API key ni registro. https://openfreemap.org
 */
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

type Props = {
  initial?: { lat: number; lng: number } | null;
  onChange?: (coords: { lat: number; lng: number }) => void;
  /** Se invoca con un nombre legible del lugar (colonia/municipio) via Nominatim. */
  onGeocode?: (areaLabel: string) => void;
  height?: number;
};

/**
 * Reverse geocoding con Nominatim (OpenStreetMap). Sin key, pero requiere
 * User-Agent y rate limit ~1 req/s. Adecuado para uso moderado en cliente.
 */
async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1&accept-language=es`,
      { headers: { "Accept-Language": "es" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const a = data?.address ?? {};
    const parts = [
      a.neighbourhood || a.suburb || a.quarter,
      a.city || a.town || a.village || a.municipality || a.county,
    ].filter(Boolean);
    return parts.length ? parts.join(", ") : (data?.display_name?.split(",").slice(0, 2).join(", ") ?? null);
  } catch {
    return null;
  }
}

/** Mapa interactivo para elegir ubicación dentro del área de cobertura. */
export function MapPicker({ initial, onChange, onGeocode, height = 320 }: Props) {
  const [view, setView] = useState<Partial<ViewState>>({
    latitude: initial?.lat ?? TECAMAC_CENTER.lat,
    longitude: initial?.lng ?? TECAMAC_CENTER.lng,
    zoom: 12,
  });
  const [marker, setMarker] = useState(initial ?? TECAMAC_CENTER);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border" style={{ height }}>
        <Map
          {...view}
          onMove={(e) => setView(e.viewState)}
          onClick={(e) => {
            const { lat, lng } = e.lngLat;
            if (!isWithinCoverage(lat, lng)) {
              setError("Fuera del área de cobertura (Tecámac y municipios colindantes).");
              return;
            }
            setError(null);
            setMarker({ lat, lng });
            onChange?.({ lat, lng });
            if (onGeocode) {
              reverseGeocode(lat, lng).then((label) => { if (label) onGeocode(label); });
            }
          }}
          mapStyle={MAP_STYLE}
          maxBounds={[
            [COVERAGE_BBOX.minLng, COVERAGE_BBOX.minLat],
            [COVERAGE_BBOX.maxLng, COVERAGE_BBOX.maxLat],
          ]}
          attributionControl={false}
        >
          <NavigationControl position="top-right" />
          <Marker latitude={marker.lat} longitude={marker.lng} anchor="bottom">
            <MapPin className="h-8 w-8 text-brand-600 drop-shadow" fill="currentColor" />
          </Marker>
        </Map>
      </div>
      <p className="text-xs text-muted-foreground">
        Toca el mapa para marcar la ubicación aproximada. Mapa &copy; OpenStreetMap contributors · OpenFreeMap
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/** Versión de solo lectura para mostrar la ubicación de un post. */
export function MapView({ lat, lng, height = 240 }: { lat: number; lng: number; height?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border" style={{ height }}>
      <Map
        initialViewState={{ latitude: lat, longitude: lng, zoom: 14 }}
        mapStyle={MAP_STYLE}
        interactive={false}
        attributionControl={false}
      >
        <Marker latitude={lat} longitude={lng} anchor="bottom">
          <MapPin className="h-8 w-8 text-brand-600 drop-shadow" fill="currentColor" />
        </Marker>
      </Map>
    </div>
  );
}
