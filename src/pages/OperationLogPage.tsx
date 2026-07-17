import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, FileText, User, Clock, Database, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useAssetStore } from '../store/assetStore';
import { OperationType, OperationLog } from '../types';

const operationTypeOptions: { value: OperationType; label: string; color: string }[] = [
  { value: 'CREATE', label: '创建', color: 'bg-green-100 text-green-800' },
  { value: 'UPDATE', label: '更新', color: 'bg-blue-100 text-blue-800' },
  { value: 'DELETE', label: '删除', color: 'bg-red-100 text-red-800' },
  { value: 'BATCH_DELETE', label: '批量删除', color: 'bg-orange-100 text-orange-800' },
  { value: 'VIEW', label: '查看', color: 'bg-gray-100 text-gray-800' },
];

const targetTypeOptions: { value: string; label: string }[] = [
  { value: 'USER', label: '用户' },
  { value: 'ASSET', label: '资产' },
];

export function OperationLogPage() {
  const navigate = useNavigate();
  const { getLogsWithPagination, getActiveUsers, currentUser } = useAssetStore();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [operationTypeFilter, setOperationTypeFilter] = useState<OperationType | ''>('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);

  const users = getActiveUsers();

  const { data: logs, total, totalPages } = getLogsWithPagination(
    page,
    pageSize,
    {
      operationType: operationTypeFilter || undefined,
      targetType: targetTypeFilter || undefined,
      operatorId: operatorFilter || undefined,
      startTime: startDateFilter ? new Date(startDateFilter).getTime() : undefined,
      endTime: endDateFilter ? new Date(endDateFilter).getTime() + 24 * 60 * 60 * 1000 - 1 : undefined,
    }
  );

  const filteredLogs = searchTerm
    ? logs.filter(
        (log) =>
          log.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.operatorName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : logs;

  useEffect(() => {
    setPage(1);
  }, [operationTypeFilter, targetTypeFilter, operatorFilter, startDateFilter, endDateFilter]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getOperationTypeInfo = (type: OperationType) => {
    return operationTypeOptions.find((o) => o.value === type) || operationTypeOptions[4];
  };

  const getTargetTypeInfo = (type: string) => {
    return targetTypeOptions.find((t) => t.value === type) || { value: type, label: type };
  };

  const handleViewDetail = (log: typeof logs[0]) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const formatJsonDiff = (before: string, after: string) => {
    try {
      const beforeObj = JSON.parse(before);
      const afterObj = JSON.parse(after);
      const diff: Record<string, { old: unknown; new: unknown }> = {};
      
      const allKeys = new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]);
      allKeys.forEach((key) => {
        if (JSON.stringify(beforeObj[key]) !== JSON.stringify(afterObj[key])) {
          diff[key] = { old: beforeObj[key], new: afterObj[key] };
        }
      });
      
      return diff;
    } catch {
      return {};
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">操作日志</h1>
        <p className="text-gray-500">查看系统操作记录，支持按多种条件筛选查询</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索操作描述、目标名称、操作人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={operationTypeFilter}
                onChange={(e) => setOperationTypeFilter(e.target.value as OperationType | '')}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部操作类型</option>
                {operationTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部目标类型</option>
              {targetTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={operatorFilter}
              onChange={(e) => setOperatorFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部操作人</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.username})
                </option>
              ))}
            </select>

            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="开始日期"
            />

            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="结束日期"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">操作时间</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">操作人</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">操作类型</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">目标类型</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">目标名称</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">操作描述</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">暂无操作日志</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const opTypeInfo = getOperationTypeInfo(log.operationType);
                  const targetTypeInfo = getTargetTypeInfo(log.targetType);
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{formatDate(log.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{log.operatorName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            log.operatorRole === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {log.operatorRole === 'admin' ? '管理员' : '用户'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${opTypeInfo.color}`}>
                          {opTypeInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{targetTypeInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-800">{log.targetName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 max-w-xs truncate block">{log.description}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetail(log)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          详情
                        </button>
                      </td>
                    </tr>
                  );
                })
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

      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">操作详情</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">操作时间</p>
                  <p className="text-gray-800">{formatDate(selectedLog.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">操作人</p>
                  <p className="text-gray-800">{selectedLog.operatorName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">操作类型</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOperationTypeInfo(selectedLog.operationType).color}`}>
                    {getOperationTypeInfo(selectedLog.operationType).label}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">目标类型</p>
                  <p className="text-gray-800">{getTargetTypeInfo(selectedLog.targetType).label}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">目标ID</p>
                  <p className="text-gray-800 font-mono text-sm">{selectedLog.targetId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">目标名称</p>
                  <p className="text-gray-800">{selectedLog.targetName}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">操作描述</p>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{selectedLog.description}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">数据变更对比</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  {(() => {
                    const diff = formatJsonDiff(selectedLog.beforeData, selectedLog.afterData);
                    if (Object.keys(diff).length === 0) {
                      return <p className="text-gray-500 text-center py-4">无数据变更</p>;
                    }
                    return (
                      <div className="space-y-2">
                        {Object.entries(diff).map(([key, values]) => (
                          <div key={key} className="flex items-start gap-4 text-sm">
                            <span className="text-gray-500 w-20 flex-shrink-0">
                              {key === 'username' ? '用户名' :
                               key === 'email' ? '邮箱' :
                               key === 'name' ? '姓名' :
                               key === 'role' ? '角色' :
                               key === 'company' ? '公司' :
                               key === 'department' ? '部门' :
                               key === 'password' ? '密码' :
                               key === 'status' ? '状态' :
                               key === 'condition' ? '状况' :
                               key === 'category' ? '分类' : key}
                            </span>
                            <span className="text-red-500 line-through flex-1">
                              {values.old === '' ? '(空)' : JSON.stringify(values.old)}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="text-green-600 font-medium flex-1">
                              {values.new === '' ? '(空)' : JSON.stringify(values.new)}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDetailModal(false)}
              className="mt-6 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
