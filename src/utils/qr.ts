import QRCode from 'qrcode';

export async function generateQRCodeDataUrl(
  text: string,
  options?: { width?: number; margin?: number; darkColor?: string; lightColor?: string }
): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: options?.width || 256,
      margin: options?.margin ?? 1,
      color: {
        dark: options?.darkColor || '#000000',
        light: options?.lightColor || '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}

/**
 * Creates a QR payload that binds BOTH the Order/Product AND a specific Station.
 * Example: "AO-2026-101@col-montering"
 */
export function formatStationQRPayload(orderId: string, stationId: string): string {
  return `${orderId.trim()}@${stationId.trim()}`;
}

export interface DecodedScan {
  orderId: string;
  stationId?: string;
}

/**
 * Parses scanned text from QR or barcode.
 * Handles:
 * - "AO-2026-101@col-montering"
 * - "PLANERING:AO-2026-101:col-montering"
 * - JSON: { "orderId": "AO-2026-101", "stationId": "col-montering" }
 * - URL: "https://.../?order=AO-2026-101&station=col-montering"
 * - Raw Order ID: "AO-2026-101"
 */
export function extractScanPayload(scannedText: string): DecodedScan {
  const trimmed = scannedText.trim();
  if (!trimmed) return { orderId: '' };

  // 1. Check JSON format
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      const orderId = String(parsed.orderId || parsed.id || '');
      const stationId = parsed.stationId || parsed.station ? String(parsed.stationId || parsed.station) : undefined;
      if (orderId) return { orderId, stationId };
    } catch {
      // not json
    }
  }

  // 2. Check URL with query params
  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed);
      const orderParam = url.searchParams.get('order') || url.searchParams.get('id');
      const stationParam = url.searchParams.get('station') || url.searchParams.get('step');
      if (orderParam) {
        return {
          orderId: orderParam.trim(),
          stationId: stationParam ? stationParam.trim() : undefined,
        };
      }
    }
  } catch {
    // not url
  }

  // 3. Check @ format: "AO-2026-101@col-montering"
  if (trimmed.includes('@')) {
    const [orderPart, stationPart] = trimmed.split('@');
    if (orderPart.trim()) {
      return {
        orderId: orderPart.trim(),
        stationId: stationPart?.trim() || undefined,
      };
    }
  }

  // 4. Check PLANERING: format
  if (trimmed.startsWith('PLANERING:')) {
    const parts = trimmed.split(':');
    if (parts.length >= 3) {
      return {
        orderId: parts[1].trim(),
        stationId: parts[2].trim(),
      };
    } else if (parts.length === 2) {
      return {
        orderId: parts[1].trim(),
      };
    }
  }

  // 5. Fallback: single Order ID
  return { orderId: trimmed };
}

// Keep backward-compatible helper
export function extractOrderIdFromScan(scannedText: string): string {
  return extractScanPayload(scannedText).orderId;
}
