import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { CheckCircle, XCircle, Loader2, Mail, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useBlogData } from '../lib/storage';

interface AdminPanelProps {
  profile: UserProfile;
}

export function AdminPanel({ profile }: AdminPanelProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const storage = useBlogData();

  useEffect(() => {
    setUsers(storage.getUsers());
    setLoading(false);
  }, [storage]);

  const handleUpdateUser = async (uid: string, updates: Partial<UserProfile>) => {
    try {
      storage.updateUser(uid, updates);
      setUsers(storage.getUsers());
    } catch (error) {
      console.error('User update failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#5A5A40]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-serif font-bold text-[#1A1A1A] mb-2">Bảng quản trị</h1>
        <p className="text-[#5A5A40]">Quản lý vai trò người dùng và phê duyệt yêu cầu truy cập.</p>
      </header>

      <div className="bg-white rounded-3xl border border-[#E5E5E0] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F9F9F7] border-b border-[#E5E5E0]">
              <th className="px-6 py-4 text-xs font-bold text-[#5A5A40] uppercase tracking-wider">Người dùng</th>
              <th className="px-6 py-4 text-xs font-bold text-[#5A5A40] uppercase tracking-wider">Vai trò</th>
              <th className="px-6 py-4 text-xs font-bold text-[#5A5A40] uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4 text-xs font-bold text-[#5A5A40] uppercase tracking-wider">Tham gia</th>
              <th className="px-6 py-4 text-xs font-bold text-[#5A5A40] uppercase tracking-wider text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F5F0]">
            {users.map((user) => (
              <tr key={user.uid} className="hover:bg-[#F9F9F7] transition-all">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">{user.displayName}</p>
                      <div className="flex items-center gap-1 text-xs text-[#5A5A40]">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateUser(user.uid, { role: e.target.value as UserRole })}
                    className="text-sm bg-white border border-[#E5E5E0] rounded-lg px-3 py-1 focus:ring-1 focus:ring-[#5A5A40] outline-none capitalize"
                  >
                    <option value="admin">Quản trị</option>
                    <option value="editor">Biên tập</option>
                    <option value="author">Tác giả</option>
                    <option value="guest">Khách</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    user.status === 'accepted' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {user.status === 'accepted' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {user.status === 'accepted' ? 'Đã duyệt' : 'Đang chờ'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[#5A5A40]">
                  {formatDistanceToNow(new Date(user.createdAt))} trước
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {user.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateUser(user.uid, { status: 'accepted', role: 'author' })}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-all"
                        title="Phê duyệt"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    {user.uid !== profile.uid && (
                      <button
                        onClick={() => handleUpdateUser(user.uid, { status: 'pending' })}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-all"
                        title="Tạm dừng"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
