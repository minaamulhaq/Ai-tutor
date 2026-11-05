import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow ngrok domain origins for fonts (__nextjs_font), assets, and hot reload
  allowedDevOrigins: [
    "pancreatic-tuneful-nella.ngrok-free.dev",
    "*.ngrok-free.dev",
    "*.ngrok-free.app",
    "*.ngrok.app",
    "localhost:3000",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "pancreatic-tuneful-nella.ngrok-free.dev",
        "*.ngrok-free.dev",
        "*.ngrok-free.app",
        "*.ngrok.app",
        "localhost:3000",
      ],
    },
  },
};

export default nextConfig;
