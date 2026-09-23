# Performance Report

## Measured baseline

- Production build passed.
- JS bundle: approximately 377.77 kB raw / 118.52 kB gzip.
- CSS: approximately 18.87 kB raw / 4.72 kB gzip.

## Findings

- ✅ Lazy image loading is used for most gallery/catalog images.
- ✅ Reduced-motion behavior exists in the UI implementation.
- ⚠️ Main application remains one large eager route/chunk.
- ⚠️ Images are remote Unsplash URLs, not owned responsive WebP/AVIF assets.
- ⚠️ No Lighthouse, real-device Core Web Vitals, CDN cache headers or API caching measurement was run.
- ⚠️ Framer Motion scroll reveals need mobile and low-power device profiling.

Recommended targets: LCP < 2.5s, INP < 200ms, CLS < 0.1, and a repeatable Lighthouse CI check.

