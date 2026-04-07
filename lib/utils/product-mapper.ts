import { Product } from '@/type/quotes-type';

export function sanitizeImageUrl(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;

  let url = raw.trim();

  // Fix Platzi bracket-wrapped URLs
  if (url.startsWith('[')) {
    try {
      const parsed = JSON.parse(url);
      if (Array.isArray(parsed) && parsed.length > 0) {
        url = String(parsed[0]).trim();
      } else {
        return null;
      }
    } catch {
      // Manual strip as fallback
      url = url.replace(/^\["?|"?\]$/g, '').trim();
    }
  }

  // Reject SVGs
  const lower = url.toLowerCase();
  if (lower.includes('.svg') || lower.includes('svg+xml')) return null;

  // Must be valid http/https URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) return null;

  return url;
}

export function sanitizeImages(raw: string[]): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(sanitizeImageUrl).filter((u): u is string => u !== null);
}

export function mapPlatziProductToProduct(schema: Product) {
  const cleanImages = sanitizeImages(schema.images ?? []);
  const cleanThumbnail = sanitizeImageUrl(schema.thumbnail);

  return {
    ...schema,
    id: schema.id,
    title: schema.title,
    description: schema.description,
    price: schema.price,
    images: cleanImages, // ✅ All sanitized
    thumbnail: cleanThumbnail, // ✅ First valid image
  };
}
