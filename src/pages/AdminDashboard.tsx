import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { articles } from '@/data/articles';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/services/authServices';
import type { AdminUserListItem, UserRole, UserStatus } from '@/types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  Shield, Users, FileText, Eye, TrendingUp, Settings, AlertTriangle,
  Search, Ban, CheckCircle, XCircle, Trash2, Edit3, UserCheck,
  ChevronLeft, ChevronRight, UserX, Crown, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

type TabType = 'overview' | 'users' | 'settings';
type FilterRole = 'all' | UserRole;
type FilterStatus = 'all' | UserStatus;

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const usersPerPage = 10;

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">无权访问</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">只有管理员才能访问此页面</p>
        <Button onClick={() => navigate('/profile')} className="px-6">
          返回个人中心
        </Button>
      </div>
    );
  }

  const allUsers = AuthService.getAdminUserList();
  const userStats = AuthService.getUserStats();
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);

  // Category data for pie chart
  const categoryData = articles.reduce((acc: { name: string; value: number }[], article) => {
    const existing = acc.find(item => item.name === article.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: article.category, value: 1 });
    }
    return acc;
  }, []);

  // Monthly article data for bar chart
  const monthlyData: Record<string, { month: string; count: number; views: number }> = {};
  articles.forEach(article => {
    const month = article.date.substring(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { month, count: 0, views: 0 };
    }
    monthlyData[month].count += 1;
    monthlyData[month].views += article.views || 0;
  });
  const monthlyChartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || u.role === filterRole;
      const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [allUsers, searchTerm, filterRole, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const refreshData = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success('数据已刷新');
    }, 500);
  };

  const handleBanUser = (userId: string) => {
    try {
      AuthService.banUser(userId);
      toast.success('用户已被封禁');
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 100);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUnbanUser = (userId: string) => {
    try {
      AuthService.unbanUser(userId);
      toast.success('用户已解封');
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 100);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteUser = (userId: string) => {
    try {
      AuthService.deleteUser(userId);
      toast.success('用户已删除');
      setShowDeleteConfirm(null);
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 100);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUpdateRole = (userId: string) => {
    try {
      AuthService.updateUserRole(userId, newRole);
      toast.success(`已将用户角色修改为${newRole === 'admin' ? '管理员' : '普通用户'}`);
      setEditingRole(null);
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 100);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openUserDetails = (u: AdminUserListItem) => {
    setSelectedUser(u);
    setShowUserModal(true);
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 w-fit">正常</Badge>;
      case 'banned':
        return <Badge variant="destructive" className="w-fit">已封禁</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="w-fit">未激活</Badge>;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    return role === 'admin' ? (
      <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 flex items-center gap-1 w-fit">
        <Shield className="w-3 h-3" /> 管理员
      </Badge>
    ) : (
      <Badge variant="secondary" className="w-fit">用户</Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">管理控制台</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                欢迎回来，{user.username}！今天是管理博客的好日子 ✨
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshData} className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5">
        {([
          { key: 'overview', label: '数据概览', icon: BarChart },
          { key: 'users', label: '用户管理', icon: Users },
          { key: 'settings', label: '系统设置', icon: Settings },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as TabType)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {key === 'users' && (
              <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                {filteredUsers.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* User Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: '总用户数', value: userStats.totalUsers, icon: Users, color: 'from-blue-500 to-cyan-500' },
              { label: '活跃用户', value: userStats.activeUsers, icon: UserCheck, color: 'from-green-500 to-emerald-500' },
              { label: '封禁用户', value: userStats.bannedUsers, icon: UserX, color: 'from-red-500 to-rose-500' },
              { label: '管理员', value: userStats.adminCount, icon: Crown, color: 'from-purple-500 to-pink-500' },
              { label: '本月新增', value: userStats.newUsersThisMonth, icon: TrendingUp, color: 'from-amber-500 to-orange-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('users')}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                  <div className={`w-8 h-8 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              </Card>
            ))}
          </div>

          {/* Article Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '总文章数', value: articles.length, icon: FileText, color: 'from-blue-500 to-cyan-500' },
              { label: '总浏览量', value: totalViews.toLocaleString(), icon: Eye, color: 'from-purple-500 to-pink-500' },
              { label: '平均阅读', value: `${Math.round(totalViews / articles.length)}`, icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
              { label: '总分类数', value: categoryData.length, icon: Settings, color: 'from-amber-500 to-orange-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                  <div className={`w-8 h-8 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">月度发文统计</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData}>
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="文章数" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">分类分布</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Recent Articles */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">热门文章 TOP 5</h3>
            <div className="space-y-3">
              {articles.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((article, index) => (
                <div key={article.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    index === 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                    index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    #{index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{article.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{article.category} · {article.date}</p>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {article.views || 0}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索用户名或邮箱..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 h-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterRole}
                onChange={(e) => { setFilterRole(e.target.value as FilterRole); setCurrentPage(1); }}
                className="h-10 px-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部角色</option>
                <option value="admin">管理员</option>
                <option value="user">普通用户</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value as FilterStatus); setCurrentPage(1); }}
                className="h-10 px-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部状态</option>
                <option value="active">正常</option>
                <option value="banned">已封禁</option>
                <option value="inactive">未激活</option>
              </select>
              <Button variant="outline" size="icon" onClick={refreshData}>
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>共 {filteredUsers.length} 个用户</span>
            {filterRole !== 'all' && <span>· 角色: {filterRole === 'admin' ? '管理员' : '普通用户'}</span>}
            {filterStatus !== 'all' && <span>· 状态: {filterStatus === 'active' ? '正常' : filterStatus === 'banned' ? '已封禁' : '未激活'}</span>}
          </div>

          {/* Users Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">用户</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">角色</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">状态</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">收藏/历史</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">注册时间</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paginatedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openUserDetails(u)}
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                          <Avatar className="w-9 h-9">
                            <AvatarImage src={u.avatar} alt={u.username} />
                            <AvatarFallback>{u.username.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{u.username}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        {editingRole === u.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={newRole}
                              onChange={(e) => setNewRole(e.target.value as UserRole)}
                              className="h-8 px-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded text-sm"
                            >
                              <option value="user">普通用户</option>
                              <option value="admin">管理员</option>
                            </select>
                            <Button size="sm" variant="ghost" onClick={() => handleUpdateRole(u.id)}>保存</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingRole(null)}>取消</Button>
                          </div>
                        ) : (
                          getRoleBadge(u.role)
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(u.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <span className="text-red-500">♥</span> {u.favoritesCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {u.historyCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{u.joinDate}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openUserDetails(u)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {u.id !== user.id && (
                            <>
                              {u.status === 'banned' ? (
                                <button
                                  onClick={() => handleUnbanUser(u.id)}
                                  className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                  title="解封用户"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBanUser(u.id)}
                                  className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                  title="封禁用户"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => { setEditingRole(u.id); setNewRole(u.role); }}
                                className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                title="修改角色"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(u.id)}
                                className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="删除用户"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  显示 {(currentPage - 1) * usersPerPage + 1} - {Math.min(currentPage * usersPerPage, filteredUsers.length)}，共 {filteredUsers.length} 个
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">站点信息</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">站点名称</label>
                <input
                  type="text"
                  defaultValue="我的博客"
                  className="w-full h-10 px-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">站点描述</label>
                <textarea
                  defaultValue="一个专注于技术分享的个人博客"
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <Button>保存设置</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">公告管理</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">公告内容</label>
                <textarea
                  placeholder="输入站点公告..."
                  rows={4}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="showAnnouncement" className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                <label htmlFor="showAnnouncement" className="text-sm text-gray-700 dark:text-gray-300">
                  在首页显示公告
                </label>
              </div>
              <Button>保存公告</Button>
            </div>
          </Card>

          <Card className="p-6 border-red-200 dark:border-red-800">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">危险操作</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">清除所有用户数据（注册信息、收藏、历史记录）</p>
              <Button variant="destructive" className="flex items-center gap-2">
                <XCircle className="w-4 h-4" /> 清除所有用户数据
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* User Details Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>用户详情</DialogTitle>
            <DialogDescription>查看用户详细信息</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.username} />
                  <AvatarFallback className="text-lg">{selectedUser.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedUser.username}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-1">
                    {getRoleBadge(selectedUser.role)}
                    {getStatusBadge(selectedUser.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">注册时间</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.joinDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">最后登录</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : '从未登录'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">收藏文章</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.favoritesCount} 篇</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">阅读历史</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.historyCount} 篇</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                {selectedUser.id !== user.id && (
                  <>
                    {selectedUser.status === 'banned' ? (
                      <Button onClick={() => { handleUnbanUser(selectedUser.id); setShowUserModal(false); }} className="flex-1">
                        <CheckCircle className="w-4 h-4 mr-2" /> 解封用户
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => { handleBanUser(selectedUser.id); setShowUserModal(false); }} className="flex-1">
                        <Ban className="w-4 h-4 mr-2" /> 封禁用户
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      onClick={() => { setShowDeleteConfirm(selectedUser.id); setShowUserModal(false); }}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> 删除用户
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">确认删除</DialogTitle>
            <DialogDescription>
              确定要删除此用户吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              取消
            </Button>
            <Button variant="destructive" onClick={() => handleDeleteUser(showDeleteConfirm!)}>
              确认删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
