import Link from 'next/link';
import { Article, categoryLabels, Category } from '@/data/articles';

interface SidebarProps {
  mostRead: Article[];
}

const rankColors = ['from-[#00aaff] to-[#7c3aed]', 'from-[#00aaff] to-[#0088cc]',
                    'from-[#7c3aed] to-[#5b21b6]', 'from-[#30363d] to-[#1c2333]', 'from-[#30363d] to-[#1c2333]'];

export default function Sidebar({ mostRead }: SidebarProps) {
  return (
    <aside className="space-y-5">

      {/* Most Read */}
      <div className="bg-[#1c2333] border border-[#30363d] rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-[#161b22] border-b border-[#30363d] flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#00aaff] to-[#7c3aed]" />
          <h3 className="text-sm font-black text-white uppercase tracking-wide">Meest gelezen</h3>
        </div>
        <div className="divide-y divide-[#30363d]/60">
          {mostRead.map((article, i) => {
            return (
              <Link
                key={article.id}
                href={`/artikel/${article.slug}`}
                className="group flex gap-3 p-3.5 hover:bg-[#161b22]/80 transition-colors"
              >
                <div className={`flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br ${rankColors[i]}
                                 flex items-center justify-center shadow-lg`}>
                  <span className="text-xs font-black text-white">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-[#e6edf3] group-hover:text-[#00aaff]
                                 transition-colors line-clamp-2 leading-snug mb-0.5">
                    {article.title}
                  </h4>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Category pills */}
      <div className="bg-[#1c2333] border border-[#30363d] rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-[#161b22] border-b border-[#30363d] flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#7c3aed] to-[#00aaff]" />
          <h3 className="text-sm font-black text-white uppercase tracking-wide">Categorieën</h3>
        </div>
        <div className="p-3.5 flex flex-wrap gap-2">
          {(Object.keys(categoryLabels) as Category[]).map((cat) => (
            <Link
              key={cat}
              href={`/categorie/${cat}`}
              className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg
                         border border-[#30363d] text-[#8b949e]
                         hover:border-[#00aaff]/60 hover:text-[#00aaff] hover:bg-[#00aaff]/5
                         transition-all"
            >
              {categoryLabels[cat]}
            </Link>
          ))}
        </div>
      </div>

    </aside>
  );
}
