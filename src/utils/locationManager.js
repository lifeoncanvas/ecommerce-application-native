import * as Location from 'expo-location';
import { Platform } from 'react-native';

const FALLBACK_LOCATION = 'Kharadi · Pune';
const FALLBACK_PINCODE = '411014';

const PUNE_KNOWN_AREAS = [
  { name: 'Kharadi', lat: 18.5529, lon: 73.9427, postal: '411014' },
  { name: 'Pimple Nilak', lat: 18.5824, lon: 73.7915, postal: '411027' },
  { name: 'Kalyani Nagar', lat: 18.5482, lon: 73.9033, postal: '411011' },
  { name: 'Viman Nagar', lat: 18.5679, lon: 73.9143, postal: '411014' },
  { name: 'Koregaon Park', lat: 18.5362, lon: 73.8940, postal: '411001' },
  { name: 'Shivajinagar', lat: 18.5314, lon: 73.8446, postal: '411005' },
  { name: 'Aundh', lat: 18.5602, lon: 73.8031, postal: '411007' },
  { name: 'Baner', lat: 18.5590, lon: 73.7868, postal: '411045' },
  { name: 'Kothrud', lat: 18.5074, lon: 73.8077, postal: '411038' },
  { name: 'Hinjawadi', lat: 18.5913, lon: 73.7389, postal: '411057' },
  { name: 'Hadapsar', lat: 18.5089, lon: 73.9259, postal: '411028' },
];

/**
 * Sanitizes and cleans locality and city names, stripping obscure administrative sub-wards.
 */
function cleanLocalityName(rawArea, rawCity) {
  let area = (rawArea || '').replace(/\s*(district|subdistrict|taluka|division)\s*/gi, '').trim();
  let city = (rawCity || 'Pune').replace(/\s*(district|subdistrict|taluka|division)\s*/gi, '').trim();

  if (!city || city.toLowerCase().includes('district')) {
    city = 'Pune';
  }

  // Filter out obscure sub-wards
  const OBSCURE = ['gopalpatti', 'kasba peth', 'pune city', 'maharashtra'];
  if (OBSCURE.includes(area.toLowerCase()) || (city && area.toLowerCase() === city.toLowerCase())) {
    area = '';
  }

  if (area && city) {
    return { formattedDisplay: `${area} · ${city}`, area, city };
  }
  if (city) {
    return { formattedDisplay: `${city} · Maharashtra`, area: city, city };
  }
  return { formattedDisplay: FALLBACK_LOCATION, area: 'Kharadi', city: 'Pune' };
}

/**
 * Finds the closest Pune locality if reverse geocoders are unavailable.
 */
function findClosestPuneLocality(lat, lon) {
  let closest = PUNE_KNOWN_AREAS[0];
  let minDistance = Infinity;

  for (const item of PUNE_KNOWN_AREAS) {
    const dist = Math.hypot(lat - item.lat, lon - item.lon);
    if (dist < minDistance) {
      minDistance = dist;
      closest = item;
    }
  }

  return {
    formattedDisplay: `${closest.name} · Pune`,
    area: closest.name,
    city: 'Pune',
    postalCode: closest.postal,
  };
}

/**
 * Robust reverse geocoder with multiple fallback tiers (Nominatim -> BigDataCloud -> Coordinate Match).
 */
async function reverseGeocodeCoordsAsync(latitude, longitude) {
  // Tier 1: Try OpenStreetMap Nominatim
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: { 'User-Agent': 'HTTNCommerceApp/1.0' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const rawArea =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.quarter ||
        addr.city_district ||
        addr.village ||
        '';
      const rawCity = addr.city || addr.town || addr.municipality || 'Pune';
      const postalCode = addr.postcode || '';

      const { formattedDisplay, area, city } = cleanLocalityName(rawArea, rawCity);

      if (formattedDisplay) {
        return {
          formattedDisplay,
          area,
          city,
          postalCode,
          fullAddress: data.display_name || formattedDisplay,
        };
      }
    }
  } catch (err) {
    // Continue to Tier 2
  }

  // Tier 2: Try BigDataCloud free client reverse geocoding
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const rawArea = data.locality || '';
      const rawCity = data.city || data.principalSubdivision || 'Pune';
      const postalCode = data.postcode || '';

      const { formattedDisplay, area, city } = cleanLocalityName(rawArea, rawCity);

      if (formattedDisplay) {
        return {
          formattedDisplay,
          area,
          city,
          postalCode,
          fullAddress: `${area}, ${city}`,
        };
      }
    }
  } catch (err) {
    // Continue to Tier 3
  }

  // Tier 3: Known Pune Coordinates Proximity Lookup
  return findClosestPuneLocality(latitude, longitude);
}

/**
 * Prompts user for native OS or browser location permission.
 */
export async function requestLocationPermissionAsync() {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && navigator?.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve({ granted: true, status: 'granted' }),
          (err) => resolve({ granted: false, status: 'denied', error: err.message, code: err.code }),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
    }
    return { granted: false, status: 'unavailable' };
  }

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return {
      granted: status === 'granted',
      status,
    };
  } catch (error) {
    console.warn('[LocationManager] Error requesting native permission:', error);
    return { granted: false, status: 'error', error: error.message };
  }
}

/**
 * Checks if location permissions are granted.
 */
export async function isLocationPermissionGrantedAsync() {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && navigator?.permissions?.query) {
      try {
        const p = await navigator.permissions.query({ name: 'geolocation' });
        return p.state === 'granted';
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    return false;
  }
}

/**
 * Retrieves the device's real GPS location and reverse-geocodes it into an exact delivery badge.
 * Always prompts for genuine GPS coordinates without guessing inaccurate ISP IP locations.
 */
export async function getCurrentLocationAddressAsync() {
  // ─── 1. Web Environment (Prompts Browser Native Permission Popup) ───────────
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && navigator?.geolocation) {
      try {
        const webPosition = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        });

        const { latitude, longitude } = webPosition.coords;
        const rev = await reverseGeocodeCoordsAsync(latitude, longitude);

        return {
          success: true,
          granted: true,
          formattedDisplay: rev.formattedDisplay || FALLBACK_LOCATION,
          coords: { latitude, longitude },
          details: {
            postalCode: rev.postalCode || FALLBACK_PINCODE,
            area: rev.area,
            city: rev.city,
          },
        };
      } catch (webErr) {
        console.warn('[LocationManager] Web GPS not allowed or unavailable:', webErr);
        return {
          success: false,
          granted: false,
          code: webErr.code, // 1 = PERMISSION_DENIED
          message: webErr.message,
          formattedDisplay: FALLBACK_LOCATION,
          details: { postalCode: FALLBACK_PINCODE, city: 'Pune' },
        };
      }
    }

    return {
      success: false,
      granted: false,
      formattedDisplay: FALLBACK_LOCATION,
      details: { postalCode: FALLBACK_PINCODE, city: 'Pune' },
    };
  }

  // ─── 2. Native iOS / Android Environment (Prompts System Permission Dialog) ─
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        success: false,
        granted: false,
        formattedDisplay: FALLBACK_LOCATION,
        details: { postalCode: FALLBACK_PINCODE, city: 'Pune' },
      };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = position.coords;

    // Try native reverse geocoder first
    try {
      const nativeRev = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (nativeRev && nativeRev.length > 0) {
        const item = nativeRev[0];
        const rawArea = item.district || item.subregion || item.neighborhood || item.name || item.street || '';
        const rawCity = item.city || item.region || 'Pune';
        const { formattedDisplay, area, city } = cleanLocalityName(rawArea, rawCity);

        return {
          success: true,
          granted: true,
          formattedDisplay: formattedDisplay || FALLBACK_LOCATION,
          coords: { latitude, longitude },
          details: {
            postalCode: item.postalCode || FALLBACK_PINCODE,
            area,
            city,
          },
        };
      }
    } catch (nativeGeoErr) {
      console.warn('[LocationManager] Native reverseGeocodeAsync failed, using HTTP fallback:', nativeGeoErr);
    }

    // Fallback to web reverse geocode tiers
    const fallbackRev = await reverseGeocodeCoordsAsync(latitude, longitude);
    return {
      success: true,
      granted: true,
      formattedDisplay: fallbackRev.formattedDisplay || FALLBACK_LOCATION,
      coords: { latitude, longitude },
      details: {
        postalCode: fallbackRev.postalCode || FALLBACK_PINCODE,
        area: fallbackRev.area,
        city: fallbackRev.city,
      },
    };
  } catch (error) {
    console.warn('[LocationManager] Error in native location detection:', error);
    return {
      success: false,
      granted: false,
      formattedDisplay: FALLBACK_LOCATION,
      details: { postalCode: FALLBACK_PINCODE, city: 'Pune' },
    };
  }
}
