import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Monitor, Printer, Smartphone, Keyboard, Server, MapPin, Calendar, Building, User, Tag, FileText } from 'lucide-react';
import { useAssetStore } from '../store/assetStore';

const categoryIcons: Record<string, typeof Monitor> = {
  '笔记本电脑': Monitor,
  '显示器': Monitor,
  '打印机': Printer,
  '手机': Smartphone,
  '键盘': Keyboard,
  '服务器': Server,
};

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

export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assets, currentUser, deleteAsset } = useAssetStore();

  const asset = assets.find((a) => a.id === id);

  if (!asset) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-blue-600 mb-4">
          <ArrowLeft className="w-5 h-5" />
          返回列表
        </button>
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">资产不存在或已被删除</p>
        </div>
      </div>
    );
  }

  const IconComponent = categoryIcons[asset.category] || Monitor;

  const handleDelete = () => {
    if (window.confirm(`确定要删除资产 ${asset.name} 吗？`)) {
      deleteAsset(asset.id);
      navigate('/');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const infoRows = [
    { label: '资产编码', value: asset.assetCode, icon: Tag },
    { label: '资产分类', value: asset.category, icon: Tag },
    { label: '品牌', value: asset.brand, icon: Tag },
    { label: '型号', value: asset.model, icon: Tag },
    { label: '所属公司', value: asset.company, icon: Building },
    { label: '所在位置', value: asset.location, icon: MapPin },
    { label: '购置日期', value: asset.purchaseDate, icon: Calendar },
    { label: '购置方式', value: asset.purchaseMethod, icon: FileText },
    { label: '订单号', value: asset.orderNumber, icon: FileText },
    { label: '计量单位', value: asset.unit, icon: Tag },
    { label: '设备序列号', value: asset.serialNumber, icon: Tag },
    { label: '有线网卡MAC', value: asset.wiredMac || '-', icon: Tag },
    { label: '无线网卡MAC', value: asset.wirelessMac || '-', icon: Tag },
    { label: '管理员', value: asset.admin, icon: User },
  ];

  const usageRows = [
    { label: '使用人', value: asset.user || '-', icon: User },
    { label: '使用公司', value: asset.userCompany || '-', icon: Building },
    { label: '使用部门', value: asset.userDepartment || '-', icon: Building },
    { label: '领用日期', value: asset.receiptDate || '-', icon: Calendar },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-blue-600 mb-6 hover:text-blue-700 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        返回资产列表
      </button>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-xl">
              <IconComponent className="w-12 h-12" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{asset.name}</h1>
              <p className="text-blue-100">{asset.assetCode}</p>
            </div>
            <div className="flex flex-col gap-2">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[asset.status]}`}>
                {asset.status}
              </span>
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${conditionColors[asset.condition]}`}>
                {asset.condition}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                基本信息
              </h2>
              <div className="space-y-3">
                {infoRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <row.icon className="w-4 h-4" />
                      {row.label}
                    </span>
                    <span className="text-gray-800 font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
              {asset.note && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-gray-500 mb-2">备注</p>
                  <p className="text-gray-800 bg-white p-3 rounded-lg">{asset.note}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                使用信息
              </h2>
              <div className="space-y-3">
                {usageRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <row.icon className="w-4 h-4" />
                      {row.label}
                    </span>
                    <span className="text-gray-800 font-medium">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-500 mb-2">创建时间</p>
                <p className="text-gray-800 font-medium">{formatDate(asset.createdAt)}</p>
              </div>
              <div className="mt-3">
                <p className="text-gray-500 mb-2">更新时间</p>
                <p className="text-gray-800 font-medium">{formatDate(asset.updatedAt)}</p>
              </div>
            </div>
          </div>

          {currentUser.role === 'admin' && (
            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => navigate(`/asset/edit/${asset.id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                编辑资产
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                删除资产
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
