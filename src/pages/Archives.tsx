import { Link } from 'react-router-dom';
import { articles } from '@/data/articles';
import { Calendar, BookOpen, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function Archives() {
  // Group articles by month/year
  const archiveMap = articles.reduce((acc, article) => {
    const date = new Date(article.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const key = `${year}-${month}`;
    
    if (!acc[key]) {
      acc[key] = {
        label: format(date, 'yyyy 年 MM 月', { locale: zhCN }),
        articles: [],
      };
    }
    acc[key].articles.push(article);
    return acc;
  }, {} as Record<string, { label: string; articles: typeof articles }>);

  // Sort by date descending
  const sortedArchives = Object.entries(archiveMap).sort(([a], [b]) => b.localeCompare(a));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Calendar className="w-7 h-7 text-blue-600" />
          文章归档
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          浏览所有历史文章，共 <span className="font-semibold text-blue-600">{articles.length}</span> 篇文章
        </p>
      </div>

      {/* Archive List */}
      <div className="space-y-4">
        {sortedArchives.map(([key, { label, articles: monthArticles }]) => (
          <div
            key={key}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Month Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{label}</h3>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {monthArticles.length} 篇
              </span>
            </div>

            {/* Articles List */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {monthArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/article/${article.slug}`}
                  className="group flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center text-sm font-medium text-blue-700 dark:text-blue-400">
                      {article.title.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        <span>{article.date}</span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {article.readTime}分钟
                        </span>
                        <span>{article.views || 0}次阅读</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedArchives.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            暂无文章
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            敬请期待，更多内容正在创作中...
          </p>
        </div>
      )}
    </div>
  );
}
