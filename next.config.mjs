/**
 * API_ORIGIN is the FastAPI backend. It is a SERVER-ONLY variable (no
 * NEXT_PUBLIC_ prefix) because the browser never talks to the API directly —
 * it calls /api/* on this origin and Next proxies onward. That indirection is
 * what makes the auth cookies first-party, so the session is readable in
 * Server Components and middleware.
 */
const API_ORIGIN = process.env.API_ORIGIN || "http://localhost:8000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_ORIGIN}/:path*` }];
  },

  async redirects() {
    return [
      // Product routes moved under /app (the PWA scope).
      { source: "/calculator", destination: "/app/calculator", permanent: true },
      { source: "/encyclopedia", destination: "/app/encyclopedia", permanent: true },
      { source: "/encyclopedia/:slug", destination: "/app/encyclopedia/:slug", permanent: true },
      { source: "/cycle-tracker", destination: "/app/tracker", permanent: true },
      { source: "/dashboard", destination: "/app/profile", permanent: true },

      // Auth must live inside the PWA scope, or an installed app would pop
      // browser chrome mid-login. Password-reset emails hardcode /auth/... —
      // see peptora-api/app/utils/email.py — so this redirect keeps already
      // sent links working.
      { source: "/auth/:path*", destination: "/app/auth/:path*", permanent: true },

      // Retired: AI features, payments, and the hardcoded vendor/regulation tables.
      { source: "/ai-assistant", destination: "/", permanent: true },
      { source: "/stack-checker", destination: "/", permanent: true },
      { source: "/protocol-finder", destination: "/", permanent: true },
      { source: "/vendors", destination: "/", permanent: true },
      { source: "/regulations", destination: "/", permanent: true },
      { source: "/pricing", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
