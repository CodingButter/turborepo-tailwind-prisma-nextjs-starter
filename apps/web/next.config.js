/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "static-cdn.jtvnw.net", // Twitch emotes
      "cdn.betterttv.net", // BTTV emotes
      "cdn.frankerfacez.com", // FFZ emotes
      "cdn.7tv.app", // 7TV emotes (if you add this service later)
    ],
  },
}

export default nextConfig
