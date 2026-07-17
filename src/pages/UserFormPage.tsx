import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useAssetStore } from '../store/assetStore';

interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  company: string;
  department: string;
}

const roleOptions: { value: 'admin' | 'user'; label: string }[] = [
  { value: 'admin', label: '管理员' },
  { value: 'user', label: '普通用户' },
];

const departmentOptions = ['IT部', '研发部', '行政部', '财务部', '市场部', '销售部'];

const companyOptions = ['科技有限公司', '子公司A', '子公司B'];

export function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getUserById, addUser, updateUser, validatePassword, currentUser } = useAssetStore();

  const isEdit = !!id;
  const existingUser = isEdit ? getUserById(id!) : null;

  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    name: '',
    role: 'user',
    company: '科技有限公司',
    department: 'IT部',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [changes, setChanges] = useState<Record<string, { old: string; new: string }>>({});
  const [showChanges, setShowChanges] = useState(false);

  useEffect(() => {
    if (existingUser) {
      setFormData({
        username: existingUser.username,
        password: '',
        confirmPassword: '',
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
        company: existingUser.company,
        department: existingUser.department,
      });
    }
  }, [existingUser]);

  useEffect(() => {
    if (!isEdit || !existingUser) return;
    
    const newChanges: Record<string, { old: string; new: string }> = {};
    
    if (formData.username !== existingUser.username) {
      newChanges.username = { old: existingUser.username, new: formData.username };
    }
    if (formData.email !== existingUser.email) {
      newChanges.email = { old: existingUser.email, new: formData.email };
    }
    if (formData.name !== existingUser.name) {
      newChanges.name = { old: existingUser.name, new: formData.name };
    }
    if (formData.role !== existingUser.role) {
      newChanges.role = { old: existingUser.role === 'admin' ? '管理员' : '普通用户', new: formData.role === 'admin' ? '管理员' : '普通用户' };
    }
    if (formData.company !== existingUser.company) {
      newChanges.company = { old: existingUser.company, new: formData.company };
    }
    if (formData.department !== existingUser.department) {
      newChanges.department = { old: existingUser.department, new: formData.department };
    }
    if (formData.password) {
      newChanges.password = { old: '******', new: '******' };
    }
    
    setChanges(newChanges);
  }, [formData, isEdit, existingUser]);

  useEffect(() => {
    if (formData.password) {
      const result = validatePassword(formData.password);
      setPasswordStrength(result.strength);
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password, validatePassword]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      newErrors.username = '用户名只能包含字母、数字和下划线，长度3-20位';
    }

    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = '密码不能为空';
      } else {
        const result = validatePassword(formData.password);
        if (!result.valid) {
          newErrors.password = result.message;
        }
      }
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!formData.name.trim()) {
      newErrors.name = '姓名不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const userData = {
      username: formData.username,
      email: formData.email,
      name: formData.name,
      role: formData.role,
      company: formData.company,
      department: formData.department,
    };

    if (formData.password) {
      (userData as any).password = formData.password;
    }

    if (isEdit && existingUser) {
      const result = updateUser(existingUser.id, userData);
      if (result.success) {
        alert(result.message);
        navigate('/users');
      } else {
        alert(result.message);
      }
    } else {
      const result = addUser({ ...userData, password: formData.password });
      if (result.success) {
        alert(result.message);
        navigate('/users');
      } else {
        alert(result.message);
      }
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const strengthColors: Record<string, string> = {
    'weak': 'bg-red-500',
    'medium': 'bg-yellow-500',
    'strong': 'bg-green-500',
  };

  const strengthLabels: Record<string, string> = {
    'weak': '弱',
    'medium': '中',
    'strong': '强',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/users')} className="flex items-center gap-2 text-blue-600 mb-6 hover:text-blue-700 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        返回用户列表
      </button>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
          <h1 className="text-2xl font-bold">
            {isEdit ? '编辑用户' : '添加用户'}
          </h1>
          <p className="text-purple-100 mt-1">
            {isEdit ? '修改用户信息和权限配置' : '创建新的用户账户'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">用户名 *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                }`}
                placeholder="3-20位字母、数字或下划线"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.username}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">邮箱 *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                }`}
                placeholder="user@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                }`}
                placeholder="真实姓名"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">角色</label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">所属公司</label>
              <select
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {companyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">所属部门</label>
              <select
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departmentOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码 {!isEdit && '*'}
                {isEdit && <span className="text-gray-400">(不填则保持不变)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors pr-12 ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  placeholder={!isEdit ? '至少6位，包含大小写字母和数字更佳' : '输入新密码'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '隐藏' : '显示'}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
              {formData.password && !errors.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">密码强度</span>
                    <span className={`text-sm font-medium ${
                      passwordStrength === 'weak' ? 'text-red-500' :
                      passwordStrength === 'medium' ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {strengthLabels[passwordStrength!]}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                    <div
                      className={`${strengthColors[passwordStrength!]} transition-all duration-300`}
                      style={{
                        width: passwordStrength === 'weak' ? '33%' :
                              passwordStrength === 'medium' ? '66%' : '100%'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {formData.password && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">确认密码 *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  placeholder="再次输入密码"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
                {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="mt-1 text-sm text-green-500 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    密码确认一致
                  </p>
                )}
              </div>
            )}
          </div>

          {isEdit && Object.keys(changes).length > 0 && (
            <div className="mt-6 bg-gray-50 rounded-xl p-4">
              <button
                type="button"
                onClick={() => setShowChanges(!showChanges)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <Shield className="w-4 h-4" />
                {showChanges ? '隐藏变更对比' : '显示变更对比'}
              </button>
              {showChanges && (
                <div className="mt-4 space-y-2">
                  {Object.entries(changes).map(([key, values]) => (
                    <div key={key} className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500 w-20">{
                        key === 'username' ? '用户名' :
                        key === 'email' ? '邮箱' :
                        key === 'name' ? '姓名' :
                        key === 'role' ? '角色' :
                        key === 'company' ? '公司' :
                        key === 'department' ? '部门' : '密码'
                      }</span>
                      <span className="text-red-500 line-through">{values.old}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-600 font-medium">{values.new}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isEdit ? '保存修改' : '创建用户'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
