/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: "https://addis-playlist-backend.vercel.app/:path*",
			},
		];
	},
};

module.exports = nextConfig;
