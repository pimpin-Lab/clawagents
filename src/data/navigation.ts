import type { NavLink } from '@/types';

export const navLinks: NavLink[] = [
  { label: '首页', path: '/' },
  {
    label: '技术文章',
    path: '#',
    children: [
      { label: '前端开发', path: '/category/front-end' },
      { label: '后端开发', path: '/category/back-end' },
      { label: '移动端开发', path: '/category/mobile' },
      { label: 'DevOps', path: '/category/devops' },
      { label: '数据库', path: '/category/database' },
      { label: 'AI & 机器学习', path: '/category/ai' },
    ],
  },
  {
    label: '资源中心',
    path: '#',
    children: [
      { label: '常用网站', path: '/resources/websites' },
      { label: '学习资源', path: '/resources/learning' },
      { label: '开发工具', path: '/resources/tools' },
    ],
  },
  { label: '标签', path: '/tags' },
  { label: '归档', path: '/archives' },
  { label: '关于', path: '/about' },
];
