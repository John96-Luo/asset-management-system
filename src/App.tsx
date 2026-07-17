import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { AssetListPage } from '@/pages/AssetListPage';
import { AssetDetailPage } from '@/pages/AssetDetailPage';
import { AssetFormPage } from '@/pages/AssetFormPage';
import { UserListPage } from '@/pages/UserListPage';
import { UserFormPage } from '@/pages/UserFormPage';
import { OperationLogPage } from '@/pages/OperationLogPage';
import { BatchImportPage } from '@/pages/BatchImportPage';
import { useAssetStore } from '@/store/assetStore';

export default function App() {
  const hydrated = useAssetStore((s) => s.hydrated);

  useEffect(() => {
    useAssetStore.getState().hydrate();
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">正在加载数据...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<AssetListPage />} />
          <Route path="/asset/:id" element={<AssetDetailPage />} />
          <Route path="/asset/add" element={<AssetFormPage />} />
          <Route path="/asset/edit/:id" element={<AssetFormPage />} />
          <Route path="/users" element={<UserListPage />} />
          <Route path="/user/add" element={<UserFormPage />} />
          <Route path="/user/edit/:id" element={<UserFormPage />} />
          <Route path="/logs" element={<OperationLogPage />} />
          <Route path="/batch" element={<BatchImportPage />} />
        </Routes>
      </main>
    </Router>
  );
}
