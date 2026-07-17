import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Package, Plus, Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAssetStore } from '../store/assetStore';
import { AssetStatus, AssetCondition } from '../types';

export function AssetListPage() {
  const navigate = useNavigate();
  const { assets, currentUser, deleteAsset } = useAssetStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssetStatus | ''>('');
  const [conditionFilter, setConditionFilter] = useState<AssetCondition | ''>('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const filteredAssets = useMemo(() => {
    let result = currentUser.role === 'admin' ? assets : assets.filter((a) => a.user === currentUser.username);

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(lowerSearch) ||
          a.assetCode.toLowerCase().includes(lowerSearch) ||
          a.category.toLowerCase().includes(lowerSearch) ||
          a.user.toLowerCase().includes(lowerSearch) ||
          a.brand.toLowerCase().includes(lowerSearch)
      );
    }

    if (categoryFilter) {
      result = result.filter((a) => a.category === categoryFilter);
    }

    if (statusFilter) {
      result = result.filter((a) => a.status === statusFilter);
    }

    if (conditionFilter) {
      result = result.filter((a) => a.condition === conditionFilter);
    }

    return result.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [assets, currentUser, searchTerm, categoryFilter, statusFilter, conditionFilter]);

  const categories = useMemo(() => {
    const cats = new Set(assets.map((a) => a.category));
    return Array.from(cats);
  }, [assets]);

  const stats = useMemo(() => ({
    total: filteredAssets.length,
    idle: filteredAssets.filter((a) => a.status === '空闲').length,
    inUse: filteredAssets.filter((a) => a.status === '领用').length,
    borrowed: filteredAssets.filter((a) => a.status === '借用').length,
  }), [filteredAssets]);

  const totalPages = Math.ceil(filteredAssets.length / pageSize);
  const paginatedAssets = filteredAssets.slice((page - 1) * pageSize, page * pageSize);

  const statusColors: Record<string, string> = {
    '空闲': 'bg-green-100 text-green-800',
    '领用': 'bg-blue-100 text-blue-800',
    '借用': 'bg-purple-100 text-purple-800',
  };

  const conditionColors: Record<string, string> = {
    '正常': 'bg-green-100 text-green-800',
    '故障': 'bg-red-100 text-red-800',
    '维修中': 'bg-yellow-100 text-yellow-800',
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`确定要删除资产 ${name} 吗？`)) {
      deleteAsset(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">资产列表</h1>
            <p className="text-gray-500 text-sm mt-1">
              {currentUser.role === 'admin' ? '查看所有资产' : `查看 ${currentUser.username} 名下资产`}
            </p>
          </div>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => navigate('/asset/add')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新增资产
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索资产名称、编码、使用人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">全部分类</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as AssetStatus | '');
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">全部状态</option>
              <option value="空闲">空闲</option>
              <option value="领用">领用</option>
              <option value="借用">借用</option>
            </select>

            <select
              value={conditionFilter}
              onChange={(e) => {
                setConditionFilter(e.target.value as AssetCondition | '');
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">全部状况</option>
              <option value="正常">正常</option>
              <option value="故障">故障</option>
              <option value="维修中">维修中</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-blue-600 text-xs font-medium">资产总数</p>
              <p className="text-xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-green-600 text-xs font-medium">空闲</p>
              <p className="text-xl font-bold text-gray-800">{stats.idle}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-purple-600 text-xs font-medium">领用</p>
              <p className="text-xl font-bold text-gray-800">{stats.inUse}</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-orange-600 text-xs font-medium">借用</p>
              <p className="text-xl font-bold text-gray-800">{stats.borrowed}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">资产编号</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">资产名称</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">分类</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">品牌</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">型号</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">设备序列号</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">所属公司</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">使用人</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">部门</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">状态</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">状况</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedAssets.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">暂无资产</p>
                  </td>
                </tr>
              ) : (
                paginatedAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-blue-600">{asset.assetCode}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-800">{asset.name}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{asset.category}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{asset.brand}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{asset.model}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600 font-mono">{asset.serialNumber}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{asset.company}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-800">{asset.user || '-'}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{asset.userDepartment || '-'}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[asset.status]}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${conditionColors[asset.condition]}`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/asset/${asset.id}`)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {currentUser.role === 'admin' && (
                          <>
                            <button
                              onClick={() => navigate(`/asset/edit/${asset.id}`)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="编辑"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(asset.id, asset.name)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              显示 {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredAssets.length)} 条，共 {filteredAssets.length} 条
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1.5 rounded-lg border text-sm ${
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
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
