/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.firstfemale.in",
        pathname: "/uploads/**",
      },
    ],
  },
};

module.exports = nextConfig;
