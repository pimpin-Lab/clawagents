import { Link } from 'react-router-dom';
import { articles } from '@/data/articles';
import { Tag as TagIcon, ArrowRight } from 'lucide-react';

const TAG_GRADIENTS = [
  'from-blue-400 to-cyan-500',
  'from-emerald-400 to-teal-500',
  'from-purple-400 to-indigo-500',
  'from-orange-400 to-amber-500',
  'from-pink-400 to-rose-500',
  'from-sky-400 to-blue-500',
  'from-fuchsia-400 to-pink-500',
  'from-lime-400 to-green-500',
  'from-red-400 to-orange-500',
  'from-violet-400 to-purple-500',
];

export function TagsOverview() {
  const tagCounts: Record<string, number> = {};
  articles.forEach((a) => a.tags.forEach(t => (tagCounts[t] = (tagCounts[t] || 0) + 1)));

  const tags = Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <TagIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">标签云</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">共 {tags.length} 个标签，{articles.length} 篇文章</p>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {tags.map((tag, i) => (
          <Link key={tag.name} to={`/tag/${tag.name}`}
            className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${TAG_GRADIENTS[i % TAG_GRADIENTS.length]} opacity-10 rounded-bl-full`} />
            <div className="relative z-10">
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tag.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tag.count} 篇文章</p>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 mt-3 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
