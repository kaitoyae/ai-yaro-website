import { siteConfig } from '../config/site';

export const Footer = () => (
  <footer className="relative z-10 border-t border-white/5 bg-[#030303]/[0.88] py-8 text-center">
    <div className="px-4 font-mono text-[10px] leading-relaxed tracking-widest text-gray-600">
      © {siteConfig.establishedYear} AI YARO. ALL RIGHTS RESERVED.
      <br />
      ESTABLISHED BY KEIO UNIVERSITY STUDENTS & ALUMNI.
    </div>
  </footer>
);
