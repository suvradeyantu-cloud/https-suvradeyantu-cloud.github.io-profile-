/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@prescriply/shared', '@prescriply/ui', '@prescriply/config'],
  reactStrictMode: true,
};

module.exports = nextConfig;
