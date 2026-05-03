import { IconMessageCircle } from '../components/icons';
import { RevealText } from '../components/RevealText';
import { siteConfig } from '../config/site';

export const ActivitiesSection = () => (
  <section id="activities" className="relative z-10 bg-gradient-to-b from-transparent to-[#111111]/80 px-4 py-20 md:px-10 md:py-32">
    <div className="mx-auto max-w-6xl">
      <RevealText>
        <h2 className="mb-2 font-mono text-xs tracking-widest text-[#00ff9d]">CORE ACTIVITIES</h2>
      </RevealText>
      <RevealText delay={0.1}>
        <div className="mb-10 text-3xl font-black md:mb-16 md:text-5xl">DYNAMIC INTERACTION</div>
      </RevealText>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <RevealText delay={0.2}>
          <div className="glass-panel group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl p-6 md:p-8">
            <div className="absolute right-[-20%] top-[-50%] h-64 w-64 rounded-full bg-[#00ff9d] opacity-20 blur-[100px] filter" />

            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <IconMessageCircle className="h-6 w-6 text-[#00ff9d]" />
                <h3 className="text-xl font-bold md:text-2xl">LINE Community</h3>
              </div>
              <p className="text-sm text-gray-300">日々の技術的なディスカッション、最新情報の共有、そして雑談。活発なオンライン交流の場。</p>
            </div>
            <div className="relative z-10 mt-10 flex items-end justify-between border-t border-white/10 pt-6">
              <div>
                <div className="text-4xl font-black text-white md:text-5xl">{siteConfig.activeMembers}</div>
                <div className="mt-1 font-mono text-[10px] text-gray-400">ACTIVE MEMBERS</div>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-[#00ff9d]/10 px-3 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ff9d] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00ff9d]" />
                </span>
                <span className="font-mono text-[10px] font-bold text-[#00ff9d]">ONLINE</span>
              </div>
            </div>
          </div>
        </RevealText>

        <RevealText delay={0.3}>
          <div className="glass-panel group relative flex h-[350px] flex-col justify-end overflow-hidden rounded-3xl border-gray-800 p-0 md:h-full">
            <img
              src="/event.jpg"
              alt="Offline Meetups の集合写真"
              width="1477"
              height="1108"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 z-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent" />

            <div className="relative z-20 p-6 md:p-8">
              <div className="mb-3 inline-block rounded border border-[#7000ff]/50 bg-[#7000ff]/30 px-2 py-1 font-mono text-[10px] text-white">
                HELD TWICE
              </div>
              <h3 className="mb-2 text-2xl font-bold md:text-3xl">Offline Meetups</h3>
              <p className="text-xs text-gray-300 md:text-sm">
                画面を越えた熱狂。多様な専門分野を持つメンバーが直接顔を合わせ、未来の技術について語り合う対面交流会。
              </p>
            </div>
          </div>
        </RevealText>
      </div>
    </div>
  </section>
);
