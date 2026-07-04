import type { NextConfig } from "next"

const config: NextConfig = {
  async rewrites() {
    return [
      { source: "/admin/:path*", destination: "/dashboard/admin/:path*" },
      { source: "/profesor/:path*", destination: "/dashboard/teacher/:path*" },
      { source: "/padre/:path*", destination: "/dashboard/parent/:path*" },
      { source: "/super-admin/:path+", destination: "/dashboard/super-admin/:path+" },
    ]
  },
}

export default config
