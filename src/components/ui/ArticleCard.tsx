import { Link } from 'react-router-dom';
import type { Article } from '@/types';
import { Calendar, Clock, Eye } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300">
      <div className="flex flex-col h-full">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {article.tags.slice(0, 3).map((tag) => (
            <Link
              key={tag}
              to={`/tag/${tag}`}
              className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>

        {/* Title */}
        <Link to={`/article/${article.slug}`}>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {article.title}
          </h3>
        </Link>

        {/* Summary */}
        <p className="text-gray-600 dark:text-gray-400 mb-4 flex-1 line-clamp-3 leading-relaxed">
          {article.summary}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500 pt-4 border-t border-gray-100 dark:border-gray-800">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {article.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {article.readTime} 分钟
          </span>
          {article.views && (
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {article.views.toLocaleString()}
            </span>
          )}
          <span className="ml-auto text-gray-400 dark:text-gray-600">
            {article.author}
          </span>
        </div>
      </div>
    </article>
  );
}
