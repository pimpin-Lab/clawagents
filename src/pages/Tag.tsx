import { useParams, Link } from 'react-router-dom';
import { articles } from '@/data/articles';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { ArrowLeft as BackIcon, Tag as TagIcon, BookOpen } from 'lucide-react';

export function TagPage() {
  const { tagName } = useParams<{ tagName: string }>();
  const tagArticles = articles.filter((a) => a.tags.includes(tagName || ''));

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors">
        <BackIcon className="w-4 h-4" />返回首页
      </Link>

      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-900/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <TagIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{tagName}</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 ml-15 pl-15">
          <BookOpen className="w-4 h-4 inline mr-1" />
          共 {tagArticles.length} 篇文章
        </p>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {tagArticles.length > 0 ? tagArticles.map(article => <ArticleCard key={article.id} article={article} />) : (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-2xl">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>该标签下暂无文章</p>
          </div>
        )}
      </div>
    </div>
  );
}
