import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, Code, Users, TrendingUp, Book } from 'lucide-react';

const resources = [
  {
    name: 'GitHub',
    description: '全球最大的代码托管平台，超过 1 亿开发者的选择',
    url: 'https://github.com',
    icon: Code,
    color: 'from-gray-700 to-gray-900',
    tags: ['代码托管', '开源'],
  },
  {
    name: 'Stack Overflow',
    description: '全球最知名的程序员问答社区，解决技术难题',
    url: 'https://stackoverflow.com',
    icon: Users,
    color: 'from-orange-500 to-orange-600',
    tags: ['问答', '技术论坛'],
  },
  {
    name: 'MDN Web Docs',
    description: 'Mozilla 维护的开发者文档，Web 技术权威参考',
    url: 'https://developer.mozilla.org',
    icon: Book,
    color: 'from-red-500 to-red-600',
    tags: ['文档', '学习'],
  },
  {
    name: 'Dev.to',
    description: '开发者博客社区，分享技术文章和经验',
    url: 'https://dev.to',
    icon: Globe,
    color: 'from-yellow-400 to-yellow-500',
    tags: ['博客', '社区'],
  },
  {
    name: 'Hacker News',
    description: '科技创业和编程新闻聚合社区',
    url: 'https://news.ycombinator.com',
    icon: TrendingUp,
    color: 'from-orange-400 to-orange-500',
    tags: ['新闻', '创业'],
  },
  {
    name: 'Reddit - r/programming',
    description: '编程相关讨论和技术分享',
    url: 'https://reddit.com/r/programming',
    icon: Globe,
    color: 'from-orange-600 to-red-600',
    tags: ['论坛', '讨论'],
  },
  {
    name: 'LeetCode',
    description: '算法刷题平台，备战大厂面试',
    url: 'https://leetcode.com',
    icon: Code,
    color: 'from-blue-500 to-blue-600',
    tags: ['算法', '刷题'],
  },
  {
    name: 'Product Hunt',
    description: '发现最新的产品和创业公司',
    url: 'https://producthunt.com',
    icon: TrendingUp,
    color: 'from-green-500 to-green-600',
    tags: ['产品', '创业'],
  },
];

export function WebsitesResources() {
  return (
    <div className="max-w-6xl mx-auto">
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Globe className="w-7 h-7 text-blue-600" />
          常用网站推荐
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          精选程序员必备的网站资源，帮助你更高效地学习和工作。
        </p>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <a
            key={resource.name}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${resource.color} rounded-lg flex items-center justify-center text-white`}>
                <resource.icon className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                访问 →
              </span>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {resource.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {resource.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {resource.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          📌 使用建议
        </h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
            <span>定期关注这些网站的更新，保持对行业趋势的了解</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
            <span>将常用网站添加到浏览器书签，方便快速访问</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
            <span>参与社区讨论，与其他开发者交流学习经验</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
            <span>善用搜索功能，快速找到所需的信息和解决方案</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
