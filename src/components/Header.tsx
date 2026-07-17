import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, Package, Users, FileText, Upload } from 'lucide-react';
import { useAssetStore } from '../store/assetStore';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, users, setCurrentUser } = useAssetStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleUserChange = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header className="bg-gradient-to-r from-slate-900 to-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-blue-500 p-2 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">资产管理系统</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => navigate('/')}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                isActive('/') && !isActive('/users') && !isActive('/logs') && !isActive('/batch')
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              资产列表
            </button>
            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={() => navigate('/asset/add')}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    isActive('/asset/add')
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  添加资产
                </button>
                <button
                  onClick={() => navigate('/users')}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                    isActive('/users')
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  用户管理
                </button>
                <button
                  onClick={() => navigate('/logs')}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                    isActive('/logs')
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  操作日志
                </button>
                <button
                  onClick={() => navigate('/batch')}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                    isActive('/batch')
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  批量处理
                </button>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <User className="w-4 h-4" />
              <select
                value={currentUser.id}
                onChange={(e) => handleUserChange(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-sm cursor-pointer"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id} className="text-slate-900">
                    {user.username} ({user.role === 'admin' ? '管理员' : '用户'})
                  </option>
                ))}
              </select>
            </div>

            <button className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Menu className="w-6 h-6" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => {
                  navigate('/');
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-3 rounded-lg transition-colors ${
                  isActive('/') && !isActive('/users') && !isActive('/logs') && !isActive('/batch')
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                资产列表
              </button>
              {currentUser.role === 'admin' && (
                <>
                  <button
                    onClick={() => {
                      navigate('/asset/add');
                      setMobileMenuOpen(false);
                    }}
                    className={`px-4 py-3 rounded-lg transition-colors ${
                      isActive('/asset/add')
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    添加资产
                  </button>
                  <button
                    onClick={() => {
                      navigate('/users');
                      setMobileMenuOpen(false);
                    }}
                    className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                      isActive('/users')
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    用户管理
                  </button>
                  <button
                    onClick={() => {
                      navigate('/logs');
                      setMobileMenuOpen(false);
                    }}
                    className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                      isActive('/logs')
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    操作日志
                  </button>
                  <button
                    onClick={() => {
                      navigate('/batch');
                      setMobileMenuOpen(false);
                    }}
                    className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                      isActive('/batch')
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    批量处理
                  </button>
                </>
              )}
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-3 mt-2">
                <User className="w-4 h-4" />
                <select
                  value={currentUser.id}
                  onChange={(e) => handleUserChange(e.target.value)}
                  className="bg-transparent border-none outline-none text-white text-sm cursor-pointer"
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id} className="text-slate-900">
                      {user.username} ({user.role === 'admin' ? '管理员' : '用户'})
                    </option>
                  ))}
                </select>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
