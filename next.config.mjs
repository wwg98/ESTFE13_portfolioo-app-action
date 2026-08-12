/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zyvaqsbdczgufbptwrkx.supabase.co",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
