import { useNavigate } from 'react-router-dom';
import { User, Edit2, Trash2, Mail, Building2, Shield } from 'lucide-react';
import { User as UserType } from '../types';

interface UserCardProps {
  user: UserType;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const roleColors: Record<string, string> = {
  'admin': 'bg-purple-100 text-purple-800',
  'user': 'bg-blue-100 text-blue-800',
};

const roleLabels: Record<string, string> = {
  'admin': '管理员',
  'user': '普通用户',
};

export function UserCard({ user, selected, onSelect, onDelete }: UserCardProps) {
  const navigate = useNavigate();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 border-2 cursor-pointer ${
        selected ? 'border-blue-500' : 'border-gray-100'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-full">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.username}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
          {roleLabels[user.role]}
        </span>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Mail className="w-4 h-4 text-gray-400" />
          <span>{user.email}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span>{user.company} - {user.department}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Shield className="w-4 h-4 text-gray-400" />
          <span>创建于 {formatDate(user.createdAt)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          最近更新: {formatDate(user.updatedAt)}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/user/edit/${user.id}`);
            }}
            className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
          >
            <Edit2 className="w-4 h-4" />
            编辑
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
