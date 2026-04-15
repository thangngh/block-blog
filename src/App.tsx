/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Editor } from './components/Editor';
import { PostView } from './components/PostView';
import { AdminPanel } from './components/AdminPanel';
import { LogIn, Loader2 } from 'lucide-react';
import { useBlogData, getStorageData, saveStorageData } from './lib/storage';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<{ type: 'dashboard' | 'editor' | 'view' | 'admin', id?: string }>({ type: 'dashboard' });
  const storage = useBlogData();

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      const users = storage.getUsers();
      const user = users.find(u => u.uid === savedUser);
      if (user) {
        setProfile(user);
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = async () => {
    // Mock login for demo
    const mockUser: UserProfile = {
      uid: 'user-' + Math.random().toString(36).substr(2, 9),
      email: 'thangngh.00@gmail.com',
      displayName: 'Demo User',
      photoURL: 'https://picsum.photos/seed/demo/100/100',
      role: 'admin', // Default to admin for demo purposes
      status: 'accepted',
      createdAt: new Date().toISOString(),
    };
    
    storage.addUser(mockUser);
    localStorage.setItem('current_user', mockUser.uid);
    setProfile(mockUser);
  };

  const handleLogout = async () => {
    localStorage.removeItem('current_user');
    setProfile(null);
    setCurrentPage({ type: 'dashboard' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]">
        <Loader2 className="w-8 h-8 animate-spin text-[#5A5A40]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F0] p-4 text-center">
        <h1 className="text-6xl font-serif text-[#1A1A1A] mb-8">Blog Hiện Đại</h1>
        <p className="text-xl text-[#5A5A40] mb-12 max-w-md">
          Nền tảng viết blog tinh tế cho mọi người. Kéo, thả và xuất bản câu chuyện của bạn một cách dễ dàng.
        </p>
        <button
          onClick={handleLogin}
          className="flex items-center gap-3 px-8 py-4 bg-[#5A5A40] text-white rounded-full hover:bg-[#4A4A30] transition-all shadow-lg hover:shadow-xl"
        >
          <LogIn className="w-5 h-5" />
          <span className="font-medium tracking-wide">Bắt đầu viết ngay</span>
        </button>
      </div>
    );
  }

  return (
    <Layout 
      user={profile} 
      onLogout={handleLogout} 
      onNavigate={(page, id) => setCurrentPage({ type: page, id })}
      currentPage={currentPage.type}
    >
      {currentPage.type === 'dashboard' && (
        <Dashboard 
          profile={profile} 
          onEdit={(id) => setCurrentPage({ type: 'editor', id })}
          onView={(id) => setCurrentPage({ type: 'view', id })}
        />
      )}
      {currentPage.type === 'editor' && (
        <Editor 
          postId={currentPage.id} 
          profile={profile}
          onClose={() => setCurrentPage({ type: 'dashboard' })}
        />
      )}
      {currentPage.type === 'view' && (
        <PostView 
          postId={currentPage.id!} 
          profile={profile}
          onEdit={(id) => setCurrentPage({ type: 'editor', id })}
        />
      )}
      {currentPage.type === 'admin' && profile.role === 'admin' && (
        <AdminPanel profile={profile} />
      )}
    </Layout>
  );
}
