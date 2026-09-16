import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // 🛡️ Sentinel: Prevents browsers from MIME-sniffing a response away from the declared content-type
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // 🛡️ Sentinel: Mitigates clickjacking attacks by preventing the site from being framed
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // 🛡️ Sentinel: Controls how much referrer information is included with requests
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // 🛡️ Sentinel: Enforces secure (HTTP over SSL/TLS) connections to the server
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://eu-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
