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
 * Parses scanned text from QR or barcode.
 * Handles formats like:
 * - "AO-2026-101"
 * - "PLANERING_AO:AO-2026-101"
 * - "https://.../?order=AO-2026-101"
 * - JSON string with { id: "AO-2026-101" }
 */
export function extractOrderIdFromScan(scannedText: string): string {
  const trimmed = scannedText.trim();
  if (!trimmed) return '';

  // Check JSON format
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.id) return String(parsed.id);
      if (parsed.orderId) return String(parsed.orderId);
    } catch {
      // not json, continue
    }
  }

  // Check prefix PLANERING_AO:
  if (trimmed.startsWith('PLANERING_AO:')) {
    return trimmed.replace('PLANERING_AO:', '').trim();
  }

  // Check URL query param ?order= or /order/
  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed);
      const orderParam = url.searchParams.get('order') || url.searchParams.get('id');
      if (orderParam) return orderParam.trim();
      const pathParts = url.pathname.split('/').filter(Boolean);
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && (lastPart.startsWith('AO-') || lastPart.startsWith('ORD-'))) {
        return lastPart.trim();
      }
    }
  } catch {
    // not url
  }

  // Direct ID
  return trimmed;
}
