/** @type {import('next').NextConfig} */
const pkg = require("./package.json");

// CSP conservadora: trava clickjacking/embedding (frame-ancestors 'none') e
// restringe origens, mas mantém 'unsafe-inline'/'unsafe-eval' em script/style
// porque o Next (App Router) injeta scripts inline de hydration e o RSC payload
// sem nonce. Endurecer script-src exigiria nonce por-request via middleware —
// fora do escopo desta mudança e com alto risco de quebrar a hidratação.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://zhnjbflcbhvqofdtwaqn.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://zhnjbflcbhvqofdtwaqn.supabase.co",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
  serverExternalPackages: ["@prisma/client", "bcryptjs", "@react-pdf/renderer"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zhnjbflcbhvqofdtwaqn.supabase.co",
      },
    ],
  },
  async headers() {
    // Cache longo para os assets estáticos de treino (imagens dos exercícios,
    // bichinho/pet e skill tree). Sem isto o navegador re-baixa tudo a cada
    // visita (public/ sai com max-age=0, must-revalidate) e os jogos ficam
    // lentos. 7 dias + stale-while-revalidate equilibra velocidade × troca de
    // imagem que reusa o mesmo nome (o SWR serve a antiga enquanto revalida).
    const assetCache = [
      {
        key: "Cache-Control",
        value: "public, max-age=604800, stale-while-revalidate=86400",
      },
    ];
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      { source: "/exercises/:path*", headers: assetCache },
      { source: "/pet/:path*", headers: assetCache },
      { source: "/petimg/:path*", headers: assetCache },
      { source: "/skilltree/:path*", headers: assetCache },
    ];
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
