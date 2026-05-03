import { siteConfig } from '../config/site';

export const Header = () => (
  <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between bg-gradient-to-b from-black/75 via-black/35 to-transparent p-4 backdrop-blur-[2px] pointer-events-none md:p-8">
    <div className="flex items-center gap-3 pointer-events-auto">
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[#00ff9d] bg-black">
        <img
          src="/icon.png"
          alt=""
          width="40"
          height="40"
          decoding="async"
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="text-xl font-black uppercase tracking-widest text-white">{siteConfig.name}</div>
    </div>
    <nav className="hidden gap-8 font-mono text-xs uppercase tracking-widest text-white pointer-events-auto md:flex" aria-label="Main navigation">
      {siteConfig.navItems.map((item) => (
        <a key={item.href} href={item.href} className="transition-colors hover:text-[#00ff9d]">
          {item.label}
        </a>
      ))}
    </nav>
  </header>
);
