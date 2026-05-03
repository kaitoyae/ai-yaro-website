import { IconGithub, IconZap } from '../components/icons';
import { RevealText } from '../components/RevealText';
import { siteConfig } from '../config/site';

const marqueeItems = Array.from({ length: 6 }, (_, index) => index);

export const ContributeSection = () => (
  <section className="relative z-10 border-t border-white/10 bg-black py-20 md:py-32">
    <div className="mb-16 w-full -rotate-1 overflow-hidden bg-[#00ff9d] py-2 text-black">
      <div className="marquee-track flex whitespace-nowrap">
        {[0, 1].map((group) => (
          <div key={group} className="flex shrink-0">
            {marqueeItems.map((item) => (
              <span key={`${group}-${item}`} className="flex items-center gap-4 px-4 text-xl font-black uppercase tracking-widest">
                OPEN SOURCE PROJECT <IconZap className="h-5 w-5" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>

    <div className="mx-auto max-w-6xl px-4 md:px-10">
      <RevealText>
        <div className="glass-panel mx-auto max-w-3xl rounded-2xl border-l-4 border-l-[#00ff9d] p-6 md:p-8">
          <h3 className="mb-3 text-2xl font-bold">Contribute</h3>
          <p className="mb-6 text-xs text-gray-400 md:text-sm">
            AI野郎のWebサイトはオープンソースです。メンバーによる自発的で積極的な更新を歓迎します。限界を突破するコードをPushしてください。
          </p>
          <a
            href={siteConfig.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-bold text-black active:bg-gray-200"
          >
            <IconGithub className="h-3 w-3" /> GITHUB REPO
          </a>
        </div>
      </RevealText>
    </div>
  </section>
);
