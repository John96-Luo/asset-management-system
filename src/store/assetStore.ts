import { create } from 'zustand';
import { Asset, User, OperationLog, OperationType, ImportResult, AssetStatus, AssetCondition } from '../types';
import { generateCSV } from '../lib/csv';
import { fetchState, scheduleSync } from '../services/dataApi';

const initialAssets: Asset[] = [
  {
    id: '1',
    assetCode: 'IT-2024-001',
    category: '笔记本电脑',
    name: 'MacBook Pro 14寸',
    status: '领用',
    admin: '张三',
    brand: 'Apple',
    model: 'A2779',
    company: '科技有限公司',
    condition: '正常',
    location: '总部大楼3楼',
    purchaseDate: '2024-01-15',
    purchaseMethod: '采购',
    orderNumber: 'PO-2024-001',
    unit: '台',
    serialNumber: 'C02X12345678',
    wiredMac: '00:11:22:33:44:55',
    wirelessMac: 'AA:BB:CC:DD:EE:FF',
    note: '配置：M2 Pro 10核CPU，16GB内存，512GB SSD',
    user: '李四',
    userCompany: '科技有限公司',
    userDepartment: '研发部',
    receiptDate: '2024-02-01',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
  },
  {
    id: '2',
    assetCode: 'IT-2024-002',
    category: '显示器',
    name: 'Dell U2722D',
    status: '空闲',
    admin: '张三',
    brand: 'Dell',
    model: 'U2722D',
    company: '科技有限公司',
    condition: '正常',
    location: '仓库',
    purchaseDate: '2024-02-20',
    purchaseMethod: '采购',
    orderNumber: 'PO-2024-005',
    unit: '台',
    serialNumber: 'CN-0123456789',
    wiredMac: '',
    wirelessMac: '',
    note: '27寸4K分辨率显示器',
    user: '',
    userCompany: '',
    userDepartment: '',
    receiptDate: '',
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
  },
  {
    id: '3',
    assetCode: 'IT-2024-003',
    category: '打印机',
    name: 'HP LaserJet Pro',
    status: '领用',
    admin: '张三',
    brand: 'HP',
    model: 'M404dn',
    company: '科技有限公司',
    condition: '维修中',
    location: '总部大楼1楼',
    purchaseDate: '2024-03-10',
    purchaseMethod: '采购',
    orderNumber: 'PO-2024-008',
    unit: '台',
    serialNumber: 'CN-9876543210',
    wiredMac: '11:22:33:44:55:66',
    wirelessMac: '',
    note: '激光打印机，支持双面打印',
    user: '王五',
    userCompany: '科技有限公司',
    userDepartment: '行政部',
    receiptDate: '2024-03-15',
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },
];

const initialUsers: User[] = [
  { id: '1', username: 'admin', password: 'admin123', email: 'admin@company.com', name: '管理员', role: 'admin', company: '科技有限公司', department: 'IT部', isDeleted: false, createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000, updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000 },
  { id: '2', username: 'lisi', password: 'lisi123', email: 'lisi@company.com', name: '李四', role: 'user', company: '科技有限公司', department: '研发部', isDeleted: false, createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000 },
  { id: '3', username: 'wangwu', password: 'wangwu123', email: 'wangwu@company.com', name: '王五', role: 'user', company: '科技有限公司', department: '行政部', isDeleted: false, createdAt: Date.now() - 25 * 24 * 60 * 60 * 1000, updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000 },
];

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface AssetStore {
  assets: Asset[];
  users: User[];
  operationLogs: OperationLog[];
  currentUser: User;
  operationTimestamps: Record<string, number>;
  addAsset: (asset: Omit<Asset, 'id' | 'assetCode' | 'createdAt' | 'updatedAt'>) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  setCurrentUser: (user: User) => void;
  getAssetsByUser: (username: string) => Asset[];
  generateAssetCode: () => string;
  addUser: (user: Omit<User, 'id' | 'isDeleted' | 'createdAt' | 'updatedAt'>) => { success: boolean; message: string };
  updateUser: (id: string, user: Partial<User>, requirePassword?: boolean) => { success: boolean; message: string };
  deleteUser: (id: string, requirePassword?: boolean) => { success: boolean; message: string };
  batchDeleteUsers: (ids: string[], requirePassword?: boolean) => { success: boolean; message: string };
  getUserById: (id: string) => User | undefined;
  getUserByUsername: (username: string) => User | undefined;
  getActiveUsers: () => User[];
  getUsersWithPagination: (page: number, pageSize: number, filters?: { search?: string; role?: string; department?: string }) => PaginatedResult<User>;
  getLogsWithPagination: (page: number, pageSize: number, filters?: { operatorId?: string; operationType?: OperationType; targetType?: string; startTime?: number; endTime?: number }) => PaginatedResult<OperationLog>;
  addOperationLog: (log: Omit<OperationLog, 'id' | 'createdAt'>) => void;
  checkOperationFrequency: (operationType: OperationType, operatorId: string) => boolean;
  validatePassword: (password: string) => { valid: boolean; message: string; strength: 'weak' | 'medium' | 'strong' };
  exportAssetsCSV: () => string;
  exportUsersCSV: () => string;
  importAssetsFromCSV: (rows: Record<string, string>[]) => ImportResult;
  importUsersFromCSV: (rows: Record<string, string>[]) => ImportResult;
  generateAssetTemplateCSV: () => string;
  generateUserTemplateCSV: () => string;
  hydrated: boolean;
  hydrate: () => Promise<void>;
}

const maskSensitiveData = (data: object): Record<string, unknown> => {
  const masked = { ...data } as Record<string, unknown>;
  if (masked.password) {
    masked.password = '******';
  }
  return masked;
};

export const useAssetStore = create<AssetStore>()((set, get) => ({
      hydrated: false,
      assets: initialAssets,
      users: initialUsers,
      operationLogs: [],
      currentUser: initialUsers[0],
      operationTimestamps: {},
      addAsset: (assetData) => {
        const newAsset: Asset = {
          ...assetData,
          id: Date.now().toString(),
          assetCode: get().generateAssetCode(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        const state = get();
        set({ assets: [...state.assets, newAsset] });
        get().addOperationLog({
          operatorId: state.currentUser.id,
          operatorName: state.currentUser.name,
          operatorRole: state.currentUser.role,
          operationType: 'CREATE',
          targetType: 'ASSET',
          targetId: newAsset.id,
          targetName: newAsset.name,
          beforeData: '{}',
          afterData: JSON.stringify(maskSensitiveData(newAsset)),
          description: `创建资产：${newAsset.name}`,
        });
      },
      updateAsset: (id, assetData) => {
        const state = get();
        const oldAsset = state.assets.find((a) => a.id === id);
        if (!oldAsset) return;
        set((state) => ({
          assets: state.assets.map((asset) =>
            asset.id === id ? { ...asset, ...assetData, updatedAt: Date.now() } : asset
          ),
        }));
        const newAsset = get().assets.find((a) => a.id === id);
        get().addOperationLog({
          operatorId: state.currentUser.id,
          operatorName: state.currentUser.name,
          operatorRole: state.currentUser.role,
          operationType: 'UPDATE',
          targetType: 'ASSET',
          targetId: id,
          targetName: newAsset?.name || oldAsset.name,
          beforeData: JSON.stringify(maskSensitiveData(oldAsset)),
          afterData: JSON.stringify(maskSensitiveData(newAsset || oldAsset)),
          description: `更新资产：${newAsset?.name || oldAsset.name}`,
        });
      },
      deleteAsset: (id) => {
        const state = get();
        const asset = state.assets.find((a) => a.id === id);
        if (!asset) return;
        set((state) => ({ assets: state.assets.filter((asset) => asset.id !== id) }));
        get().addOperationLog({
          operatorId: state.currentUser.id,
          operatorName: state.currentUser.name,
          operatorRole: state.currentUser.role,
          operationType: 'DELETE',
          targetType: 'ASSET',
          targetId: id,
          targetName: asset.name,
          beforeData: JSON.stringify(maskSensitiveData(asset)),
          afterData: '{}',
          description: `删除资产：${asset.name}`,
        });
      },
      setCurrentUser: (user) => {
        set({ currentUser: user });
      },
      getAssetsByUser: (username) => {
        return get().assets.filter((a) => a.user === username);
      },
      generateAssetCode: () => {
        const year = new Date().getFullYear();
        const count = get().assets.filter((a) => a.assetCode.startsWith(`IT-${year}-`)).length + 1;
        return `IT-${year}-${String(count).padStart(3, '0')}`;
      },
      addUser: (userData) => {
        const state = get();
        if (!get().checkOperationFrequency('CREATE', state.currentUser.id)) {
          return { success: false, message: '操作过于频繁，请稍后再试' };
        }
        if (state.users.some((u) => u.username === userData.username && !u.isDeleted)) {
          return { success: false, message: '用户名已存在' };
        }
        if (state.users.some((u) => u.email === userData.email && !u.isDeleted)) {
          return { success: false, message: '邮箱已被使用' };
        }
        const passwordValidation = get().validatePassword(userData.password);
        if (!passwordValidation.valid) {
          return { success: false, message: passwordValidation.message };
        }
        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
          isDeleted: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set({ users: [...state.users, newUser] });
        get().addOperationLog({
          operatorId: state.currentUser.id,
          operatorName: state.currentUser.name,
          operatorRole: state.currentUser.role,
          operationType: 'CREATE',
          targetType: 'USER',
          targetId: newUser.id,
          targetName: newUser.name,
          beforeData: '{}',
          afterData: JSON.stringify(maskSensitiveData(newUser)),
          description: `创建用户：${newUser.name}`,
        });
        return { success: true, message: '用户创建成功' };
      },
      updateUser: (id, userData, requirePassword = false) => {
        const state = get();
        if (!get().checkOperationFrequency('UPDATE', state.currentUser.id)) {
          return { success: false, message: '操作过于频繁，请稍后再试' };
        }
        const oldUser = state.users.find((u) => u.id === id);
        if (!oldUser) {
          return { success: false, message: '用户不存在' };
        }
        if (oldUser.isDeleted) {
          return { success: false, message: '用户已被删除' };
        }
        if (requirePassword && userData.password) {
          const passwordValidation = get().validatePassword(userData.password);
          if (!passwordValidation.valid) {
            return { success: false, message: passwordValidation.message };
          }
        }
        if (userData.username && userData.username !== oldUser.username) {
          if (state.users.some((u) => u.username === userData.username && u.id !== id && !u.isDeleted)) {
            return { success: false, message: '用户名已存在' };
          }
        }
        if (userData.email && userData.email !== oldUser.email) {
          if (state.users.some((u) => u.email === userData.email && u.id !== id && !u.isDeleted)) {
            return { success: false, message: '邮箱已被使用' };
          }
        }
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...userData, updatedAt: Date.now() } : user
          ),
        }));
        const newUser = get().users.find((u) => u.id === id);
        get().addOperationLog({
          operatorId: state.currentUser.id,
          operatorName: state.currentUser.name,
          operatorRole: state.currentUser.role,
          operationType: 'UPDATE',
          targetType: 'USER',
          targetId: id,
          targetName: newUser?.name || oldUser.name,
          beforeData: JSON.stringify(maskSensitiveData(oldUser)),
          afterData: JSON.stringify(maskSensitiveData(newUser || oldUser)),
          description: `更新用户：${newUser?.name || oldUser.name}`,
        });
        return { success: true, message: '用户更新成功' };
      },
      deleteUser: (id, requirePassword = false) => {
        const state = get();
        if (!get().checkOperationFrequency('DELETE', state.currentUser.id)) {
          return { success: false, message: '操作过于频繁，请稍后再试' };
        }
        const user = state.users.find((u) => u.id === id);
        if (!user) {
          return { success: false, message: '用户不存在' };
        }
        if (user.isDeleted) {
          return { success: false, message: '用户已被删除' };
        }
        if (user.id === state.currentUser.id) {
          return { success: false, message: '不能删除自己' };
        }
        if (user.role === 'admin' && requirePassword) {
          return { success: false, message: '删除管理员需要额外验证' };
        }
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, isDeleted: true, updatedAt: Date.now() } : u
          ),
        }));
        get().addOperationLog({
          operatorId: state.currentUser.id,
          operatorName: state.currentUser.name,
          operatorRole: state.currentUser.role,
          operationType: 'DELETE',
          targetType: 'USER',
          targetId: id,
          targetName: user.name,
          beforeData: JSON.stringify(maskSensitiveData(user)),
          afterData: JSON.stringify(maskSensitiveData({ ...user, isDeleted: true })),
          description: `删除用户：${user.name}`,
        });
        return { success: true, message: '用户删除成功' };
      },
      batchDeleteUsers: (ids, requirePassword = false) => {
        const state = get();
        if (!get().checkOperationFrequency('BATCH_DELETE', state.currentUser.id)) {
          return { success: false, message: '操作过于频繁，请稍后再试' };
        }
        const usersToDelete = state.users.filter((u) => ids.includes(u.id) && !u.isDeleted);
        if (usersToDelete.length === 0) {
          return { success: false, message: '没有可删除的用户' };
        }
        const containsSelf = usersToDelete.some((u) => u.id === state.currentUser.id);
        if (containsSelf) {
          return { success: false, message: '不能删除自己' };
        }
        const containsAdmin = usersToDelete.some((u) => u.role === 'admin');
        if (containsAdmin && requirePassword) {
          return { success: false, message: '删除管理员需要额外验证' };
        }
        set((state) => ({
          users: state.users.map((u) =>
            ids.includes(u.id) ? { ...u, isDeleted: true, updatedAt: Date.now() } : u
          ),
        }));
        get().addOperationLog({
          operatorId: state.currentUser.id,
          operatorName: state.currentUser.name,
          operatorRole: state.currentUser.role,
          operationType: 'BATCH_DELETE',
          targetType: 'USER',
          targetId: ids.join(','),
          targetName: usersToDelete.map((u) => u.name).join(', '),
          beforeData: JSON.stringify(usersToDelete.map(maskSensitiveData)),
          afterData: JSON.stringify(usersToDelete.map((u) => maskSensitiveData({ ...u, isDeleted: true }))),
          description: `批量删除用户：${usersToDelete.map((u) => u.name).join(', ')}`,
        });
        return { success: true, message: `成功删除 ${usersToDelete.length} 个用户` };
      },
      getUserById: (id) => {
        return get().users.find((u) => u.id === id);
      },
      getUserByUsername: (username) => {
        return get().users.find((u) => u.username === username && !u.isDeleted);
      },
      getActiveUsers: () => {
        return get().users.filter((u) => !u.isDeleted);
      },
      getUsersWithPagination: (page, pageSize, filters = {}) => {
        const users = get().getActiveUsers();
        let filtered = [...users];
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filtered = filtered.filter(
            (u) =>
              u.username.toLowerCase().includes(searchLower) ||
              u.name.toLowerCase().includes(searchLower) ||
              u.email.toLowerCase().includes(searchLower) ||
              u.department.toLowerCase().includes(searchLower)
          );
        }
        if (filters.role) {
          filtered = filtered.filter((u) => u.role === filters.role);
        }
        if (filters.department) {
          filtered = filtered.filter((u) => u.department === filters.department);
        }
        filtered.sort((a, b) => b.createdAt - a.createdAt);
        const total = filtered.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return {
          data: filtered.slice(start, end),
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      },
      getLogsWithPagination: (page, pageSize, filters = {}) => {
        const logs = [...get().operationLogs];
        let filtered = [...logs];
        if (filters.operatorId) {
          filtered = filtered.filter((log) => log.operatorId === filters.operatorId);
        }
        if (filters.operationType) {
          filtered = filtered.filter((log) => log.operationType === filters.operationType);
        }
        if (filters.targetType) {
          filtered = filtered.filter((log) => log.targetType === filters.targetType);
        }
        if (filters.startTime) {
          filtered = filtered.filter((log) => log.createdAt >= filters.startTime);
        }
        if (filters.endTime) {
          filtered = filtered.filter((log) => log.createdAt <= filters.endTime);
        }
        filtered.sort((a, b) => b.createdAt - a.createdAt);
        const total = filtered.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return {
          data: filtered.slice(start, end),
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      },
      addOperationLog: (logData) => {
        const newLog: OperationLog = {
          ...logData,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: Date.now(),
        };
        set((state) => ({ operationLogs: [...state.operationLogs, newLog] }));
      },
      checkOperationFrequency: (operationType, operatorId) => {
        const state = get();
        const key = `${operationType}_${operatorId}`;
        const lastTime = state.operationTimestamps[key] || 0;
        const now = Date.now();
        const cooldown = operationType === 'BATCH_DELETE' ? 10000 : 5000;
        if (now - lastTime < cooldown) {
          return false;
        }
        set((state) => ({
          operationTimestamps: { ...state.operationTimestamps, [key]: now },
        }));
        return true;
      },
      validatePassword: (password) => {
        if (password.length < 6) {
          return { valid: false, message: '密码长度至少6位', strength: 'weak' as const };
        }
        let strength: 'weak' | 'medium' | 'strong' = 'weak';
        if (password.length >= 8) strength = 'medium';
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength = 'medium';
        if (/[0-9]/.test(password)) strength = 'medium';
        if (/[^a-zA-Z0-9]/.test(password)) strength = 'strong';
        if (password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
          strength = 'strong';
        }
        return { valid: true, message: '', strength };
      },
      exportAssetsCSV: () => {
        const { assets } = get();
        const headers = ['资产编号', '资产分类', '资产名称', '资产状态', '管理员', '品牌', '型号', '所属公司', '使用状况', '所在位置', '购置日期', '购置方式', '订单号', '计量单位', '设备序列号', '有线网卡MAC地址', '无线网卡MAC地址', '备注', '使用人', '使用公司', '使用部门', '领用日期'];
        const rows = assets.map((asset) => {
          const row: Record<string, string> = {};
          for (const h of headers) {
            const fieldMap: Record<string, keyof Asset> = {
              '资产编号': 'assetCode', '资产分类': 'category', '资产名称': 'name', '资产状态': 'status',
              '管理员': 'admin', '品牌': 'brand', '型号': 'model', '所属公司': 'company',
              '使用状况': 'condition', '所在位置': 'location', '购置日期': 'purchaseDate',
              '购置方式': 'purchaseMethod', '订单号': 'orderNumber', '计量单位': 'unit',
              '设备序列号': 'serialNumber', '有线网卡MAC地址': 'wiredMac', '无线网卡MAC地址': 'wirelessMac',
              '备注': 'note', '使用人': 'user', '使用公司': 'userCompany', '使用部门': 'userDepartment',
              '领用日期': 'receiptDate',
            };
            const key = fieldMap[h];
            row[h] = String(asset[key] ?? '');
          }
          return row;
        });
        return generateCSV(headers, rows);
      },
      exportUsersCSV: () => {
        const { users } = get();
        const activeUsers = users.filter((u) => !u.isDeleted);
        const headers = ['用户名', '姓名', '邮箱', '角色', '公司', '部门', '创建时间'];
        const rows = activeUsers.map((user) => {
          const row: Record<string, string> = {};
          for (const h of headers) {
            const fieldMap: Record<string, keyof User> = {
              '用户名': 'username', '姓名': 'name', '邮箱': 'email', '角色': 'role',
              '公司': 'company', '部门': 'department', '创建时间': 'createdAt',
            };
            const key = fieldMap[h];
            if (key === 'createdAt') {
              row[h] = new Date(user.createdAt).toLocaleDateString('zh-CN');
            } else {
              row[h] = String(user[key] ?? '');
            }
          }
          return row;
        });
        return generateCSV(headers, rows);
      },
      importAssetsFromCSV: (rows) => {
        const state = get();
        const result: ImportResult = { successCount: 0, failCount: 0, errors: [], totalRows: rows.length };
        const validStatuses: AssetStatus[] = ['空闲', '领用', '借用'];
        const validConditions: AssetCondition[] = ['正常', '故障', '维修中'];

        const requiredFields: { field: string; label: string }[] = [
          { field: '资产分类*', label: '资产分类' },
          { field: '资产名称*', label: '资产名称' },
          { field: '品牌*', label: '品牌' },
          { field: '型号*', label: '型号' },
          { field: '所属公司*', label: '所属公司' },
          { field: '使用状况*', label: '使用状况' },
          { field: '所在位置*', label: '所在位置' },
        ];

        // 兼容有无 * 的表头
        const getField = (row: Record<string, string>, key: string): string => {
          return row[key] ?? row[key.replace('*', '')] ?? '';
        };

        rows.forEach((row, index) => {
          const rowNum = index + 1;
          const errors: string[] = [];

          // 必填项检查
          for (const rf of requiredFields) {
            const val = getField(row, rf.field);
            if (!val) {
              errors.push(`缺少必填项：${rf.label}`);
            }
          }

          const statusVal = getField(row, '资产状态') as AssetStatus;
          if (statusVal && !validStatuses.includes(statusVal)) {
            errors.push(`资产状态无效："${statusVal}"，可选值：空闲、领用、借用`);
          }

          const conditionVal = getField(row, '使用状况') as AssetCondition;
          if (conditionVal && !validConditions.includes(conditionVal)) {
            errors.push(`使用状况无效："${conditionVal}"，可选值：正常、故障、维修中`);
          }

          // 设备序列号重复检测
          const serialVal = getField(row, '设备序列号');
          if (serialVal && state.assets.some((a) => a.serialNumber === serialVal)) {
            errors.push(`设备序列号 "${serialVal}" 已存在`);
          }

          if (errors.length > 0) {
            result.failCount++;
            errors.forEach((msg) => result.errors.push({ row: rowNum, message: msg }));
            return;
          }

          try {
            const newAsset: Omit<Asset, 'id' | 'assetCode' | 'createdAt' | 'updatedAt'> = {
              category: getField(row, '资产分类*'),
              name: getField(row, '资产名称*'),
              status: (statusVal || '空闲') as AssetStatus,
              admin: getField(row, '管理员') || state.currentUser.name,
              brand: getField(row, '品牌*'),
              model: getField(row, '型号*'),
              company: getField(row, '所属公司*'),
              condition: (conditionVal || '正常') as AssetCondition,
              location: getField(row, '所在位置*'),
              purchaseDate: getField(row, '购置日期'),
              purchaseMethod: getField(row, '购置方式'),
              orderNumber: getField(row, '订单号'),
              unit: getField(row, '计量单位'),
              serialNumber: serialVal,
              wiredMac: getField(row, '有线网卡MAC地址'),
              wirelessMac: getField(row, '无线网卡MAC地址'),
              note: getField(row, '备注'),
              user: getField(row, '使用人'),
              userCompany: getField(row, '使用公司'),
              userDepartment: getField(row, '使用部门'),
              receiptDate: getField(row, '领用日期'),
            };
            get().addAsset(newAsset);
            result.successCount++;
          } catch (e) {
            result.failCount++;
            const msg = e instanceof Error ? e.message : '未知错误';
            result.errors.push({ row: rowNum, message: `创建失败：${msg}` });
          }
        });

        get().addOperationLog({
          operatorId: state.currentUser.id,
          operatorName: state.currentUser.name,
          operatorRole: state.currentUser.role,
          operationType: 'CREATE',
          targetType: 'ASSET',
          targetId: 'batch-import',
          targetName: `批量导入资产`,
          beforeData: '{}',
          afterData: JSON.stringify({ success: result.successCount, fail: result.failCount }),
          description: `批量导入资产：成功 ${result.successCount} 条，失败 ${result.failCount} 条`,
        });

        return result;
      },
      importUsersFromCSV: (rows) => {
        const state = get();
        const result: ImportResult = { successCount: 0, failCount: 0, errors: [], totalRows: rows.length };
        const validRoles = ['admin', 'user'];

        const requiredFields: { field: string; label: string }[] = [
          { field: '用户名*', label: '用户名' },
          { field: '密码*', label: '密码' },
          { field: '电子邮箱*', label: '电子邮箱' },
          { field: '姓名*', label: '姓名' },
          { field: '角色*', label: '角色' },
        ];

        const getField = (row: Record<string, string>, key: string): string => {
          return row[key] ?? row[key.replace('*', '')] ?? '';
        };

        rows.forEach((row, index) => {
          const rowNum = index + 1;
          const errors: string[] = [];

          for (const rf of requiredFields) {
            const val = getField(row, rf.field);
            if (!val) {
              errors.push(`缺少必填项：${rf.label}`);
            }
          }

          const roleVal = getField(row, '角色*');
          if (roleVal && !validRoles.includes(roleVal)) {
            errors.push(`角色无效："${roleVal}"，可选值：admin、user`);
          }

          const username = getField(row, '用户名*');
          if (username && state.users.some((u) => u.username === username && !u.isDeleted)) {
            errors.push(`用户名 "${username}" 已存在`);
          }

          const email = getField(row, '电子邮箱*');
          if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push(`邮箱格式不正确："${email}"`);
          }
          if (email && state.users.some((u) => u.email === email && !u.isDeleted)) {
            errors.push(`邮箱 "${email}" 已被使用`);
          }

          const password = getField(row, '密码*');
          if (password && password.length < 6) {
            errors.push('密码长度至少6位');
          }

          if (errors.length > 0) {
            result.failCount++;
            errors.forEach((msg) => result.errors.push({ row: rowNum, message: msg }));
            return;
          }

          try {
            const newUser: Omit<User, 'id' | 'isDeleted' | 'createdAt' | 'updatedAt'> = {
              username: username,
              password: password,
              email: email,
              name: getField(row, '姓名*'),
              role: (roleVal || 'user') as 'admin' | 'user',
              company: getField(row, '公司') || state.currentUser.company,
              department: getField(row, '部门') || '',
            };
            const addResult = get().addUser(newUser);
            if (addResult.success) {
              result.successCount++;
            } else {
              result.failCount++;
              result.errors.push({ row: rowNum, message: addResult.message });
            }
          } catch (e) {
            result.failCount++;
            const msg = e instanceof Error ? e.message : '未知错误';
            result.errors.push({ row: rowNum, message: `创建失败：${msg}` });
          }
        });

        get().addOperationLog({
          operatorId: state.currentUser.id,
          operatorName: state.currentUser.name,
          operatorRole: state.currentUser.role,
          operationType: 'CREATE',
          targetType: 'USER',
          targetId: 'batch-import',
          targetName: `批量导入用户`,
          beforeData: '{}',
          afterData: JSON.stringify({ success: result.successCount, fail: result.failCount }),
          description: `批量导入用户：成功 ${result.successCount} 条，失败 ${result.failCount} 条`,
        });

        return result;
      },
      generateAssetTemplateCSV: () => {
        const headers = ['资产分类*', '资产名称*', '资产状态', '管理员', '品牌*', '型号*', '所属公司*', '使用状况*', '所在位置*', '购置日期', '购置方式', '订单号', '计量单位', '设备序列号', '有线网卡MAC地址', '无线网卡MAC地址', '备注', '使用人', '使用公司', '使用部门', '领用日期'];
        return generateCSV(headers, []);
      },
      generateUserTemplateCSV: () => {
        const headers = ['用户名*', '密码*', '电子邮箱*', '姓名*', '角色*', '公司', '部门'];
        return generateCSV(headers, []);
      },
      hydrate: async () => {
        try {
          const data = await fetchState();
          if (data.assets && data.users) {
            set({
              assets: data.assets as Asset[],
              users: data.users as User[],
              operationLogs: (data.operationLogs || []) as OperationLog[],
              hydrated: true,
            });
            return;
          }
        } catch { /* API 不可用时使用初始数据 */ }
        set({ hydrated: true });
      },
    }));


  useAssetStore.subscribe(() => {
    scheduleSync(() => {
      const s = useAssetStore.getState();
      return { assets: s.assets, users: s.users, operationLogs: s.operationLogs, hydrated: s.hydrated };
    });
  });
