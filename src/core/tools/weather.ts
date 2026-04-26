import { logger } from '../../lib/logger.js';

export interface WeatherData {
  city: string;
  tempC: number;
  feelsLikeC: number;
  description: string;
  humidity: number;
  windKph: number;
}

// WMO weather codes → Azerbaijani descriptions
const WMO_CODES: Record<number, string> = {
  0: 'aydın',
  1: 'əsasən aydın', 2: 'az buludlu', 3: 'tutqun',
  45: 'duman', 48: 'qırağı duman',
  51: 'yüngül çiskin', 53: 'çiskin', 55: 'sıx çiskin',
  56: 'donuq çiskin', 57: 'sıx donuq çiskin',
  61: 'yüngül yağış', 63: 'yağış', 65: 'güclü yağış',
  66: 'donuq yağış', 67: 'güclü donuq yağış',
  71: 'yüngül qar', 73: 'qar', 75: 'güclü qar', 77: 'qar dənəcikləri',
  80: 'arabir yağış', 81: 'yağış', 82: 'güclü yağış',
  85: 'arabir qar', 86: 'güclü qar',
  95: 'ildırımlı', 96: 'ildırımlı dolu', 99: 'güclü ildırımlı dolu',
};

interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
}

async function geocode(city: string): Promise<GeoResult> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
  const data = await res.json() as { results?: GeoResult[] };
  const result = data.results?.[0];
  if (!result) throw new Error(`City not found: ${city}`);
  return result;
}

export async function getWeather(city = 'Baku'): Promise<WeatherData> {
  try {
    const geo = await geocode(city);

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${geo.latitude}&longitude=${geo.longitude}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m` +
      `&wind_speed_unit=kmh&timezone=auto`;

    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`Open-Meteo failed: ${res.status}`);

    const data = await res.json() as {
      current: {
        temperature_2m: number;
        apparent_temperature: number;
        relative_humidity_2m: number;
        weather_code: number;
        wind_speed_10m: number;
      };
    };

    const c = data.current;
    return {
      city: geo.name,
      tempC: Math.round(c.temperature_2m),
      feelsLikeC: Math.round(c.apparent_temperature),
      description: WMO_CODES[c.weather_code] ?? 'naməlum',
      humidity: c.relative_humidity_2m,
      windKph: Math.round(c.wind_speed_10m),
    };
  } catch (err) {
    logger.error('Failed to fetch weather', {
      city,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export function formatWeather(w: WeatherData): string {
  return [
    `🌡 ${w.tempC}°C (hiss olunur: ${w.feelsLikeC}°C) — ${w.description}`,
    `💧 Rütubət: ${w.humidity}%`,
    `💨 Külək: ${w.windKph} km/saat`,
  ].join('\n');
}
