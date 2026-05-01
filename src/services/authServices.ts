import type { User, LoginCredentials, RegisterData, UserRole, UserStats, AdminUserListItem } from '@/types';

// ==================== LocalStorage Keys ====================
const USERS_KEY = 'blog_users';
const TOKEN_KEY = 'blog_auth_token';
const CURRENT_USER_KEY = 'blog_current_user';

// ==================== Utility Functions ====================
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function hashPassword(password: string): string {
  // Simple hash for demo purposes (not secure for production)
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hashed_' + Math.abs(hash).toString(16);
}

function verifyPassword(password: string, hashed: string): boolean {
  return hashPassword(password) === hashed;
}

// ==================== Data Access Functions ====================
function getUsers(): (User & { _hashedPassword?: string })[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) return [];
    const users = JSON.parse(data);
    // Ensure all users have status field
    return users.map((u: User & { _hashedPassword?: string }) => ({
      ...u,
      status: u.status || 'active',
      role: u.role || 'user',
    }));
  } catch {
    return [];
  }
}

function saveUsers(users: (User & { _hashedPassword?: string })[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setToken(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}

function getCleanUser(user: User & { _hashedPassword?: string }): User {
  const { _hashedPassword, ...cleanUser } = user;
  return cleanUser as User;
}

// ==================== Auth Service ====================
export const AuthService = {
  /**
   * Check if user is logged in
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get current logged-in user
   */
  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<User> {
    // Validate
    if (!data.username || !data.email || !data.password) {
      throw new Error('请填写所有必填字段');
    }
    if (data.password !== data.confirmPassword) {
      throw new Error('两次输入的密码不一致');
    }
    if (data.password.length < 6) {
      throw new Error('密码长度至少为6位');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error('邮箱格式不正确');
    }

    const users = getUsers();

    // Check if email already exists
    if (users.some(u => u.email === data.email)) {
      throw new Error('该邮箱已被注册');
    }
    if (users.some(u => u.username === data.username)) {
      throw new Error('该用户名已被使用');
    }

    // Create new user
    const newUser: User & { _hashedPassword: string } = {
      id: generateId(),
      username: data.username,
      email: data.email,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}&background=random`,
      role: 'user',
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      favorites: [],
      history: [],
      _hashedPassword: hashPassword(data.password),
    };

    users.push(newUser);
    saveUsers(users);

    // Auto login
    const token = `token_${newUser.id}_${Date.now()}`;
    const cleanUser = getCleanUser(newUser);
    setToken(token, cleanUser);

    return cleanUser;
  },

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<User> {
    if (!credentials.email || !credentials.password) {
      throw new Error('请填写邮箱和密码');
    }

    const users = getUsers();
    const user = users.find(u => u.email === credentials.email);

    if (!user) {
      throw new Error('邮箱未注册');
    }

    // Check if user is banned
    if (user.status === 'banned') {
      throw new Error('该账号已被封禁，请联系管理员');
    }

    if (!verifyPassword(credentials.password, user._hashedPassword || '')) {
      throw new Error('密码错误');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    saveUsers(users);

    const token = `token_${user.id}_${Date.now()}`;
    const cleanUser = getCleanUser(user);
    setToken(token, cleanUser);

    return cleanUser;
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    clearToken();
  },

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<Pick<User, 'username' | 'avatar'>>): Promise<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('用户未登录');
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
      throw new Error('用户不存在');
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    saveUsers(users);

    const cleanUser = getCleanUser(users[userIndex]);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(cleanUser));

    return cleanUser;
  },

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    if (newPassword.length < 6) {
      throw new Error('新密码长度至少为6位');
    }

    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('用户未登录');
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
      throw new Error('用户不存在');
    }

    if (!verifyPassword(oldPassword, users[userIndex]._hashedPassword || '')) {
      throw new Error('原密码错误');
    }

    users[userIndex]._hashedPassword = hashPassword(newPassword);
    saveUsers(users);
  },

  /**
   * Favorite management
   */
  addFavorite(articleId: string): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    if (!currentUser.favorites.includes(articleId)) {
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === currentUser.id);

      if (userIndex !== -1) {
        users[userIndex].favorites = [...currentUser.favorites, articleId];
        saveUsers(users);

        const cleanUser = getCleanUser(users[userIndex]);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(cleanUser));
      }
    }
  },

  removeFavorite(articleId: string): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex !== -1) {
      users[userIndex].favorites = currentUser.favorites.filter(id => id !== articleId);
      saveUsers(users);

      const cleanUser = getCleanUser(users[userIndex]);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(cleanUser));
    }
  },

  getFavorites(): User | null {
    return this.getCurrentUser();
  },

  /**
   * History management
   */
  addToHistory(articleId: string): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    // Remove existing entry and add to front
    const filtered = currentUser.history.filter(id => id !== articleId);
    const newHistory = [articleId, ...filtered].slice(0, 50); // Keep last 50

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex !== -1) {
      users[userIndex].history = newHistory;
      saveUsers(users);

      const cleanUser = getCleanUser(users[userIndex]);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(cleanUser));
    }
  },

  getUserHistory(): User | null {
    return this.getCurrentUser();
  },

  /**
   * Clear all history
   */
  clearHistory(): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex !== -1) {
      users[userIndex].history = [];
      saveUsers(users);

      const cleanUser = getCleanUser(users[userIndex]);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(cleanUser));
    }
  },

  // ==================== Admin User Management ====================

  /**
   * Get all users with extended info for admin panel
   */
  getAdminUserList(): AdminUserListItem[] {
    const users = getUsers();
    return users.map(({ _hashedPassword, ...user }) => ({
      ...user,
      favoritesCount: user.favorites?.length || 0,
      historyCount: user.history?.length || 0,
      articleCount: user.articleCount || 0,
    }));
  },

  /**
   * Get user statistics
   */
  getUserStats(): UserStats {
    const users = getUsers();
    const now = new Date();
    const thisMonth = now.toISOString().substring(0, 7); // YYYY-MM

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      bannedUsers: users.filter(u => u.status === 'banned').length,
      adminCount: users.filter(u => u.role === 'admin').length,
      newUsersThisMonth: users.filter(u => u.joinDate?.startsWith(thisMonth)).length,
    };
  },

  /**
   * Get single user by ID
   */
  getUserById(userId: string): AdminUserListItem | null {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return null;

    const { _hashedPassword, ...cleanUser } = user;
    return {
      ...cleanUser,
      favoritesCount: cleanUser.favorites?.length || 0,
      historyCount: cleanUser.history?.length || 0,
      articleCount: cleanUser.articleCount || 0,
    } as AdminUserListItem;
  },

  /**
   * Ban a user
   */
  banUser(userId: string): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('权限不足');
    }
    if (currentUser.id === userId) {
      throw new Error('不能封禁自己');
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('用户不存在');
    }

    users[userIndex].status = 'banned';
    saveUsers(users);
  },

  /**
   * Unban a user
   */
  unbanUser(userId: string): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('权限不足');
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('用户不存在');
    }

    users[userIndex].status = 'active';
    saveUsers(users);
  },

  /**
   * Update user role
   */
  updateUserRole(userId: string, newRole: UserRole): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('权限不足');
    }
    if (currentUser.id === userId) {
      throw new Error('不能修改自己的角色');
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('用户不存在');
    }

    users[userIndex].role = newRole;
    saveUsers(users);
  },

  /**
   * Delete a user
   */
  deleteUser(userId: string): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('权限不足');
    }
    if (currentUser.id === userId) {
      throw new Error('不能删除自己');
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('用户不存在');
    }

    users.splice(userIndex, 1);
    saveUsers(users);
  },

  /**
   * Reset user password (admin)
   */
  resetUserPassword(userId: string, newPassword: string): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('权限不足');
    }

    if (newPassword.length < 6) {
      throw new Error('密码长度至少为6位');
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('用户不存在');
    }

    users[userIndex]._hashedPassword = hashPassword(newPassword);
    saveUsers(users);
  },

  /**
   * Batch operation: delete multiple users
   */
  batchDeleteUsers(userIds: string[]): number {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('权限不足');
    }

    const users = getUsers();
    const idsToDelete = new Set(userIds.filter(id => id !== currentUser.id));
    const originalCount = users.length;

    const filteredUsers = users.filter(u => !idsToDelete.has(u.id));
    saveUsers(filteredUsers);

    return originalCount - filteredUsers.length;
  },
};
