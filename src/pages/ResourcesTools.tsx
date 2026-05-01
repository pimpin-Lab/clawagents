import { Link } from 'react-router-dom';
import { ArrowLeft, Code, Palette, Bug, Rocket, Terminal, Database } from 'lucide-react';

const tools = [
  {
    category: '代码编辑器',
    icon: Code,
    color: 'from-blue-500 to-indigo-600',
    items: [
      {
        name: 'VS Code',
        description: '微软开发的免费跨平台代码编辑器，支持丰富插件生态',
        url: 'https://code.visualstudio.com',
        tags: ['免费', '跨平台', '强大扩展'],
      },
      {
        name: 'WebStorm',
        description: 'JetBrains 出品的高级 JavaScript IDE，智能编码辅助',
        url: 'https://www.jetbrains.com/webstorm',
        tags: ['付费', '专业工具', '智能提示'],
      },
      {
        name: 'Sublime Text',
        description: '轻量级快速文本编辑器，启动迅速，性能优秀',
        url: 'https://www.sublimetext.com',
        tags: ['收费', '轻量', '快速'],
      },
    ],
  },
  {
    category: '设计工具',
    icon: Palette,
    color: 'from-pink-500 to-rose-600',
    items: [
      {
        name: 'Figma',
        description: '基于协作的界面设计工具，实时多人协同编辑',
        url: 'https://www.figma.com',
        tags: ['免费基础版', '协作', 'UI/UX'],
      },
      {
        name: 'Adobe XD',
        description: 'Adobe 推出的产品设计工具，原型设计和交互',
        url: 'https://www.adobe.com/products/xd',
        tags: ['付费', '原型设计', '集成 Adobe'],
      },
    ],
  },
  {
    category: '调试工具',
    icon: Bug,
    color: 'from-red-500 to-orange-600',
    items: [
      {
        name: 'Chrome DevTools',
        description: '浏览器内置的强大调试工具，性能分析和网络请求',
        url: 'https://developer.chrome.com/docs/devtools/',
        tags: ['免费', '浏览器内置', '全能'],
      },
      {
        name: 'Postman',
        description: 'API 开发和测试工具，请求管理和自动化测试',
        url: 'https://www.postman.com',
        tags: ['免费', 'API 测试', '团队协作'],
      },
      {
        name: 'Charles',
        description: 'HTTP 代理/监控工具，抓包和接口调试',
        url: 'https://www.charlesproxy.com',
        tags: ['付费', 'HTTP 调试', '抓包'],
      },
    ],
  },
  {
    category: '部署平台',
    icon: Rocket,
    color: 'from-green-500 to-emerald-600',
    items: [
      {
        name: 'Vercel',
        description: '前端部署平台，Zero 配置一键发布 Next.js 应用',
        url: 'https://vercel.com',
        tags: ['免费额度', '自动部署', 'Next.js'],
      },
      {
        name: 'Netlify',
        description: '现代化网站部署和服务平台，支持静态站和 JAMstack',
        url: 'https://www.netlify.com',
        tags: ['免费额度', 'CI/CD', 'Serverless'],
      },
      {
        name: 'Railway',
        description: '云部署平台，快速部署全栈应用和数据库',
        url: 'https://railway.app',
        tags: ['按量付费', '全栈', '简单上手'],
      },
    ],
  },
  {
    category: '开发终端',
    icon: Terminal,
    color: 'from-gray-700 to-gray-900',
    items: [
      {
        name: 'iTerm2',
        description: 'macOS 强大的终端替代品，分屏和搜索功能',
        url: 'https://iterm2.com',
        tags: ['macOS', '分屏', '增强功能'],
      },
      {
        name: 'Windows Terminal',
        description: '微软新一代 Windows 终端，多标签和多窗口',
        url: 'https://github.com/microsoft/terminal',
        tags: ['免费', '跨终端', '自定义'],
      },
    ],
  },
  {
    category: '数据库管理',
    icon: Database,
    color: 'from-purple-500 to-violet-600',
    items: [
      {
        name: 'DBeaver',
        description: '通用数据库管理工具，支持多种数据库连接',
        url: 'https://dbeaver.io',
        tags: ['免费开源', '多数据库', '企业级'],
      },
      {
        name: 'TablePlus',
        description: '现代、友好的数据库客户端，支持多种数据库',
        url: 'https://tableplus.com',
        tags: ['付费', '美观易用', '跨平台'],
      },
    ],
  },
];

export function ToolsResources() {
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
          <Code className="w-7 h-7 text-blue-600" />
          开发工具推荐
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          精选各类开发者必备的工具和资源，提升工作效率。
        </p>
      </div>

      {/* Tools Categories */}
      {tools.map((category) => (
        <section key={category.category} className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color}`}>
              <category.icon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {category.category}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.items.map((tool) => (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tool.name}
                  </h3>
                  <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                    访问 →
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2">
                  {tool.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag) => (
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
        </section>
      ))}

      {/* Additional Tips */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          ⚡ 效率建议
        </h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
            <span>选择适合你工作流的核心工具，保持专注</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
            <span>定期更新工具和依赖，获取最新功能和安全性修复</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
            <span>学习快捷键和高级功能，大幅提升工作效率</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
            <span>利用自动化工具减少重复性工作</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
