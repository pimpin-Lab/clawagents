import { useParams, Link } from 'react-router-dom';
import { articles } from '@/data/articles';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { ArrowLeft, Tag as TagIcon, BookOpen } from 'lucide-react';

const categoryInfo: Record<string, { icon: string; description: string }> = {
  '前端开发': {
    icon: '🎨',
    description: '探索现代前端技术，包括 React、Vue、TypeScript、性能优化等。',
  },
  '后端开发': {
    icon: '⚙️',
    description: '后端架构设计、API 开发、微服务等技术分享。',
  },
  '数据库': {
    icon: '🗄️',
    description: '数据库设计、优化、缓存策略以及 NoSQL 解决方案。',
  },
  'DevOps': {
    icon: '🚀',
    description: '容器化部署、CI/CD、云服务及运维自动化实践。',
  },
  '移动端开发': {
    icon: '📱',
    description: '跨平台移动应用开发、原生 iOS/Android 开发经验。',
  },
  'AI & 机器学习': {
    icon: '🤖',
    description: '人工智能、机器学习、深度学习技术应用。',
  },
};

export function Category() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  
  // Normalize category name (handle both slug and Chinese names)
  const categoryName = Object.keys(categoryInfo).find(key => 
    key.toLowerCase().includes(categorySlug || '') || 
    categorySlug === key.replace(/ /g, '-')
  ) || '';

  const categoryArticles = articles.filter((a) => a.category === categoryName);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回首页
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{categoryInfo[categoryName]?.icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {categoryName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {categoryInfo[categoryName]?.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <BookOpen className="w-4 h-4" />
          <span>共 {categoryArticles.length} 篇文章</span>
        </div>
      </div>

      {/* Articles */}
      <div className="space-y-4">
        {categoryArticles.length > 0 ? (
          categoryArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              该分类下暂无文章
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              敬请期待，更多内容正在创作中...
            </p>
            <Link
              to="/tags"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <TagIcon className="w-4 h-4" />
              浏览标签
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
