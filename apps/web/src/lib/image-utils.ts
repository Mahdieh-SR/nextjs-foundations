/**
 * Blur placeholders for remote images.
 *
 * A static import gets its `blurDataURL` generated at build time from the file
 * itself. A remote URL has no file to read, so the placeholder has to come from
 * somewhere else — here, a tiny SVG built from a colour the image is roughly
 * made of.
 *
 * This is a stand-in with the right shape, not a real preview: a production
 * pipeline would run something like plaiceholder over the source image and
 * store the result next to the URL. What it does buy is the thing a
 * placeholder is for — the box is filled with something the moment it is
 * painted, instead of staying blank until the image lands.
 *
 * It does not make the image arrive sooner, and it does not change LCP.
 */

type Rgb = [number, number, number];

function toDataUrl(svg: string): string {
  // Encoded rather than inlined raw: an SVG data URL with unescaped '#' or '<'
  // breaks the attribute it is written into.
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/** A single flat colour. The cheapest useful placeholder. */
export function solidPlaceholder([r, g, b]: Rgb): string {
  return toDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="rgb(${r},${g},${b})"/></svg>`
  );
}

/**
 * Two colours with a blur over them, which reads as a photograph out of focus
 * rather than as a flat swatch.
 */
export function gradientPlaceholder(from: Rgb, to: Rgb): string {
  const [r1, g1, b1] = from;
  const [r2, g2, b2] = to;

  return toDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 6">` +
      '<defs>' +
      `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0%" stop-color="rgb(${r1},${g1},${b1})"/>` +
      `<stop offset="100%" stop-color="rgb(${r2},${g2},${b2})"/>` +
      '</linearGradient>' +
      `<filter id="b"><feGaussianBlur stdDeviation="1"/></filter>` +
      '</defs>' +
      `<rect width="8" height="6" fill="url(#g)" filter="url(#b)"/>` +
      '</svg>'
  );
}
