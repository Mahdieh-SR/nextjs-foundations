import { registerWebVitals } from './lib/web-vitals';

/**
 * Next runs this on the client before React hydrates, which matters here: LCP
 * can land before hydration, and a listener registered inside a component
 * would miss it.
 */
registerWebVitals();
