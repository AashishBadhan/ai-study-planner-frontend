/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://ai-study-planner-backend-yqbb-aqzl3nius.vercel.app',
  },
}

module.exports = nextConfig
