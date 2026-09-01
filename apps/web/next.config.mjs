/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@saltandlight/db", "@saltandlight/domain", "@saltandlight/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "img.vietqr.io",
      },
    ],
  },
};

export default nextConfig;
