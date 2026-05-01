import { useParams, Link } from 'react-router-dom';
import { articles } from '@/data/articles';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { Calendar, Clock, Eye, ArrowLeft, Tag as TagIcon, ChevronRight, Share2, ThumbsUp } from 'lucide-react';

export function Article() {
  const { slug } = useParams<{ slug: string }>();
  const article = articles.find((a) => a.slug === slug);

  // Get related articles (same category or tag)
  const relatedArticles = article
    ? articles.filter((a) =>
        a.id !== article.id &&
        (a.category === article.category ||
          a.tags.some((t) => article.tags.includes(t)))
      ).slice(0, 3)
    : [];

  if (!article) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">文章未找到</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">抱歉，你访问的文章可能已经被删除或移动。</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />返回首页
      </Link>

      {/* Article Header */}
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
          {article.title}
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          {article.summary}
        </p>

        {/* Meta bar */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 border-y border-gray-200 dark:border-gray-800 py-4">
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{article.date}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{article.readTime} 分钟阅读</span>
          {article.views && <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{(article.views).toLocaleString()} 阅读</span>}
          <span>{article.author}</span>
          <div className="ml-auto flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs font-medium">
              <ThumbsUp className="w-3.5 h-3.5" />点赞
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs font-medium">
              <Share2 className="w-3.5 h-3.5" />分享
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {article.tags.map(tag => (
            <Link key={tag} to={`/tag/${tag}`} className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
              <TagIcon className="w-3.5 h-3.5" />{tag}
            </Link>
          ))}
        </div>
      </header>

      {/* Content */}
      <article className="mb-12">
        <MarkdownRenderer content={article.content} />
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="border-t border-gray-200 dark:border-gray-800 pt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">推荐阅读</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedArticles.map(related => (
              <Link key={related.id} to={`/article/${related.slug}`} className="group p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-md">
                <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">{related.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{related.date} · {related.readTime} 分钟</p>
                <ChevronRight className="w-4 h-4 text-gray-400 mt-2 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
