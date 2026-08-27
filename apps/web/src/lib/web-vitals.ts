import {
  type CLSMetricWithAttribution,
  type INPMetricWithAttribution,
  type LCPMetricWithAttribution,
  onCLS,
  onINP,
  onLCP,
} from 'web-vitals/attribution';

/**
 * The three metrics Google ranks on, with the thresholds a page has to stay
 * under at the 75th percentile of real visits.
 */
export const THRESHOLDS = {
  // Largest Contentful Paint: how long until the main content is painted.
  LCP: { good: 2500, unit: 'ms' },
  // Interaction to Next Paint: how long the page takes to answer an input.
  INP: { good: 200, unit: 'ms' },
  // Cumulative Layout Shift: how much the page moves under the reader.
  CLS: { good: 0.1, unit: '' },
} as const;

const ENDPOINT = '/api/analytics/vitals';

type VitalsPayload = {
  id: string;
  name: string;
  value: number;
  rating: string;
  navigationType: string;
  /** What the browser blamed for this metric, when it can say. */
  attribution: string | undefined;
  url: string;
  timestamp: number;
};

function send(payload: VitalsPayload): void {
  const body = JSON.stringify(payload);

  /**
   * CLS and INP are reported when the page is being hidden, and a normal
   * fetch is cancelled as the document goes away. sendBeacon hands the request
   * to the browser to deliver afterwards, so those two metrics actually arrive;
   * keepalive on the fetch fallback does the same thing for browsers without
   * it.
   */
  if (navigator.sendBeacon?.(ENDPOINT, body)) {
    return;
  }

  fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // A dropped measurement is not worth breaking the page over.
  });
}

function report(
  metric:
    | LCPMetricWithAttribution
    | INPMetricWithAttribution
    | CLSMetricWithAttribution,
  attribution: string | undefined
): void {
  const threshold = THRESHOLDS[metric.name];

  // biome-ignore lint/suspicious/noConsole: the lesson reads these in DevTools
  console.log(
    `${metric.name}: ${metric.value}${threshold.unit} (${metric.rating}, target <${threshold.good}${threshold.unit})`,
    attribution ? `\n  blamed on: ${attribution}` : ''
  );

  send({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    navigationType: metric.navigationType,
    attribution,
    url: window.location.pathname,
    timestamp: Date.now(),
  });
}

/**
 * Subscribes to the three metrics. Each callback can fire more than once as the
 * page evolves — the last value for a given metric id is the one that counts.
 */
export function registerWebVitals(): void {
  onLCP((metric) => {
    // Which element was the largest paint, so the fix has an address.
    report(metric, metric.attribution.target);
  });

  onINP((metric) => {
    report(metric, metric.attribution.interactionTarget);
  });

  onCLS((metric) => {
    // The element whose movement contributed the largest shift.
    report(metric, metric.attribution.largestShiftTarget);
  });
}
