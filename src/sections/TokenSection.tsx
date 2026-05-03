import { IconArrowUpRight } from '../components/icons';
import { RevealText } from '../components/RevealText';
import { siteConfig } from '../config/site';
import { safeExternalUrl } from '../utils/safeExternalUrl';

const tokenUrl = safeExternalUrl(siteConfig.tokenUrl);

export const TokenSection = () => (
  <section id="token" className="relative z-10 px-4 py-24 md:py-32">
    <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7000ff] opacity-30 blur-[120px] filter pointer-events-none md:h-[600px] md:w-[600px] md:blur-[200px]" />

    <div className="glass-panel relative z-10 mx-auto max-w-4xl rounded-3xl border border-[#7000ff]/30 p-8 text-center md:p-16">
      <RevealText>
        <div className="mx-auto mb-6 w-full rounded-2xl border border-[#00ff9d] bg-black shadow-[0_0_40px_rgba(0,255,157,0.12)]">
          <img
            src="/token.png"
            alt="Official Token"
            width="1760"
            height="1232"
            loading="lazy"
            decoding="async"
            className="block h-auto w-full max-w-full object-contain"
          />
        </div>
      </RevealText>
      <RevealText delay={0.1}>
        <h2 className="mb-4 text-4xl font-black uppercase sm:text-5xl md:text-7xl">Official Token</h2>
      </RevealText>
      <RevealText delay={0.2}>
        <p className="mx-auto mb-8 max-w-lg text-sm text-gray-300 md:text-base">
          具体的な用途は未定。しかし、我々のコミュニティのポテンシャルを象徴するデジタルの証。
        </p>
      </RevealText>
      <RevealText delay={0.3}>
        {tokenUrl ? (
          <a
            href={tokenUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#00ff9d] px-6 py-3 text-sm font-bold text-black transition-transform hover:bg-white active:scale-95 md:px-8 md:py-4 md:text-base"
          >
            VIEW ON PUMP.FUN <IconArrowUpRight className="h-4 w-4 md:h-5 md:w-5" />
          </a>
        ) : null}
      </RevealText>
    </div>
  </section>
);
