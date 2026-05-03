import { IconArrowUpRight } from '../components/icons';
import { RevealText } from '../components/RevealText';
import { memberProjects } from '../data/memberProjects';
import { safeExternalUrl } from '../utils/safeExternalUrl';

export const ProjectsSection = () => (
  <section
    id="projects"
    className="relative z-10 border-t border-white/10 bg-gradient-to-b from-[#030303]/[0.88] via-[#020202]/[0.80] to-[#050505]/[0.84] px-4 py-20 md:from-[#030303]/[0.72] md:via-[#020202]/[0.64] md:to-[#050505]/[0.78] md:px-10 md:py-32"
  >
    <div className="mx-auto max-w-6xl">
      <RevealText>
        <h2 className="mb-2 font-mono text-xs tracking-widest text-[#00ff9d]">PROJECT</h2>
      </RevealText>
      <RevealText delay={0.05}>
        <p className="mb-4 text-3xl font-black md:text-5xl">コミュニティの挑戦</p>
      </RevealText>
      <RevealText delay={0.1}>
        <p className="mb-10 max-w-2xl text-xs leading-relaxed text-gray-400 md:text-sm">
          メンバーが個別に取り組むプロジェクトをカードで紹介します。追加・更新はリポジトリの{' '}
          <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-gray-300">src/data/memberProjects.ts</code>{' '}
          を編集し、Pull Request を送ってください。
        </p>
      </RevealText>

      {memberProjects.length === 0 ? (
        <p className="text-sm text-gray-400">まだ登録がありません。`memberProjects` 配列にエントリを追加してください。</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {memberProjects.map((project, index) => {
            const projectUrl = safeExternalUrl(project.url);

            return (
              <RevealText key={project.id} delay={0.05 * Math.min(index, 8)}>
                <article className="glass-panel flex h-full flex-col rounded-2xl border border-white/5 p-5 transition-colors hover:border-[#00ff9d]/35 md:p-6">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold leading-snug text-white md:text-xl">{project.title}</h3>
                    <time className="shrink-0 whitespace-nowrap font-mono text-[10px] text-gray-500" dateTime={project.updatedAt}>
                      {project.updatedAt}
                    </time>
                  </div>
                  <p className="mb-4 flex-1 text-xs leading-relaxed text-gray-300 md:text-sm">{project.description}</p>
                  <p className="mb-3 font-mono text-[10px] text-[#00ff9d]">- {project.member}</p>
                  {project.tags && project.tags.length > 0 ? (
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span key={`${project.id}-${tag}`} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-gray-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {projectUrl ? (
                    <a
                      href={projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-white transition-colors hover:text-[#00ff9d]"
                    >
                      リンクを開く <IconArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </article>
              </RevealText>
            );
          })}
        </div>
      )}
    </div>
  </section>
);
