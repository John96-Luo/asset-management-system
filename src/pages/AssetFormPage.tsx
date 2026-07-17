import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAssetStore } from '../store/assetStore';
import { Asset, AssetStatus, AssetCondition } from '../types';

const statusOptions: AssetStatus[] = ['空闲', '领用', '借用'];
const conditionOptions: AssetCondition[] = ['正常', '故障', '维修中'];

export function AssetFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assets, addAsset, updateAsset, generateAssetCode } = useAssetStore();

  const isEdit = !!id;
  const existingAsset = isEdit ? assets.find((a) => a.id === id) : null;

  const [formData, setFormData] = useState({
    category: '',
    name: '',
    status: '空闲' as AssetStatus,
    admin: '',
    brand: '',
    model: '',
    company: '',
    condition: '正常' as AssetCondition,
    location: '',
    purchaseDate: '',
    purchaseMethod: '',
    orderNumber: '',
    unit: '',
    serialNumber: '',
    wiredMac: '',
    wirelessMac: '',
    note: '',
    user: '',
    userCompany: '',
    userDepartment: '',
    receiptDate: '',
  });

  useEffect(() => {
    if (existingAsset) {
      setFormData({
        category: existingAsset.category,
        name: existingAsset.name,
        status: existingAsset.status,
        admin: existingAsset.admin,
        brand: existingAsset.brand,
        model: existingAsset.model,
        company: existingAsset.company,
        condition: existingAsset.condition,
        location: existingAsset.location,
        purchaseDate: existingAsset.purchaseDate,
        purchaseMethod: existingAsset.purchaseMethod,
        orderNumber: existingAsset.orderNumber,
        unit: existingAsset.unit,
        serialNumber: existingAsset.serialNumber,
        wiredMac: existingAsset.wiredMac,
        wirelessMac: existingAsset.wirelessMac,
        note: existingAsset.note,
        user: existingAsset.user,
        userCompany: existingAsset.userCompany,
        userDepartment: existingAsset.userDepartment,
        receiptDate: existingAsset.receiptDate,
      });
    }
  }, [existingAsset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category) {
      alert('请填写资产名称和分类');
      return;
    }

    if (isEdit && existingAsset) {
      updateAsset(existingAsset.id, formData);
    } else {
      addAsset(formData);
    }

    navigate('/');
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string | AssetStatus | AssetCondition
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-blue-600 mb-6 hover:text-blue-700 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        返回资产列表
      </button>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <h1 className="text-2xl font-bold">
            {isEdit ? '编辑资产' : '添加资产'}
          </h1>
          {!isEdit && (
            <p className="text-blue-100 mt-1">资产编码将自动生成：{generateAssetCode()}</p>
          )}
          {isEdit && existingAsset && (
            <p className="text-blue-100 mt-1">资产编码：{existingAsset.assetCode}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">资产分类 *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：笔记本电脑、显示器"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">资产名称 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：MacBook Pro 14寸"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">资产状态</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as AssetStatus)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">使用状况</label>
              <select
                value={formData.condition}
                onChange={(e) => handleChange('condition', e.target.value as AssetCondition)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {conditionOptions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">品牌</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：Apple、Dell"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">型号</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：A2779"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">所属公司</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">管理员</label>
              <input
                type="text"
                value={formData.admin}
                onChange={(e) => handleChange('admin', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">所在位置</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">购置日期</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleChange('purchaseDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">购置方式</label>
              <input
                type="text"
                value={formData.purchaseMethod}
                onChange={(e) => handleChange('purchaseMethod', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">订单号</label>
              <input
                type="text"
                value={formData.orderNumber}
                onChange={(e) => handleChange('orderNumber', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">计量单位</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">设备序列号</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => handleChange('serialNumber', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">有线网卡MAC地址</label>
              <input
                type="text"
                value={formData.wiredMac}
                onChange={(e) => handleChange('wiredMac', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：00:11:22:33:44:55"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">无线网卡MAC地址</label>
              <input
                type="text"
                value={formData.wirelessMac}
                onChange={(e) => handleChange('wirelessMac', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：AA:BB:CC:DD:EE:FF"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">使用人</label>
              <input
                type="text"
                value={formData.user}
                onChange={(e) => handleChange('user', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">使用公司</label>
              <input
                type="text"
                value={formData.userCompany}
                onChange={(e) => handleChange('userCompany', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">使用部门</label>
              <input
                type="text"
                value={formData.userDepartment}
                onChange={(e) => handleChange('userDepartment', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">领用日期</label>
              <input
                type="date"
                value={formData.receiptDate}
                onChange={(e) => handleChange('receiptDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
            <textarea
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              placeholder="资产备注信息..."
            />
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isEdit ? '保存修改' : '添加资产'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
