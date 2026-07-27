/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // English keeps the URLs it always had: / and /studio render the `en`
  // segment without a redirect. Hebrew is the only prefix that shows.
  async rewrites() {
    return [
      { source: "/", destination: "/en" },
      { source: "/studio", destination: "/en/studio" },
    ];
  },
};

export default nextConfig;
