export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  tags: string[];
  category: string;
  coverImage?: string;
  author: string;
  readTime: number;
  views?: number;
  isFeatured?: boolean;
}

export interface Tag {
  name: string;
  count: number;
  color: string;
}

export interface NavLink {
  label: string;
  path: string;
  children?: NavLink[];
}

// ==================== Auth Types ====================

export type UserRole = 'user' | 'admin';

export type UserStatus = 'active' | 'banned' | 'inactive';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  joinDate: string;
  lastLogin?: string;
  favorites: string[];     // Article IDs
  history: string[];      // Article IDs
  articleCount?: number;   // User's published articles count
}

export type LoginCredentials = { email: string; password: string };

export type RegisterData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export interface AuthState {
  user: User | null;
  token: string | null;
}

// User management types
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  adminCount: number;
  newUsersThisMonth: number;
}

export interface AdminUserListItem extends Omit<User, 'favorites' | 'history'> {
  favoritesCount: number;
  historyCount: number;
  articleCount: number;
}
