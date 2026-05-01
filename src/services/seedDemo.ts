import { AuthService } from './authServices';

export function seedDemoUsers() {
  try {
    // Check if already seeded
    const existingUsers = AuthService.getAdminUserList();
    if (existingUsers.length > 0) return;

    // Helper to directly create users in storage
    const users: any[] = [
      {
        id: 'admin_' + Date.now(),
        username: '管理员',
        email: 'admin@blog.com',
        avatar: 'https://ui-avatars.com/api/?name=管理员&background=6366f1&color=fff',
        role: 'admin',
        status: 'active',
        joinDate: '2024-01-01',
        lastLogin: new Date().toISOString(),
        favorites: ['1', '2', '3'],
        history: ['1', '2', '3', '4', '5'],
        articleCount: 12,
        _hashedPassword: 'hashed_' + Math.abs(('admin123').split('').reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0), 0) & Math.abs((('admin123').split('').reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0), 0) & 0xffffffff))).toString(16),
      },
      {
        id: 'user_' + Date.now(),
        username: '技术爱好者',
        email: 'user@blog.com',
        avatar: 'https://ui-avatars.com/api/?name=技术爱好者&background=10b981&color=fff',
        role: 'user',
        status: 'active',
        joinDate: '2024-03-15',
        lastLogin: new Date().toISOString(),
        favorites: ['1', '2'],
        history: ['1', '2', '3'],
        articleCount: 0,
        _hashedPassword: 'hashed_' + Math.abs(('user123').split('').reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0), 0) & Math.abs((('user123').split('').reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0), 0) & 0xffffffff))).toString(16),
      },
      {
        id: 'test_' + Date.now(),
        username: '测试账号',
        email: 'test@blog.com',
        avatar: 'https://ui-avatars.com/api/?name=测试账号&background=f59e0b&color=fff',
        role: 'user',
        status: 'banned',
        joinDate: '2024-06-20',
        favorites: [],
        history: ['1'],
        articleCount: 0,
        _hashedPassword: 'hashed_test',
      },
      {
        id: 'vip_' + Date.now(),
        username: 'VIP用户',
        email: 'vip@blog.com',
        avatar: 'https://ui-avatars.com/api/?name=VIP用户&background=ec4899&color=fff',
        role: 'user',
        status: 'active',
        joinDate: '2024-08-10',
        lastLogin: new Date().toISOString(),
        favorites: ['1', '2', '3', '4'],
        history: ['1', '2', '3', '4', '5', '6'],
        articleCount: 5,
        _hashedPassword: 'hashed_vip123',
      },
      {
        id: 'author_' + Date.now(),
        username: '资深作者',
        email: 'author@blog.com',
        avatar: 'https://ui-avatars.com/api/?name=资深作者&background=8b5cf6&color=fff',
        role: 'admin',
        status: 'active',
        joinDate: '2024-02-01',
        lastLogin: new Date().toISOString(),
        favorites: ['1', '2', '3', '4', '5'],
        history: ['1', '2', '3', '4', '5', '6', '7'],
        articleCount: 25,
        _hashedPassword: 'hashed_author123',
      },
    ];

    // Save directly to localStorage
    localStorage.setItem('blog_users', JSON.stringify(users));
  } catch (error) {
    console.error('Failed to seed demo users:', error);
  }
}
