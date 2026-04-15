import React from 'react';
import { UserProfile } from '../types';
import { LogOut, LayoutDashboard, FileEdit, ShieldCheck, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface LayoutProps {
  user: UserProfile | null;
  onLogout: () => void;
  onNavigate: (page: 'dashboard' | 'editor' | 'view' | 'admin', id?: string) => void;
  currentPage: string;
  children: React.ReactNode;
}

export function Layout({ user, onLogout, onNavigate, currentPage, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#F5F5F0] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E5E5E0] flex flex-col fixed h-full">
        <div className="p-8">
          <h1 className="text-2xl font-serif font-bold text-[#1A1A1A]">Blog Hiện Đại</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentPage === 'dashboard' ? 'bg-[#5A5A40] text-white' : 'text-[#5A5A40] hover:bg-[#F5F5F0]'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Bảng điều khiển</span>
          </button>

          <button
            onClick={() => onNavigate('editor')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentPage === 'editor' ? 'bg-[#5A5A40] text-white' : 'text-[#5A5A40] hover:bg-[#F5F5F0]'
            }`}
          >
            <FileEdit className="w-5 h-5" />
            <span className="font-medium">Bài viết mới</span>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => onNavigate('admin')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentPage === 'admin' ? 'bg-[#5A5A40] text-white' : 'text-[#5A5A40] hover:bg-[#F5F5F0]'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="font-medium">Quản trị viên</span>
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-[#E5E5E0]">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <img src={user?.photoURL} alt={user?.displayName} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1A1A1A] truncate">{user?.displayName}</p>
              <p className="text-xs text-[#5A5A40] truncate capitalize">{user?.role === 'admin' ? 'Quản trị' : user?.role === 'editor' ? 'Biên tập' : user?.role === 'author' ? 'Tác giả' : 'Khách'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
