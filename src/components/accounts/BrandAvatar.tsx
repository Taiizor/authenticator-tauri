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
  discord: { Icon: SiDiscord, bg: "#5865F2", textColor: "text-white fill-current" },
  apple: { Icon: SiApple, bg: "#000000", textColor: "text-white fill-current" },
  cloudflare: { Icon: SiCloudflare, bg: "#F38020", textColor: "text-white fill-current" },
  binance: { Icon: SiBinance, bg: "#F0B90B", textColor: "text-black fill-current" },
  steam: { Icon: SiSteam, bg: "#171a21", textColor: "text-white fill-current" },
  proton: { Icon: SiProton, bg: "#6D4AFF", textColor: "text-white fill-current" },
  docker: { Icon: SiDocker, bg: "#1D63ED", textColor: "text-white fill-current" },
  keycloak: { Icon: SiKeycloak, bg: "#008AEC", textColor: "text-white fill-current" },
  pgadmin: { Icon: SiPostgresql, bg: "#4169E1", textColor: "text-white fill-current" },
  postgres: { Icon: SiPostgresql, bg: "#4169E1", textColor: "text-white fill-current" },
  coolify: { Icon: SiCoolify, bg: "#6B46C1", textColor: "text-white fill-current" },
  spotify: { Icon: SiSpotify, bg: "#1DB954", textColor: "text-white fill-current" },
  gitlab: { Icon: SiGitlab, bg: "#FC6D26", textColor: "text-white fill-current" },
  bitbucket: { Icon: SiBitbucket, bg: "#0052CC", textColor: "text-white fill-current" },
  vercel: { Icon: SiVercel, bg: "#000000", textColor: "text-white fill-current" },
  netlify: { Icon: SiNetlify, bg: "#00C7B7", textColor: "text-white fill-current" },
  digitalocean: { Icon: SiDigitalocean, bg: "#0080FF", textColor: "text-white fill-current" },
  twitch: { Icon: SiTwitch, bg: "#9146FF", textColor: "text-white fill-current" },
  reddit: { Icon: SiReddit, bg: "#FF4500", textColor: "text-white fill-current" },
  facebook: { Icon: SiFacebook, bg: "#1877F2", textColor: "text-white fill-current" },
  instagram: { Icon: SiInstagram, bg: "#E4405F", textColor: "text-white fill-current" },
  dropbox: { Icon: SiDropbox, bg: "#0061FF", textColor: "text-white fill-current" },
  npm: { Icon: SiNpm, bg: "#CB3837", textColor: "text-white fill-current" },
  paypal: { Icon: SiPaypal, bg: "#003087", textColor: "text-white fill-current" },
  stripe: { Icon: SiStripe, bg: "#635BFF", textColor: "text-white fill-current" },
  coinbase: { Icon: SiCoinbase, bg: "#0052FF", textColor: "text-white fill-current" },
  bitwarden: { Icon: SiBitwarden, bg: "#175DDC", textColor: "text-white fill-current" },
  etsy: { Icon: SiEtsy, bg: "#F56400", textColor: "text-white fill-current" },
  shopify: { Icon: SiShopify, bg: "#7AB55C", textColor: "text-white fill-current" },
  wordpress: { Icon: SiWordpress, bg: "#21759B", textColor: "text-white fill-current" },
  amazon: {
    bg: "#FF9900",
    svg: (
      <svg viewBox="0 0 24 24" className="size-5 fill-black">
        <path d="M13.92 11.53c-1.74-.23-3.92.36-4.88 1.76-.84 1.2-1.07 2.65-.45 4.02.66 1.4 2.2 2.05 3.65 1.83 1.5-.23 2.87-1.2 3.42-2.62.15-.38.25-.8.28-1.21V13.8c-.64-1.12-1.25-1.9-2.02-2.27zm-1.05 5.56c-.95.12-1.85-.36-2.18-1.25-.33-.9-.05-1.9.68-2.45.74-.55 1.78-.71 2.66-.56v2.46c-.36 1.13-.53 1.72-1.16 1.8zm10.74 3.7c-.24.18-.58.19-.84.05-1.21-.69-2.29-1.57-3.23-2.61-.17-.18-.14-.46.06-.61.19-.14.47-.1.63.08.88.97 1.89 1.8 3.02 2.45.26.15.35.48.16.74-.03.04-.07.07-.1.1zM.5 17.5c4.8 3.5 11.2 5.5 17.2 3 1.2-.5 2.3-1.2 3.4-2 .2-.2.5-.1.6.1.1.2.1.5-.1.7-1.2.9-2.4 1.7-3.7 2.2-6.5 2.7-13.4.5-18.5-3.3-.3-.2-.3-.5-.1-.7.2-.3.5-.3.8-.1z" />
      </svg>
    ),
  },
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
};

function matchBrand(issuer?: string, name?: string): BrandEntry | null {
  const combined = `${issuer || ""} ${name || ""}`.toLowerCase();

  for (const [key, entry] of Object.entries(BRAND_MAP)) {
    if (combined.includes(key)) {
      return entry;
    }
  }

  // Alias checks
  if (combined.includes("gmail")) return BRAND_MAP.google;
  if (
    combined.includes("outlook") ||
    combined.includes("azure") ||
    combined.includes("office365") ||
    combined.includes("hotmail") ||
    combined.includes("live.com")
  ) {
    return BRAND_MAP.microsoft;
  }
  if (combined.includes("aws")) return BRAND_MAP.amazon;
  if (combined.includes("icloud")) return BRAND_MAP.apple;

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
