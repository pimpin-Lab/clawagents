import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Award, Video, UserCheck, Book } from 'lucide-react';

const learningPlatforms = [
  {
    name: 'freeCodeCamp',
    description: '免费编程学习平台，从零开始掌握 Web 开发，包含完整的交互式课程和认证',
    url: 'https://www.freecodecamp.org',
    icon: BookOpen,
    color: 'from-green-500 to-green-600',
    type: '免费',
    tags: ['Web 开发', '前端', '后端'],
  },
  {
    name: 'Coursera',
    description: '全球顶尖大学的在线课程平台，提供证书和专业认证项目',
    url: 'https://www.coursera.org',
    icon: Award,
    color: 'from-blue-600 to-blue-700',
    type: '付费/免费试听',
    tags: ['大学课程', '证书', '专业认证'],
  },
  {
    name: 'Udemy',
    description: '海量在线课程市场，涵盖编程、设计、商业等各个领域',
    url: 'https://www.udemy.com',
    icon: Video,
    color: 'from-orange-500 to-orange-600',
    type: '付费',
    tags: ['技能提升', '实战项目'],
  },
  {
    name: 'LeetCode',
    description: '算法刷题平台，准备大厂面试必备，提供公司分类题目和竞赛',
    url: 'https://leetcode.com',
    icon: BookOpen,
    color: 'from-yellow-500 to-yellow-600',
    type: '免费/付费',
    tags: ['算法', '面试', '刷题'],
  },
  {
    name: 'Pluralsight',
    description: '技术学习和认证平台，提供高质量的视频课程和技能评估',
    url: 'https://www.pluralsight.com',
    icon: Video,
    color: 'from-purple-600 to-purple-700',
    type: '付费',
    tags: ['专业技术', '云技术'],
  },
  {
    name: 'Udacity',
    description: '纳米学位项目平台，与 Google、Amazon 等大厂合作开发课程',
    url: 'https://www.udacity.com',
    icon: Award,
    color: 'from-teal-500 to-teal-600',
    type: '付费',
    tags: ['纳米学位', '职业发展'],
  },
  {
    name: 'Bilibili',
    description: '国内优质视频分享平台，丰富的编程学习教程和科技内容',
    url: 'https://www.bilibili.com',
    icon: Video,
    color: 'from-pink-400 to-pink-500',
    type: '免费',
    tags: ['中文教程', '开源社区'],
  },
  {
    name: '慕课网',
    description: '专注于程序员技能成长的实战学习平台',
    url: 'https://www.imooc.com',
    icon: UserCheck,
    color: 'from-indigo-500 to-indigo-600',
    type: '免费/付费',
    tags: ['实战项目', '中文教程'],
  },
];

const articleResources = [
  {
    title: 'React 官方文档',
    description: '最权威的 React 学习资源，从基础到高级用法',
    url: 'https://react.dev',
  },
  {
    title: 'TypeScript 手册',
    description: 'TypeScript 完整指南，类型系统深入解析',
    url: 'https://www.typescriptlang.org/docs',
  },
  {
    title: 'Vite 文档',
    description: '下一代前端工具链，快速开发和构建',
    url: 'https://vitejs.dev',
  },
  {
    title: 'Tailwind CSS 文档',
    description: '实用优先的 CSS 框架，快速构建界面',
    url: 'https://tailwindcss.com/docs',
  },
];

export function LearningResources() {
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
          <BookOpen className="w-7 h-7 text-blue-600" />
          学习资源推荐
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          精选优质的在线学习平台和文章资源，助你高效学习新技术。
        </p>
      </div>

      {/* Platforms Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Video className="w-5 h-5 text-blue-600" />
          在线学习平台
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningPlatforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${platform.color} rounded-lg flex items-center justify-center text-white`}>
                  <platform.icon className="w-6 h-6" />
                </div>
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                  platform.type === '免费' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  platform.type === '付费/免费试听' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                }`}>
                  {platform.type}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {platform.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2">
                {platform.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {platform.tags.map((tag) => (
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

      {/* Article Resources */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Book className="w-5 h-5 text-blue-600" />
          推荐文档与文章
        </h2>
        <div className="space-y-4">
          {articleResources.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {resource.description}
                  </p>
                </div>
                <span className="ml-4 text-gray-400 dark:text-gray-600 group-hover:text-blue-500 transition-colors">
                  →
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Tips */}
      <div className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          💡 学习建议
        </h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
            <span>制定明确的学习计划，坚持每天投入固定时间</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
            <span>理论与实践相结合，多做项目巩固知识</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
            <span>加入学习社群，与他人交流和分享经验</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
            <span>定期复盘总结，及时调整学习方法和方向</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
