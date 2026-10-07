import React from "react";
import {
  SiGithub,
  SiDiscord,
  SiApple,
  SiCloudflare,
  SiBinance,
  SiSteam,
  SiProton,
  SiDocker,
  SiKeycloak,
  SiPostgresql,
  SiCoolify,
  SiSpotify,
  SiGitlab,
  SiBitbucket,
  SiVercel,
  SiNetlify,
  SiDigitalocean,
  SiTwitch,
  SiReddit,
  SiFacebook,
  SiInstagram,
  SiDropbox,
  SiNpm,
  SiPaypal,
  SiStripe,
  SiCoinbase,
  SiBitwarden,
  SiEtsy,
  SiShopify,
  SiWordpress,
  SiYoutube,
  SiTelegram,
  SiWhatsapp,
  SiPlaystation,
  SiEpicgames,
  SiUbisoft,
  SiBattledotnet,
  SiNotion,
  SiFigma,
  SiTrello,
  SiLinear,
  SiAsana,
  SiMedium,
  SiSupabase,
  SiFirebase,
  SiFlydotio,
  SiHetzner,
  SiOvh,
  SiGodaddy,
  SiNamecheap,
  Si1password,
  SiAegisauthenticator,
  SiEnte,
  SiDashlane,
  SiAnthropic,
  SiPerplexity,
  SiAirbnb,
  SiUber,
  SiKucoin,
  SiOkx,
  SiPatreon,
  SiMailchimp,
  SiZoho,
  SiOpera,
  SiOperagx,
  SiVk,
  SiX,
  SiMozilla,
  SiFirefox,
} from "@icons-pack/react-simple-icons";

interface BrandAvatarProps {
  name: string;
  issuer?: string;
  color?: string;
  className?: string;
}

interface BrandEntry {
  Icon?: React.ComponentType<{ size?: number; className?: string }>;
  svg?: React.ReactNode;
  bg: string;
  textColor?: string;
}

const BRAND_MAP: Record<string, BrandEntry> = {
  // Major Tech & Cloud
  google: {
    bg: "#ffffff",
    svg: (
      <svg viewBox="0 0 24 24" className="size-5">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
    ),
  },
  github: { Icon: SiGithub, bg: "#181717", textColor: "text-white fill-current" },
  microsoft: {
    bg: "#000000",
    svg: (
      <svg viewBox="0 0 24 24" className="size-5">
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#7FBA00" d="M13 1h10v10H13z" />
        <path fill="#00A4EF" d="M1 13h10v10H1z" />
        <path fill="#FFB900" d="M13 13h10v10H13z" />
      </svg>
    ),
  },
  apple: { Icon: SiApple, bg: "#000000", textColor: "text-white fill-current" },
  amazon: {
    bg: "#FF9900",
    svg: (
      <svg viewBox="0 0 24 24" className="size-5 fill-black">
        <path d="M13.92 11.53c-1.74-.23-3.92.36-4.88 1.76-.84 1.2-1.07 2.65-.45 4.02.66 1.4 2.2 2.05 3.65 1.83 1.5-.23 2.87-1.2 3.42-2.62.15-.38.25-.8.28-1.21V13.8c-.64-1.12-1.25-1.9-2.02-2.27zm-1.05 5.56c-.95.12-1.85-.36-2.18-1.25-.33-.9-.05-1.9.68-2.45.74-.55 1.78-.71 2.66-.56v2.46c-.36 1.13-.53 1.72-1.16 1.8zm10.74 3.7c-.24.18-.58.19-.84.05-1.21-.69-2.29-1.57-3.23-2.61-.17-.18-.14-.46.06-.61.19-.14.47-.1.63.08.88.97 1.89 1.8 3.02 2.45.26.15.35.48.16.74-.03.04-.07.07-.1.1zM.5 17.5c4.8 3.5 11.2 5.5 17.2 3 1.2-.5 2.3-1.2 3.4-2 .2-.2.5-.1.6.1.1.2.1.5-.1.7-1.2.9-2.4 1.7-3.7 2.2-6.5 2.7-13.4.5-18.5-3.3-.3-.2-.3-.5-.1-.7.2-.3.5-.3.8-.1z" />
      </svg>
    ),
  },
  cloudflare: { Icon: SiCloudflare, bg: "#F38020", textColor: "text-white fill-current" },

  // Communication & Social
  discord: { Icon: SiDiscord, bg: "#5865F2", textColor: "text-white fill-current" },
  telegram: { Icon: SiTelegram, bg: "#26A5E4", textColor: "text-white fill-current" },
  whatsapp: { Icon: SiWhatsapp, bg: "#25D366", textColor: "text-white fill-current" },
  slack: {
    bg: "#4A154B",
    svg: (
      <svg viewBox="0 0 24 24" className="size-5">
        <path fill="#E01E5A" d="M6 15a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
        <path fill="#36C5F0" d="M9 6a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0zm-2.5 0a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
        <path fill="#2EB67D" d="M18 9a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm0-2.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0z" />
        <path fill="#ECB22E" d="M15 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zm2.5 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" />
      </svg>
    ),
  },
  linkedin: {
    bg: "#0A66C2",
    svg: (
      <svg viewBox="0 0 24 24" className="size-5 fill-white">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    ),
  },
  reddit: { Icon: SiReddit, bg: "#FF4500", textColor: "text-white fill-current" },
  facebook: { Icon: SiFacebook, bg: "#1877F2", textColor: "text-white fill-current" },
  instagram: { Icon: SiInstagram, bg: "#E4405F", textColor: "text-white fill-current" },
  youtube: { Icon: SiYoutube, bg: "#FF0000", textColor: "text-white fill-current" },
  twitter: {
    bg: "#1DA1F2",
    svg: (
      <svg viewBox="0 0 24 24" className="size-5 fill-white">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    ),
  },
  x: { Icon: SiX, bg: "#000000", textColor: "text-white fill-current" },
  vk: { Icon: SiVk, bg: "#0077FF", textColor: "text-white fill-current" },
  twitch: { Icon: SiTwitch, bg: "#9146FF", textColor: "text-white fill-current" },
  spotify: { Icon: SiSpotify, bg: "#1DB954", textColor: "text-white fill-current" },

  // AI & Productivity
  chatgpt: {
    bg: "#10A37F",
    svg: (
      <svg viewBox="0 0 24 24" className="size-5 fill-white">
        <path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.04 6.04 0 0 0-6.51-2.9 6.07 6.07 0 0 0-4.66-2.08 6.06 6.06 0 0 0-5.76 4.2 6.03 6.03 0 0 0-4.17 3.01 6.07 6.07 0 0 0 .84 7.08 6.02 6.02 0 0 0 .52 4.9 6.05 6.05 0 0 0 6.51 2.9 6.07 6.07 0 0 0 4.67 2.08 6.06 6.06 0 0 0 5.76-4.2 6.03 6.03 0 0 0 4.16-3.01 6.07 6.07 0 0 0-.85-7.07zM12 18.7a4.7 4.7 0 0 1-2.35-.63l.16-.09 3.9-2.25a.67.67 0 0 0 .34-.58v-4.5l1.35.78a.07.07 0 0 1 .04.05v4.52a4.72 4.72 0 0 1-3.44 2.7zm-6.84-2.85a4.7 4.7 0 0 1-.62-2.35v-2.85l.16.1 3.9 2.25a.67.67 0 0 0 .67 0l3.9-2.25v1.56a.07.07 0 0 1-.03.06l-3.92 2.26a4.72 4.72 0 0 1-4.08.77zm-1.1-7.22a4.7 4.7 0 0 1 1.73-1.73l.16.09 3.9 2.25a.67.67 0 0 0 .67 0l3.9-2.25-1.35-.78a.07.07 0 0 1-.04-.05H9.11a4.72 4.72 0 0 1-.64-3.47zm13.78 4.22l-3.9-2.25a.67.67 0 0 0-.67 0l-3.9 2.25v-1.56a.07.07 0 0 1 .03-.06l3.92-2.26a4.72 4.72 0 0 1 4.72 1.58 4.7 4.7 0 0 1 1.1 2.3v2.85l-.16-.1a.67.67 0 0 0-.34-.06z" />
      </svg>
    ),
  },
  openai: {
    bg: "#10A37F",
    svg: (
      <svg viewBox="0 0 24 24" className="size-5 fill-white">
        <path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.04 6.04 0 0 0-6.51-2.9 6.07 6.07 0 0 0-4.66-2.08 6.06 6.06 0 0 0-5.76 4.2 6.03 6.03 0 0 0-4.17 3.01 6.07 6.07 0 0 0 .84 7.08 6.02 6.02 0 0 0 .52 4.9 6.05 6.05 0 0 0 6.51 2.9 6.07 6.07 0 0 0 4.67 2.08 6.06 6.06 0 0 0 5.76-4.2 6.03 6.03 0 0 0 4.16-3.01 6.07 6.07 0 0 0-.85-7.07z" />
      </svg>
    ),
  },
  claude: { Icon: SiAnthropic, bg: "#D97757", textColor: "text-white fill-current" },
  anthropic: { Icon: SiAnthropic, bg: "#D97757", textColor: "text-white fill-current" },
  perplexity: { Icon: SiPerplexity, bg: "#22B8CF", textColor: "text-white fill-current" },
  notion: { Icon: SiNotion, bg: "#000000", textColor: "text-white fill-current" },
  figma: { Icon: SiFigma, bg: "#F24E1E", textColor: "text-white fill-current" },
  trello: { Icon: SiTrello, bg: "#0052CC", textColor: "text-white fill-current" },
  linear: { Icon: SiLinear, bg: "#5E6AD2", textColor: "text-white fill-current" },
  asana: { Icon: SiAsana, bg: "#F95738", textColor: "text-white fill-current" },
  medium: { Icon: SiMedium, bg: "#000000", textColor: "text-white fill-current" },

  // Dev & Cloud Hosting
  docker: { Icon: SiDocker, bg: "#1D63ED", textColor: "text-white fill-current" },
  keycloak: { Icon: SiKeycloak, bg: "#008AEC", textColor: "text-white fill-current" },
  pgadmin: { Icon: SiPostgresql, bg: "#4169E1", textColor: "text-white fill-current" },
  postgres: { Icon: SiPostgresql, bg: "#4169E1", textColor: "text-white fill-current" },
  coolify: { Icon: SiCoolify, bg: "#6B46C1", textColor: "text-white fill-current" },
  gitlab: { Icon: SiGitlab, bg: "#FC6D26", textColor: "text-white fill-current" },
  bitbucket: { Icon: SiBitbucket, bg: "#0052CC", textColor: "text-white fill-current" },
  vercel: { Icon: SiVercel, bg: "#000000", textColor: "text-white fill-current" },
  netlify: { Icon: SiNetlify, bg: "#00C7B7", textColor: "text-white fill-current" },
  digitalocean: { Icon: SiDigitalocean, bg: "#0080FF", textColor: "text-white fill-current" },
  supabase: { Icon: SiSupabase, bg: "#3ECF8E", textColor: "text-black fill-current" },
  firebase: { Icon: SiFirebase, bg: "#FFCA28", textColor: "text-black fill-current" },
  flyio: { Icon: SiFlydotio, bg: "#24185B", textColor: "text-white fill-current" },
  hetzner: { Icon: SiHetzner, bg: "#D50C2D", textColor: "text-white fill-current" },
  ovh: { Icon: SiOvh, bg: "#123F6D", textColor: "text-white fill-current" },
  godaddy: { Icon: SiGodaddy, bg: "#1BDBDB", textColor: "text-black fill-current" },
  namecheap: { Icon: SiNamecheap, bg: "#DE3723", textColor: "text-white fill-current" },
  dynadot: {
    bg: "#061848",
    svg: (
      <svg viewBox="20 20 110 110" className="size-5 fill-white">
        <path
          transform="translate(25.86 25.34)"
          d="M98.28,15.77C91.06,1.31,72.85-4.12,58.51,3.33L16.06,25.41l9.51,18.27-9.59,4.98C1.78,56.04-4.25,73.93,3.23,88.08c5.17,9.77,15.21,15.37,25.57,15.37,4.48,0,9.03-1.05,13.28-3.25l43.03-22.39-9.48-18.25,10.13-5.27c13.98-7.27,19.53-24.47,12.52-38.51ZM37.14,90.67c-10.33,5.37-23.51-.19-26.2-12.49-.33-1.47-.44-2.99-.35-4.49,.43-6.7,4.13-12.31,9.8-15.24l10.13-5.27,4.19,8.06c4.43,8.51,14.93,11.83,23.45,7.41l7.96-4.14,4.55,8.75-33.52,17.42Zm15.07-47.2c3.27,.62,5.9,3.25,6.53,6.51,1.11,5.85-3.92,10.88-9.77,9.78-3.27-.62-5.9-3.26-6.53-6.53-1.11-5.85,3.93-10.87,9.77-9.77Zm28.17,1.52l-9.7,5.05-4.19-8.05c-4.44-8.52-14.94-11.84-23.45-7.41l-7.97,4.14-4.55-8.75L64.04,12.55c8.8-4.57,19.65-1.22,24.35,7.46,4.83,8.93,.99,20.3-8.02,24.99Z"
        />
      </svg>
    ),
  },
  npm: { Icon: SiNpm, bg: "#CB3837", textColor: "text-white fill-current" },

  // Browsers
  operagx: { Icon: SiOperagx, bg: "#EE2950", textColor: "text-white fill-current" },
  opera: { Icon: SiOpera, bg: "#FF1B2D", textColor: "text-white fill-current" },
  firefox: { Icon: SiFirefox, bg: "#FF7139", textColor: "text-white fill-current" },
  mozilla: { Icon: SiMozilla, bg: "#161616", textColor: "text-white fill-current" },

  // Gaming
  steam: { Icon: SiSteam, bg: "#171a21", textColor: "text-white fill-current" },
  playstation: { Icon: SiPlaystation, bg: "#003791", textColor: "text-white fill-current" },
  epicgames: { Icon: SiEpicgames, bg: "#313131", textColor: "text-white fill-current" },
  ubisoft: { Icon: SiUbisoft, bg: "#000000", textColor: "text-white fill-current" },
  battlenet: { Icon: SiBattledotnet, bg: "#00AEFF", textColor: "text-white fill-current" },
  blizzard: { Icon: SiBattledotnet, bg: "#00AEFF", textColor: "text-white fill-current" },

  // Crypto & Finance
  binance: { Icon: SiBinance, bg: "#F0B90B", textColor: "text-black fill-current" },
  coinbase: { Icon: SiCoinbase, bg: "#0052FF", textColor: "text-white fill-current" },
  kucoin: { Icon: SiKucoin, bg: "#23AF91", textColor: "text-white fill-current" },
  okx: { Icon: SiOkx, bg: "#000000", textColor: "text-white fill-current" },
  ccpayment: {
    bg: "#3C6FF5",
    svg: (
      <svg viewBox="-2 -2 36 36" className="size-5 fill-white">
        <path d="M0 9.09434C0 4.07168 4.07167 0 9.09434 0H14.7518V32H9.09433C4.07167 32 0 27.9283 0 22.9057V9.09434Z" />
        <path d="M16.3906 25.9626C16.3906 20.94 20.4623 16.8683 25.485 16.8683H32.0001V22.9054C32.0001 27.9281 27.9285 31.9998 22.9058 31.9998H16.3906V25.9626Z" />
        <path d="M16.3906 6.03738C16.3906 11.06 20.4623 15.1317 25.485 15.1317H32.0001V9.09455C32.0001 4.07189 27.9285 0.000217438 22.9058 0.000217438H16.3906V6.03738Z" />
      </svg>
    ),
  },
  bitkan: {
    bg: "#ffffff",
    svg: (
      <svg viewBox="-2 -2 36 36" className="size-5">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill="#415DEE"
          d="M0.687586 23.9918C0.687586 23.9918 -0.874474 20.7578 1.59432 19.3279C3.99458 17.9384 5.55325 20.628 5.55325 20.628C8.51167 25.4886 12.6198 29.1608 19.2349 29.1608C23.6869 29.1608 29.1647 26.7738 31.1765 24.172C28.4635 29.8516 22.676 33.7754 15.9736 33.7754C9.20241 33.7754 3.3639 29.7699 0.687586 23.9918Z"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill="#415DEE"
          d="M31.3134 9.78277C31.3134 9.78277 32.8744 13.015 30.4062 14.4468C28.0059 15.8367 26.4473 13.1483 26.4473 13.1483C23.4896 8.2863 19.3811 4.61289 12.7653 4.61289C8.31279 4.61289 2.83627 7.00088 0.825439 9.60176C3.53826 3.9213 9.32504 0 16.0269 0C22.799 0 28.6363 4.00466 31.3134 9.78277Z"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill="#415DEE"
          d="M20.5287 18.8541C20.5287 20.2368 19.5077 21.3767 18.1829 21.5784V22.3021H16.5896V21.6202H14.1659V22.3021H12.5733V21.6202H11.4711V20.0206H12.5733V13.7518H11.4711V12.1539H12.5733V11.4734H14.1659V12.1539H16.5896V11.4734H18.1829V12.1962C19.5077 12.398 20.5287 13.5379 20.5287 14.92C20.5287 15.6899 20.2123 16.3853 19.7047 16.8869C20.2123 17.3894 20.5287 18.0847 20.5287 18.8541ZM15.9992 9.09846C11.7087 9.09846 8.2312 12.5854 8.2312 16.8873C8.2312 21.1884 11.7087 24.6767 15.9992 24.6767C20.2916 24.6767 23.7703 21.1884 23.7703 16.8873C23.7703 12.5854 20.2916 9.09846 15.9992 9.09846Z"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill="#415DEE"
          d="M14.1663 20.0206H17.7695C18.4133 20.0206 18.9354 19.4987 18.9354 18.8541C18.9354 18.2104 18.4133 17.6855 17.7695 17.6855H14.1663V20.0206Z"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill="#415DEE"
          d="M18.9354 14.9201C18.9354 14.2759 18.4136 13.7519 17.7695 13.7519H14.1663V16.0883H17.7695C18.4136 16.0883 18.9354 15.5643 18.9354 14.9201Z"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill="#F98D33"
          d="M2.01208 10.2354C-0.514239 12.6848 0.0549147 15.8029 0.0549147 15.8029C0.0549147 15.8029 5.2196 6.74626 16.2691 5.92223C16.2691 5.92223 7.8292 4.60193 2.01208 10.2354Z"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill="#F98D33"
          d="M29.9882 23.538C32.5168 21.0886 31.9447 17.9718 31.9447 17.9718C31.9447 17.9718 26.7812 27.0292 15.7322 27.8527C15.7322 27.8527 24.1719 29.1727 29.9882 23.538Z"
        />
      </svg>
    ),
  },
  paypal: { Icon: SiPaypal, bg: "#003087", textColor: "text-white fill-current" },
  stripe: { Icon: SiStripe, bg: "#635BFF", textColor: "text-white fill-current" },

  // Security & Password Managers
  proton: { Icon: SiProton, bg: "#6D4AFF", textColor: "text-white fill-current" },
  bitwarden: { Icon: SiBitwarden, bg: "#175DDC", textColor: "text-white fill-current" },
  "1password": { Icon: Si1password, bg: "#0094F5", textColor: "text-white fill-current" },
  aegis: { Icon: SiAegisauthenticator, bg: "#0088CC", textColor: "text-white fill-current" },
  ente: { Icon: SiEnte, bg: "#5A67D8", textColor: "text-white fill-current" },
  dashlane: { Icon: SiDashlane, bg: "#0E7364", textColor: "text-white fill-current" },

  // Business & E-Commerce
  etsy: { Icon: SiEtsy, bg: "#F56400", textColor: "text-white fill-current" },
  shopify: { Icon: SiShopify, bg: "#7AB55C", textColor: "text-white fill-current" },
  wordpress: { Icon: SiWordpress, bg: "#21759B", textColor: "text-white fill-current" },
  dropbox: { Icon: SiDropbox, bg: "#0061FF", textColor: "text-white fill-current" },
  airbnb: { Icon: SiAirbnb, bg: "#FF5A5F", textColor: "text-white fill-current" },
  uber: { Icon: SiUber, bg: "#000000", textColor: "text-white fill-current" },
  patreon: { Icon: SiPatreon, bg: "#FF424D", textColor: "text-white fill-current" },
  mailchimp: { Icon: SiMailchimp, bg: "#FFE01B", textColor: "text-black fill-current" },
  zoho: { Icon: SiZoho, bg: "#E42527", textColor: "text-white fill-current" },
};

function findBrand(text: string): BrandEntry | null {
  const normalized = text.toLowerCase().trim();
  if (!normalized) return null;

  // Specific service & product overrides
  if (normalized.includes("opera gx") || normalized.includes("operagx")) return BRAND_MAP.operagx;
  if (normalized.includes("mozilla firefox")) return BRAND_MAP.firefox;
  if (normalized.includes("cc payment")) return BRAND_MAP.ccpayment;
  if (normalized.includes("vkontakte") || normalized.includes("vk.com")) return BRAND_MAP.vk;
  if (normalized.includes("x.com") || normalized.includes("x corp")) return BRAND_MAP.x;
  if (normalized.includes("azure") || normalized.includes("office365")) return BRAND_MAP.microsoft;
  if (normalized.includes("aws")) return BRAND_MAP.amazon;
  if (normalized.includes("open ai") || normalized.includes("gpt")) return BRAND_MAP.chatgpt;

  // Direct brand map check
  for (const [key, entry] of Object.entries(BRAND_MAP)) {
    if (key.length <= 2) {
      if (new RegExp(`(^|[^a-z0-9])${key}([^a-z0-9]|$)`, "i").test(normalized)) {
        return entry;
      }
    } else if (normalized.includes(key)) {
      return entry;
    }
  }

  // Generic email provider fallbacks (only if no other brand matched)
  if (normalized.includes("gmail")) return BRAND_MAP.google;
  if (
    normalized.includes("outlook") ||
    normalized.includes("hotmail") ||
    normalized.includes("live.com")
  ) {
    return BRAND_MAP.microsoft;
  }
  if (normalized.includes("icloud")) return BRAND_MAP.apple;

  return null;
}

function matchBrand(issuer?: string, name?: string): BrandEntry | null {
  // 1. Search in provider (issuer) first
  if (issuer) {
    const issuerMatch = findBrand(issuer);
    if (issuerMatch) return issuerMatch;
  }

  // 2. If no match in provider, search in account name
  if (name) {
    const nameMatch = findBrand(name);
    if (nameMatch) return nameMatch;
  }

  return null;
}

export default function BrandAvatar({
  name,
  issuer,
  color,
  className = "",
}: BrandAvatarProps) {
  const matched = matchBrand(issuer, name);
  const initial = (name || "?").charAt(0).toUpperCase();
  const fallbackBg = color || "#6366f1";

  if (matched) {
    const { Icon, svg, bg, textColor } = matched;
    return (
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-full shadow-xs transition-transform hover:scale-105 ${className}`}
        style={{ backgroundColor: bg }}
      >
        {Icon ? <Icon size={20} className={textColor || ""} /> : svg}
      </div>
    );
  }

  return (
    <div
      className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white shadow-xs transition-transform hover:scale-105 ${className}`}
      style={{ backgroundColor: fallbackBg }}
    >
      {initial}
    </div>
  );
}
