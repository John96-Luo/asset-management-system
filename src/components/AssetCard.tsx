import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, Trash2, Monitor, Printer, Smartphone, Keyboard, Server } from 'lucide-react';
import { Asset } from '../types';
import { useAssetStore } from '../store/assetStore';

interface AssetCardProps {
  asset: Asset;
}

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

export function AssetCard({ asset }: AssetCardProps) {
  const navigate = useNavigate();
  const { currentUser, deleteAsset } = useAssetStore();
  const IconComponent = categoryIcons[asset.category] || Monitor;

  const handleDelete = () => {
    if (window.confirm(`确定要删除资产 ${asset.name} 吗？`)) {
      deleteAsset(asset.id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{asset.name}</h3>
            <p className="text-sm text-gray-500">{asset.assetCode}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[asset.status]}`}>
            {asset.status}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${conditionColors[asset.condition]}`}>
            {asset.condition}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-500">分类</span>
          <span className="text-gray-800 font-medium">{asset.category}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">品牌/型号</span>
          <span className="text-gray-800">{asset.brand} {asset.model}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">使用人</span>
          <span className="text-gray-800">{asset.user || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">位置</span>
          <span className="text-gray-800">{asset.location}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={() => navigate(`/asset/${asset.id}`)}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          查看详情
        </button>
        {currentUser.role === 'admin' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/asset/edit/${asset.id}`)}
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              <Edit2 className="w-4 h-4" />
              编辑
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
