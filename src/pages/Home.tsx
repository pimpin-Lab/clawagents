import { ArticleCard } from '@/components/ui/ArticleCard';
import { TagList } from '@/components/ui/TagList';
import { articles } from '@/data/articles';
import { Search, TrendingUp, Clock, Star, Mail } from 'lucide-react';
import { useState } from 'react';

export function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  // Get featured articles
  const featuredArticles = articles.filter(a => a.isFeatured).slice(0, 3);
  
  // Get recent posts (sorted by date)
  const recentPosts = [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  
  // Get popular articles (sorted by views)
  const popularArticles = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Category data
  const categories = [
    { name: '前端开发', count: 6, icon: '🎨', color: 'from-blue-400 to-cyan-500' },
    { name: '后端开发', count: 4, icon: '⚙️', color: 'from-emerald-400 to-green-500' },
    { name: '数据库', count: 2, icon: '🗄️', color: 'from-purple-400 to-pink-500' },
    { name: 'DevOps', count: 3, icon: '🚀', color: 'from-orange-400 to-red-500' },
    { name: '移动端开发', count: 1, icon: '📱', color: 'from-pink-400 to-rose-500' },
    { name: 'AI & 机器学习', count: 1, icon: '🤖', color: 'from-indigo-400 to-violet-500' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 p-8 sm:p-12 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">欢迎来到我的博客</h1>
            <p className="text-lg text-blue-100 mb-6 max-w-xl">
              这里记录了我的技术探索、学习心得和项目实践。
              专注于前端开发、全栈技术和性能优化。
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#posts" className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                浏览文章
              </a>
              <a href="/about" className="inline-flex items-center px-4 py-2 border-2 border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-colors">
                了解更多
              </a>
            </div>
          </div>
        </section>

        {/* Featured Articles Carousel */}
        {featuredArticles.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                精选文章
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredArticles.map((article) => (
                <a key={article.id} href={`/article/${article.slug}`}>
                  <ArticleCard article={article} />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Category Quick Access */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">快速分类</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((category) => (
              <a
                key={category.name}
                href={`/category/${category.name.toLowerCase()}`}
                className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{category.count} 篇文章</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Recent Posts */}
        <section id="posts">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            最新文章
          </h2>
          <div className="space-y-4">
            {recentPosts.slice(0, 3).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        {/* All Articles with Search */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">全部文章</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">{articles.length} 篇</span>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索文章..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-4">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>没有找到匹配的文章</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Subscribe Widget */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6" />
            <h3 className="text-lg font-bold">订阅更新</h3>
          </div>
          <p className="text-blue-100 text-sm mb-4">
            获取最新的文章通知和技术分享，每周一准时送达你的邮箱。
          </p>
          <input
            type="email"
            placeholder="你的邮箱地址"
            className="w-full px-4 py-2.5 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 mb-3"
          />
          <button className="w-full py-2.5 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">
            立即订阅
          </button>
        </div>

        {/* About Widget */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            关于博主
          </h3>
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 mx-auto">
            博
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-center">
            一名热爱技术的全栈开发者，专注于前端开发和用户体验设计。
            喜欢探索新技术，分享学习笔记。
          </p>
        </div>

        {/* Popular Articles */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            热门文章
          </h3>
          <div className="space-y-3">
            {popularArticles.map((article, index) => (
              <a key={article.id} href={`/article/${article.slug}`} className="block group">
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    index === 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                    'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {article.views || 0} 次阅读
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Stats Widget */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            博客统计
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {articles.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">文章总数</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(articles.flatMap((a) => a.tags)).size}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">标签数量</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(articles.map(a => a.category)).size}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">分类数</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {articles.reduce((sum, a) => sum + (a.views || 0), 0)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">总阅读量</div>
            </div>
          </div>
        </div>

        {/* Tags Widget */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <TagList />
        </div>
      </div>
    </div>
  );
}
