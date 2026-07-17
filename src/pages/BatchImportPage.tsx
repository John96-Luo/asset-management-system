import { useState, useRef } from 'react';
import { Download, Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, FileText, Trash2, X } from 'lucide-react';
import { useAssetStore } from '../store/assetStore';
import { ImportResult } from '../types';
import { parseCSV, downloadFile, readFileAsText } from '../lib/csv';

type TabType = 'asset' | 'user';

export function BatchImportPage() {
  const store = useAssetStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>('asset');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedFile(null);
    setImportResult(null);
    setShowResult(false);
    setProgress(0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 20;
      });
    }, 200);
    return interval;
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setImporting(true);
    setShowResult(false);

    const interval = simulateProgress();

    try {
      const text = await readFileAsText(selectedFile);
      const { rows } = parseCSV(text);

      if (rows.length === 0) {
        setImportResult({
          successCount: 0,
          failCount: 0,
          errors: [{ row: 0, message: '文件中没有有效数据行' }],
          totalRows: 0,
        });
        setProgress(100);
        clearInterval(interval);
        setImporting(false);
        setShowResult(true);
        return;
      }

      let result: ImportResult;

      if (activeTab === 'asset') {
        result = store.importAssetsFromCSV(rows);
      } else {
        result = store.importUsersFromCSV(rows);
      }

      setProgress(100);
      clearInterval(interval);
      setImportResult(result);
      setImporting(false);
      setShowResult(true);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      clearInterval(interval);
      setImportResult({
        successCount: 0,
        failCount: 0,
        errors: [{ row: 0, message: err instanceof Error ? err.message : '文件解析失败，请检查文件格式' }],
        totalRows: 0,
      });
      setProgress(100);
      setImporting(false);
      setShowResult(true);
    }
  };

  const handleDownloadTemplate = () => {
    if (activeTab === 'asset') {
      const csv = store.generateAssetTemplateCSV();
      downloadFile(csv, '资产导入模板.csv');
    } else {
      const csv = store.generateUserTemplateCSV();
      downloadFile(csv, '用户导入模板.csv');
    }
  };

  const handleExport = () => {
    let csv: string;
    let filename: string;
    if (activeTab === 'asset') {
      csv = store.exportAssetsCSV();
      filename = `资产数据导出_${new Date().toISOString().slice(0, 10)}.csv`;
    } else {
      csv = store.exportUsersCSV();
      filename = `用户数据导出_${new Date().toISOString().slice(0, 10)}.csv`;
    }
    downloadFile(csv, filename);
  };

  const assetTemplateHeaders = [
    '资产分类*', '资产名称*', '资产状态', '管理员', '品牌*', '型号*',
    '所属公司*', '使用状况*', '所在位置*', '购置日期', '购置方式',
    '订单号', '计量单位', '设备序列号', '有线网卡MAC地址',
    '无线网卡MAC地址', '备注', '使用人', '使用公司', '使用部门', '领用日期',
  ];

  const userTemplateHeaders = [
    '用户名*', '密码*', '电子邮箱*', '姓名*', '角色*', '公司', '部门',
  ];

  const currentTemplateHeaders = activeTab === 'asset' ? assetTemplateHeaders : userTemplateHeaders;
  const importLabel = activeTab === 'asset' ? '资产' : '用户';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">数据批量处理</h1>
        <p className="text-gray-500">支持资产与用户数据的批量导入导出，下载模板按格式填写数据后导入</p>
      </div>

      {/* 选项卡 */}
      <div className="flex mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-1.5">
        <button
          onClick={() => handleTabChange('asset')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'asset'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          资产批量处理
        </button>
        <button
          onClick={() => handleTabChange('user')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'user'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          用户批量处理
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 导出区域 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-2.5 rounded-lg">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">数据导出</h2>
              <p className="text-sm text-gray-500">导出全部{importLabel}数据为CSV文件</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            点击下方按钮，系统将自动导出所有{importLabel}数据为 CSV 格式文件，可用 Excel 打开编辑。
          </p>
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            导出{importLabel}数据
          </button>
        </div>

        {/* 模板下载区域 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2.5 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">导入模板下载</h2>
              <p className="text-sm text-gray-500">获取正确格式的{importLabel}导入模板</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3">模板列信息（带 <span className="text-red-500 font-medium">*</span> 号为必填项）：</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {currentTemplateHeaders.map((header) => (
              <span
                key={header}
                className={`px-2 py-1 rounded-md text-xs font-medium ${
                  header.endsWith('*')
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                {header}
              </span>
            ))}
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            下载{importLabel}导入模板
          </button>
        </div>
      </div>

      {/* 导入区域 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2.5 rounded-lg">
              <Upload className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">数据导入</h2>
              <p className="text-sm text-gray-500">上传CSV文件批量导入{importLabel}数据</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* 文件上传区域 */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              dragOver
                ? 'border-blue-500 bg-blue-50'
                : selectedFile
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !importing && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex items-center justify-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FileSpreadsheet className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                {!importing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="移除文件"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div className="bg-gray-200 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-7 h-7 text-gray-500" />
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  将 CSV 文件拖放到此处，或<span className="text-blue-600">点击选择文件</span>
                </p>
                <p className="text-xs text-gray-400">仅支持 .csv 格式文件</p>
              </div>
            )}
          </div>

          {/* 导入按钮 */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleImport}
              disabled={!selectedFile || importing}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium transition-colors ${
                !selectedFile || importing
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {importing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  导入中...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  开始导入
                </>
              )}
            </button>
          </div>

          {/* 进度条 */}
          {importing && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-600">导入进度</span>
                <span className="text-sm font-medium text-gray-800">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 导入结果弹窗 */}
      {showResult && importResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowResult(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {importResult.failCount === 0 ? (
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  ) : importResult.successCount === 0 ? (
                    <div className="bg-red-100 p-2 rounded-lg">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                  ) : (
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-800">
                    {importLabel}导入结果报告
                  </h3>
                </div>
                <button
                  onClick={() => setShowResult(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 统计卡片 */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-800">{importResult.totalRows}</p>
                  <p className="text-xs text-gray-500 mt-1">总行数</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{importResult.successCount}</p>
                  <p className="text-xs text-green-600 mt-1">成功</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{importResult.failCount}</p>
                  <p className="text-xs text-red-600 mt-1">失败</p>
                </div>
              </div>

              {/* 进度条 */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      importResult.failCount === 0 ? 'bg-green-500' :
                      importResult.successCount === 0 ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                    style={{
                      width: importResult.totalRows > 0
                        ? `${(importResult.successCount / importResult.totalRows * 100)}%`
                        : '0%'
                    }}
                  />
                </div>
              </div>

              {/* 错误详情 */}
              {importResult.errors.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">失败详情</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {importResult.errors.map((err, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-lg p-3"
                      >
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          {err.row > 0 && (
                            <span className="text-xs font-medium text-red-600">第 {err.row} 行：</span>
                          )}
                          <span className="text-sm text-red-700">{err.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {importResult.successCount > 0 && importResult.failCount === 0 && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-700">全部数据导入成功！共导入 {importResult.successCount} 条{importLabel}数据。</p>
                </div>
              )}

              <button
                onClick={() => setShowResult(false)}
                className="w-full mt-4 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
