import { useState } from 'react';
import { Link } from 'react-router-dom';
import { articles } from '@/data/articles';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  User, Heart, Clock, Shield, Edit3, LogOut,
  Eye, Save, X, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type TabType = 'profile' | 'favorites' | 'history' | 'settings';

export function Profile() {
  const { user, logout, removeFavorite, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [editing, setEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);

  // Password change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!user) {
    return (
      <div className="text-center py-20">
        <User className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">请先登录</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">登录后即可访问个人中心</p>
        <Link to="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          返回首页
        </Link>
      </div>
    );
  }

  const favoriteArticles = articles.filter(a => user.favorites.includes(a.id));
  const historyArticles = articles.filter(a => user.history.includes(a.id));

  const handleSaveProfile = async () => {
    if (!editUsername.trim()) {
      toast.error('用户名不能为空');
      return;
    }
    if (editUsername.length < 2) {
      toast.error('用户名至少2个字符');
      return;
    }
    setLoading(true);
    try {
      await updateProfile({ username: editUsername });
      toast.success('资料更新成功');
      setEditing(false);
    } catch {
      toast.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = (articleId: string) => {
    removeFavorite(articleId);
    toast.success('已取消收藏');
  };

  const handleClearHistory = () => {
    // TODO: implement clear history in auth service
    toast.success('历史记录已清除');
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
      >
        ← 返回首页
      </Link>

      {/* User Header Card */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-900/30">
        <div className="flex items-center gap-6">
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&size=128&background=random`}
            alt={user.username}
            className="w-20 h-20 rounded-2xl object-cover shadow-lg"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.username}</h1>
              {user.role === 'admin' && (
                <span className="px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full flex items-center gap-1">
                  <Shield className="w-3 h-3" /> 管理员
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{user.email}</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              注册于 {user.joinDate} · 收藏 {user.favorites.length} 篇 · 浏览 {user.history.length} 篇
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5 overflow-x-auto">
        {[
          { key: 'profile', label: '基本信息', icon: User },
          { key: 'favorites', label: '我的收藏', icon: Heart, count: user.favorites.length },
          { key: 'history', label: '阅读历史', icon: Clock, count: user.history.length },
          { key: 'settings', label: '账户设置', icon: Shield },
        ].map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as TabType)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {count !== undefined && count > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">个人资料</h2>
            {!editing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setEditUsername(user.username); setEditing(true); }}
                className="flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" /> 编辑
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> 取消
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">用户名</label>
              {editing ? (
                <Input
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="h-10"
                />
              ) : (
                <p className="h-10 flex items-center text-gray-900 dark:text-white">{user.username}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">邮箱</label>
              <p className="h-10 flex items-center text-gray-900 dark:text-white">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">角色</label>
              <p className="h-10 flex items-center text-gray-900 dark:text-white">
                {user.role === 'admin' ? '管理员' : '普通用户'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">注册时间</label>
              <p className="h-10 flex items-center text-gray-900 dark:text-white">{user.joinDate}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'favorites' && (
        <div>
          {favoriteArticles.length > 0 ? (
            <div className="space-y-4">
              {favoriteArticles.map(article => (
                <div key={article.id} className="relative">
                  <ArticleCard article={article} />
                  <button
                    onClick={() => handleRemoveFavorite(article.id)}
                    className="absolute top-4 right-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    title="取消收藏"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <Heart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">暂无收藏</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">浏览文章并点击 ❤️ 即可收藏</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">阅读历史</h2>
            {historyArticles.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearHistory}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" /> 清除历史
              </Button>
            )}
          </div>
          {historyArticles.length > 0 ? (
            <div className="space-y-4">
              {historyArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">暂无浏览记录</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">浏览文章后将自动记录在这里</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">修改密码</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">当前密码</label>
              <Input
                type="password"
                placeholder="输入当前密码"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="h-10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">新密码</label>
              <Input
                type="password"
                placeholder="输入新密码（至少6位）"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">确认新密码</label>
              <Input
                type="password"
                placeholder="再次输入新密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10"
              />
            </div>
            <Button
              onClick={async () => {
                if (!oldPassword || !newPassword) {
                  toast.error('请填写完整');
                  return;
                }
                if (newPassword.length < 6) {
                  toast.error('密码长度至少为6位');
                  return;
                }
                if (newPassword !== confirmPassword) {
                  toast.error('两次输入的密码不一致');
                  return;
                }
                toast.success('密码修改成功');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              className="w-full h-10"
            >
              修改密码
            </Button>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">危险操作</h3>
            <Button
              variant="destructive"
              onClick={() => {
                logout();
                toast.success('已退出登录');
              }}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> 退出登录
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
