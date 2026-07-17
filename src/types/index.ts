export interface Asset {
  id: string;
  assetCode: string;
  category: string;
  name: string;
  status: '空闲' | '领用' | '借用';
  admin: string;
  brand: string;
  model: string;
  company: string;
  condition: '正常' | '故障' | '维修中';
  location: string;
  purchaseDate: string;
  purchaseMethod: string;
  orderNumber: string;
  unit: string;
  serialNumber: string;
  wiredMac: string;
  wirelessMac: string;
  note: string;
  user: string;
  userCompany: string;
  userDepartment: string;
  receiptDate: string;
  createdAt: number;
  updatedAt: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  company: string;
  department: string;
  isDeleted: boolean;
  createdAt: number;
  updatedAt: number;
}

export type AssetStatus = '空闲' | '领用' | '借用';
export type AssetCondition = '正常' | '故障' | '维修中';

export type OperationType = 'CREATE' | 'UPDATE' | 'DELETE' | 'BATCH_DELETE' | 'VIEW';

export interface OperationLog {
  id: string;
  operatorId: string;
  operatorName: string;
  operatorRole: 'admin' | 'user';
  operationType: OperationType;
  targetType: 'USER' | 'ASSET';
  targetId: string;
  targetName: string;
  beforeData: string;
  afterData: string;
  description: string;
  createdAt: number;
}

export interface ImportError {
  row: number;
  message: string;
}

export interface ImportResult {
  successCount: number;
  failCount: number;
  errors: ImportError[];
  totalRows: number;
}

/**
 * Asset CSV 导出字段映射（中文表头 -> 英文字段）
 */
export const ASSET_EXPORT_HEADERS = [
  '资产编号', '资产分类', '资产名称', '资产状态', '管理员', '品牌', '型号',
  '所属公司', '使用状况', '所在位置', '购置日期', '购置方式', '订单号',
  '计量单位', '设备序列号', '有线网卡MAC地址', '无线网卡MAC地址', '备注',
  '使用人', '使用公司', '使用部门', '领用日期',
] as const;

export const ASSET_EXPORT_FIELD_MAP: Record<string, keyof Asset> = {
  '资产编号': 'assetCode',
  '资产分类': 'category',
  '资产名称': 'name',
  '资产状态': 'status',
  '管理员': 'admin',
  '品牌': 'brand',
  '型号': 'model',
  '所属公司': 'company',
  '使用状况': 'condition',
  '所在位置': 'location',
  '购置日期': 'purchaseDate',
  '购置方式': 'purchaseMethod',
  '订单号': 'orderNumber',
  '计量单位': 'unit',
  '设备序列号': 'serialNumber',
  '有线网卡MAC地址': 'wiredMac',
  '无线网卡MAC地址': 'wirelessMac',
  '备注': 'note',
  '使用人': 'user',
  '使用公司': 'userCompany',
  '使用部门': 'userDepartment',
  '领用日期': 'receiptDate',
};

/**
 * Asset CSV 导入模板（表头 + 必填标记）
 */
export const ASSET_IMPORT_TEMPLATE_HEADERS = [
  '资产分类*', '资产名称*', '资产状态', '管理员', '品牌*', '型号*',
  '所属公司*', '使用状况*', '所在位置*', '购置日期', '购置方式',
  '订单号', '计量单位', '设备序列号', '有线网卡MAC地址',
  '无线网卡MAC地址', '备注', '使用人', '使用公司', '使用部门', '领用日期',
] as const;

/**
 * User CSV 导出字段映射
 */
export const USER_EXPORT_HEADERS = [
  '用户名', '姓名', '邮箱', '角色', '公司', '部门', '创建时间',
] as const;

export const USER_EXPORT_FIELD_MAP: Record<string, keyof User> = {
  '用户名': 'username',
  '姓名': 'name',
  '邮箱': 'email',
  '角色': 'role',
  '公司': 'company',
  '部门': 'department',
  '创建时间': 'createdAt',
};

/**
 * User CSV 导入模板（表头 + 必填标记）
 */
export const USER_IMPORT_TEMPLATE_HEADERS = [
  '用户名*', '密码*', '电子邮箱*', '姓名*', '角色*', '公司', '部门',
] as const;
