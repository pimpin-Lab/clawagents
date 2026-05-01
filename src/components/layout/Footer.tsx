import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>我的博客</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              用代码记录思考，用文字分享知识。专注于前端开发、后端技术和 DevOps 实践。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">快速导航</h4>
            <ul className="space-y-2">
              {[
                { label: '首页', path: '/' },
                { label: '归档', path: '/archives' },
                { label: '标签', path: '/tags' },
                { label: '关于', path: '/about' },
              ].map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">技术分类</h4>
            <ul className="space-y-2">
              {[
                { label: '前端开发', path: '/category/front-end' },
                { label: '后端开发', path: '/category/back-end' },
                { label: 'DevOps', path: '/category/devops' },
                { label: '数据库', path: '/category/database' },
              ].map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">资源中心</h4>
            <ul className="space-y-2">
              {[
                { label: '常用网站', path: '/resources/websites' },
                { label: '学习资源', path: '/resources/learning' },
                { label: '开发工具', path: '/resources/tools' },
              ].map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            &copy; {currentYear} 我的博客. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Powered by React + TypeScript + Vite
          </p>
        </div>
      </div>
    </footer>
  );
}
