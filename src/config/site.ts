import type { HttpsUrl } from '../utils/safeExternalUrl';

type SiteConfig = {
  name: string;
  repositoryUrl: HttpsUrl;
  tokenUrl: HttpsUrl;
  establishedYear: number;
  activeMembers: number;
  navItems: readonly {
    href: `#${string}`;
    label: string;
  }[];
};

export const siteConfig = {
  name: 'AI野郎',
  repositoryUrl: 'https://github.com/kaitoyae/ai-yaro-website',
  tokenUrl: 'https://pump.fun/coin/Ev3BaMn4ttzWAjt8aDHy7M6UE5utfTvzcmEiTh2opump',
  establishedYear: 2025,
  activeMembers: 124,
  navItems: [
    { href: '#about', label: 'About' },
    { href: '#activities', label: 'Activities' },
    { href: '#projects', label: 'Projects' },
    { href: '#token', label: 'Token' },
  ],
} as const satisfies SiteConfig;
