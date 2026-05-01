import { Github, Twitter, Mail, MapPin, Code2, Coffee, Heart } from 'lucide-react';

const skills = [
  { name: 'React / Next.js', level: 95 },
  { name: 'TypeScript', level: 90 },
  { name: 'Node.js', level: 85 },
  { name: 'Python', level: 80 },
  { name: 'Docker / K8s', level: 75 },
  { name: 'PostgreSQL / Redis', level: 70 },
];

const timeline = [
  { year: '2026', title: '博客上线', desc: '开始系统地记录和分享技术知识' },
  { year: '2025', title: '全栈进阶', desc: '深入学习和实践前端、后端及 DevOps 技术栈' },
  { year: '2024', title: '独立开发项目', desc: '主导多个开源项目，积累工程实践经验' },
  { year: '2023', title: '加入技术社区', desc: '开始在技术社区活跃交流' },
];

export function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero */}
      <section className="text-center">
        <div className="w-28 h-28 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6 shadow-xl ring-4 ring-white/50 dark:ring-gray-900/50">
          博
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">你好，我是博主</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          一名热爱技术的全栈开发者，专注于前端开发和用户体验设计。
          相信开源的力量，喜欢探索新技术并将所学分享给社区。
        </p>
      </section>

      {/* Intro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">个人简介</h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>你好！我是一名热爱技术的全栈开发者，目前主要专注于前端开发和用户体验设计。我相信技术可以让世界变得更好，也希望通过分享我的学习心得和技术经验，能够帮助到更多正在学习路上的朋友。</p>
            <p>我喜欢探索新技术，研究最佳实践，并将所学应用到实际项目中。这个博客记录了我的技术学习之旅，包括前端开发、后端开发、工具使用等方面的内容。</p>
            <p>工作之余，我喜欢阅读、旅行和摄影。我相信生活中的点滴感悟也能反哺到技术工作中。期待通过这篇博客与你们一起成长 🚀</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white flex flex-col justify-between">
          <div>
            <MapPin className="w-5 h-5 mb-4 opacity-80" />
            <p className="font-medium">📍 中国</p>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2"><Code2 className="w-4 h-4 opacity-80" /><span>全栈开发者</span></div>
            <div className="flex items-center gap-2"><Coffee className="w-4 h-4 opacity-80" /><span>咖啡爱好者</span></div>
            <div className="flex items-center gap-2"><Heart className="w-4 h-4 opacity-80" /><span>开源贡献者</span></div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">技术栈</h2>
        <div className="space-y-4">
          {skills.map(skill => (
            <div key={skill.name}>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{skill.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{skill.level}%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">技术旅程</h2>
        <div className="space-y-6">
          {timeline.map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex-shrink-0 w-16 text-right">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{item.year}</span>
              </div>
              <div className="flex-1 pt-1 pb-3 border-l-2 border-gray-200 dark:border-gray-800 ml-3 last:border-0">
                <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">联系我</h2>
        <div className="flex justify-center gap-4">
          {[
            { Icon: Github, label: 'GitHub', href: 'https://github.com' },
            { Icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
            { Icon: Mail, label: '邮箱', href: 'mailto:hello@example.com' },
          ].map(({ Icon, label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
               className="flex flex-col items-center gap-2 px-6 py-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700">
              <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
