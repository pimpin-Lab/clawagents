import { Link } from 'react-router-dom';
import { articles } from '@/data/articles';

const TAG_COLORS: Record<string, string> = {
  React: 'from-blue-400 to-cyan-500',
  TypeScript: 'from-sky-400 to-blue-500',
  CSS: 'from-pink-400 to-rose-500',
  'Node.js': 'from-green-400 to-emerald-500',
  Git: 'from-orange-400 to-amber-500',
  Docker: 'from-indigo-400 to-purple-500',
  Python: 'from-yellow-400 to-orange-500',
  Vue: 'from-teal-400 to-green-500',
  'Tailwind': 'from-cyan-400 to-blue-500',
  AI: 'from-fuchsia-400 to-pink-500',
};

export function TagList() {
  const tagCounts: Record<string, number> = {};
  articles.forEach((a) => a.tags.forEach((t) => (tagCounts[t] = (tagCounts[t] || 0) + 1)));

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">热门标签</h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(tagCounts).map(([name, count]) => {
          const colorClass = TAG_COLORS[name] || 'from-gray-400 to-gray-500';
          return (
            <Link key={name} to={`/tag/${name}`} className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg hover:shadow-md transition-all duration-200">
              <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${colorClass}`} />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">{name}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-0.5">{count}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
