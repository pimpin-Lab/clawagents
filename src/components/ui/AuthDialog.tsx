import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'register';
}

type TabType = 'login' | 'register';

export function AuthDialog({ open, onOpenChange, defaultTab = 'login' }: AuthDialogProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<TabType>(defaultTab);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = useCallback(() => {
    setLoginEmail('');
    setLoginPassword('');
    setRegUsername('');
    setRegEmail('');
    setRegPassword('');
    setRegConfirmPassword('');
    setAgreeTerms(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
  }, []);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) resetForm();
    onOpenChange(newOpen);
  }, [onOpenChange, resetForm]);

  const switchTab = useCallback((newTab: TabType) => {
    setTab(newTab);
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async () => {
    setErrors({});

    if (!loginEmail.trim()) {
      setErrors({ email: '请输入邮箱' });
      return;
    }
    if (!validateEmail(loginEmail)) {
      setErrors({ email: '邮箱格式不正确' });
      return;
    }
    if (!loginPassword) {
      setErrors({ password: '请输入密码' });
      return;
    }

    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast.success('登录成功！欢迎回来 🎉');
      handleOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || '登录失败');
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setErrors({});

    if (!regUsername.trim()) {
      setErrors({ username: '请输入用户名' });
      return;
    }
    if (regUsername.length < 2) {
      setErrors({ username: '用户名至少2个字符' });
      return;
    }
    if (!regEmail.trim()) {
      setErrors({ email: '请输入邮箱' });
      return;
    }
    if (!validateEmail(regEmail)) {
      setErrors({ email: '邮箱格式不正确' });
      return;
    }
    if (!regPassword) {
      setErrors({ password: '请输入密码' });
      return;
    }
    if (regPassword.length < 6) {
      setErrors({ password: '密码长度至少为6位' });
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrors({ confirmPassword: '两次输入的密码不一致' });
      return;
    }
    if (!agreeTerms) {
      setErrors({ terms: '请阅读并同意服务条款' });
      return;
    }

    setLoading(true);
    try {
      await register({
        username: regUsername,
        email: regEmail,
        password: regPassword,
        confirmPassword: regConfirmPassword,
      });
      toast.success('注册成功！已自动登录 🎉');
      handleOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || '注册失败');
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (tab === 'login') handleLogin();
      else handleRegister();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-3">
              <User className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {tab === 'login' ? '欢迎回来' : '创建账户'}
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {tab === 'login' ? '登录您的账户以继续' : '注册一个账户以开始使用'}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Tab Switcher */}
        <div className="flex mx-6 mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => switchTab('login')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              tab === 'login'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            登录
          </button>
          <button
            onClick={() => switchTab('register')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              tab === 'register'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            注册
          </button>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' && (
          <div className="px-6 py-4 space-y-4" onKeyDown={handleKeyDown}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="pl-10 h-11"
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="输入密码"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">记住我</span>
              </label>
              <button className="text-blue-600 dark:text-blue-400 hover:underline">
                忘记密码？
              </button>
            </div>

            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '登录'}
            </Button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              还没有账户？{' '}
              <button onClick={() => switchTab('register')} className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                立即注册
              </button>
            </p>
          </div>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <div className="px-6 py-4 space-y-4" onKeyDown={handleKeyDown}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="输入用户名"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="pl-10 h-11"
                  aria-invalid={!!errors.username}
                />
              </div>
              {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="pl-10 h-11"
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="至少6位密码"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                确认密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="再次输入密码"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  aria-invalid={!!errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  我已阅读并同意{' '}
                  <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">服务条款</span>
                  {' '}和{' '}
                  <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">隐私政策</span>
                </span>
              </label>
              {errors.terms && <p className="mt-1 text-xs text-red-500">{errors.terms}</p>}
            </div>

            <Button
              onClick={handleRegister}
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '注册'}
            </Button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              已有账户？{' '}
              <button onClick={() => switchTab('login')} className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                立即登录
              </button>
            </p>
          </div>
        )}

        {/* Demo accounts info */}
        <div className="mx-6 mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-1">📌 演示账号</p>
          <p className="text-xs text-amber-700 dark:text-amber-400">管理员：admin@blog.com / admin123</p>
          <p className="text-xs text-amber-700 dark:text-amber-400">普通用户：user@blog.com / user123</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
