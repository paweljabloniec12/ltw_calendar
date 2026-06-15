import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
    formats: ["image/avif", "image/webp"],  // nowoczesne formaty, 2-3x mniejsze
    deviceSizes: [640, 828, 1080, 1200],
    minimumCacheTTL: 2592000,               // cache 30 dni
    },
};

export default nextConfig;
