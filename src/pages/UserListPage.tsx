import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Trash2, Users, ChevronLeft, ChevronRight, CheckSquare, Square, Eye, Edit2, Mail, Building2, User } from 'lucide-react';
import { useAssetStore } from '../store/assetStore';

export function UserListPage() {
  const navigate = useNavigate();
  const { getUsersWithPagination, deleteUser, batchDeleteUsers, currentUser, getActiveUsers } = useAssetStore();
  
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showBatchConfirmModal, setShowBatchConfirmModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const users = getActiveUsers();
  const departments = [...new Set(users.map((u) => u.department))];
  
  const { data: paginatedUsers, total, totalPages } = getUsersWithPagination(
    page,
    pageSize,
    { search: searchTerm, role: roleFilter, department: departmentFilter }
  );

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [searchTerm, roleFilter, departmentFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === paginatedUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedUsers.map((u) => u.id));
    }
  };

  const handleDelete = (userId: string) => {
    setDeleteTargetId(userId);
    setShowConfirmModal(true);
    setConfirmInput('');
  };

  const handleBatchDelete = () => {
    setShowBatchConfirmModal(true);
    setConfirmInput('');
  };

  const confirmDelete = () => {
    if (confirmInput !== 'DELETE') {
      alert('请输入 "DELETE" 确认删除');
      return;
    }
    if (deleteTargetId) {
      const result = deleteUser(deleteTargetId);
      if (result.success) {
        alert(result.message);
        setShowConfirmModal(false);
        setSelectedIds((prev) => prev.filter((id) => id !== deleteTargetId));
      } else {
        alert(result.message);
      }
    }
  };

  const confirmBatchDelete = () => {
    if (confirmInput !== 'DELETE') {
      alert('请输入 "DELETE" 确认批量删除');
      return;
    }
    const result = batchDeleteUsers(selectedIds);
    if (result.success) {
      alert(result.message);
      setShowBatchConfirmModal(false);
      setSelectedIds([]);
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">用户管理</h1>
        <p className="text-gray-500">管理员可管理所有用户账户，包括创建、编辑和删除操作</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索用户名、姓名、邮箱、部门..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部角色</option>
                <option value="admin">管理员</option>
                <option value="user">普通用户</option>
              </select>
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部部门</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <button
              onClick={() => navigate('/user/add')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加用户
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className="text-gray-500">
            已选择 {selectedIds.length} 个用户
          </span>
          {selectedIds.length > 0 && (
            <button
              onClick={handleBatchDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              批量删除 ({selectedIds.length})
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  <button
                    onClick={selectAll}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {selectedIds.length === paginatedUsers.length && paginatedUsers.length > 0 ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">用户名</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">姓名</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">邮箱</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">角色</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">公司</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">部门</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">创建时间</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">暂无用户</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleSelect(user.id)}
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        {selectedIds.includes(user.id) ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-100 p-1.5 rounded-lg">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-800">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{user.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? '管理员' : '普通用户'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{user.company}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{user.department}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/user/edit/${user.id}`)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors text-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > pageSize && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <span className="text-gray-500">
              显示 {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} 条，共 {total} 条
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 rounded-lg border ${
                      page === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">确认删除</h3>
            <p className="text-gray-600 mb-4">此操作不可恢复，请谨慎操作。</p>
            <p className="text-gray-500 text-sm mb-4">请输入 "DELETE" 确认删除：</p>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              placeholder="DELETE"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {showBatchConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">批量删除确认</h3>
            <p className="text-gray-600 mb-4">即将删除 {selectedIds.length} 个用户，此操作不可恢复。</p>
            <p className="text-gray-500 text-sm mb-4">请输入 "DELETE" 确认批量删除：</p>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              placeholder="DELETE"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowBatchConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={confirmBatchDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
