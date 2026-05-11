/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.licdn.com" },
      { protocol: "https", hostname: "media.licdn.com" },
      { protocol: "https", hostname: "logo.clearbit.com" },
      { protocol: "https", hostname: "**" }
    ]
  }
};

module.exports = nextConfig;
