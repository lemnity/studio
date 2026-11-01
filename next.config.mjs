/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // У каждого языка свой корневой layout (app/(ru|en|tj)); общая страница 404 — app/global-not-found.tsx.
  experimental: { globalNotFound: true },
  // Статическая выкладка (GitHub Pages): next build пишет готовый сайт в out/.
  ...(process.env.STATIC_EXPORT ? { output: "export", trailingSlash: true, images: { unoptimized: true } } : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
