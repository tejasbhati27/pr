/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // This disables the build-time ESLint check
    // We're doing this because we want to use our custom .eslintrc.json rules
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
