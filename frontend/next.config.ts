const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // ✅ tambahkan Unsplash
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.behance.net", // ✅ tambahkan Unsplash
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
