/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["media.discordapp.net", "uploadthing.com"],
  },
  experimental: {
    esmExternals: false, // THIS IS THE FLAG THAT MATTERS
  },
};

module.exports = nextConfig;
