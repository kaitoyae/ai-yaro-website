import { IconActivity, IconGithub, IconZap } from '../components/icons';
import { RevealText } from '../components/RevealText';

const focusAreas = [
  { icon: IconActivity, title: 'Neuroscience', description: '神経科学' },
  { icon: IconActivity, title: 'Medicine', description: '医療応用' },
  { icon: IconZap, title: 'Physics', description: '物理学' },
  { icon: IconGithub, title: 'Computer Sci', description: '情報工学' },
] as const;

export const AboutSection = () => (
  <section id="about" className="relative z-10 px-4 py-20 md:px-10 md:py-32">
    <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
      <div>
        <RevealText>
          <h2 className="mb-6 text-4xl font-black uppercase leading-tight sm:text-6xl">
            Beyond <br />
            <span className="text-[#00ff9d]">Boundaries</span>
          </h2>
        </RevealText>
        <RevealText delay={0.1}>
          <div className="glass-panel mb-6 rounded-2xl border-l-4 border-l-[#7000ff] p-6">
            <p className="text-sm leading-relaxed text-gray-200">
              2025年に慶應義塾大学理工学部情報工学科の有志により設立。学生から社会人まで、様々なバックグラウンドを持つメンバーが集結するコミュニティです。
            </p>
          </div>
        </RevealText>
        <RevealText delay={0.2}>
          <p className="pl-2 text-sm leading-relaxed text-gray-400">
            我々の探求はコンピュータサイエンスに留まりません。神経科学、医療、物理学など、多岐にわたる分野のプロフェッショナルや探求者が交わり、先端技術の実践と知見を共有しています。
          </p>
        </RevealText>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {focusAreas.map((item, index) => {
          const Icon = item.icon;

          return (
            <RevealText key={item.title} delay={0.1 + index * 0.1}>
              <div className="glass-panel h-full rounded-xl p-5 transition-colors hover:border-[#00ff9d] md:p-6">
                <Icon className="mb-3 h-6 w-6 text-[#00ff9d] md:mb-4 md:h-8 md:w-8" />
                <h3 className="mb-1 text-sm font-bold md:text-base">{item.title}</h3>
                <p className="text-[10px] text-gray-500 md:text-xs">{item.description}</p>
              </div>
            </RevealText>
          );
        })}
      </div>
    </div>
  </section>
);
