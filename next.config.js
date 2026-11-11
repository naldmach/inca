/** @type {import('next').NextConfig} */

// Derive the Supabase storage host from the configured project URL so the
// image optimizer is not left open to arbitrary hosts.
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  } catch {
    return null;
  }
})();

// "*.supabase.co" is a deliberate fallback: next.config.js is evaluated
// before env vars are guaranteed to be present, and losing supabaseHost
// would silently stop uploaded listing photos rendering. It still confines
// the optimizer to Supabase-hosted content rather than any host.
const imageHosts = ["images.unsplash.com", "*.supabase.co", supabaseHost].filter(
  (h, i, all) => h && all.indexOf(h) === i
);

// Enforced on every response. CSP is Report-Only for now: the app has inline
// styles and Next injects inline bootstrap scripts, so promoting it to
// enforcing needs a nonce pass first. Report-Only surfaces violations without
// breaking the site.
const cspReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data: ${imageHosts.map((h) => `https://${h}`).join(" ")}`,
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseHost ? `https://${supabaseHost}` : ""}`,
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
];

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    // Never widen this to '**'. The image optimizer fetches and processes
    // whatever it is pointed at, which is the reachable path for the
    // SVG/AVIF RCEs in the optimizer.
    remotePatterns: imageHosts.map((hostname) => ({
      protocol: "https",
      hostname,
    })),
    dangerouslyAllowSVG: false,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
