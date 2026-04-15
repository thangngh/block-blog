import React, { useState, useEffect } from 'react';
import { Post, UserProfile } from '../types';
import { Plus, FileText, Clock, CheckCircle, AlertCircle, MoreVertical, Edit2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useBlogData } from '../lib/storage';

interface DashboardProps {
  profile: UserProfile;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}

export function Dashboard({ profile, onEdit, onView }: DashboardProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const storage = useBlogData();

  useEffect(() => {
    const allPosts = storage.getPosts();
    
    // Client-side filtering for role-based access
    const filtered = allPosts.filter(post => {
      if (profile.role === 'admin' || profile.role === 'editor') return true;
      if (post.authorId === profile.uid) return true;
      return post.status === 'published';
    });

    setPosts(filtered);
    setLoading(false);
  }, [profile.uid, profile.role, storage]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'review': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Đã xuất bản';
      case 'review': return 'Chờ duyệt';
      case 'draft': return 'Bản nháp';
      default: return status;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#1A1A1A] mb-2">Bài viết của tôi</h1>
          <p className="text-[#5A5A40]">Quản lý bản nháp, bài viết đã xuất bản và các bài chờ duyệt.</p>
        </div>
        <button
          onClick={() => onEdit('')}
          className="flex items-center gap-2 px-6 py-3 bg-[#5A5A40] text-white rounded-full hover:bg-[#4A4A30] transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Tạo bài viết mới</span>
        </button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white rounded-3xl border border-[#E5E5E0]" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-[#E5E5E0]">
          <FileText className="w-16 h-16 text-[#E5E5E0] mx-auto mb-4" />
          <h3 className="text-xl font-serif text-[#1A1A1A] mb-2">Chưa có bài viết nào</h3>
          <p className="text-[#5A5A40] mb-8">Hãy bắt đầu câu chuyện đầu tiên của bạn và chia sẻ nó với thế giới.</p>
          <button
            onClick={() => onEdit('')}
            className="px-8 py-3 bg-[#5A5A40] text-white rounded-full hover:bg-[#4A4A30] transition-all"
          >
            Bắt đầu ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group bg-white rounded-3xl border border-[#E5E5E0] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    post.status === 'published' ? 'bg-green-50 text-green-700' :
                    post.status === 'review' ? 'bg-amber-50 text-amber-700' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {getStatusIcon(post.status)}
                    {getStatusText(post.status)}
                  </div>
                  <button className="p-2 text-[#5A5A40] hover:bg-[#F5F5F0] rounded-full transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-xl font-serif font-bold text-[#1A1A1A] mb-3 group-hover:text-[#5A5A40] transition-colors line-clamp-2">
                  {post.title || 'Bài viết không tiêu đề'}
                </h3>
                
                <p className="text-sm text-[#5A5A40] mb-6 line-clamp-3">
                  {post.content.find(b => b.type === 'text')?.content || 'Chưa có nội dung...'}
                </p>
              </div>

              <div className="px-6 py-4 bg-[#F9F9F7] border-t border-[#E5E5E0] flex items-center justify-between">
                <span className="text-xs text-[#5A5A40]">
                  Cập nhật {formatDistanceToNow(new Date(post.updatedAt))} trước
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onView(post.id)}
                    className="p-2 text-[#5A5A40] hover:bg-white rounded-full border border-transparent hover:border-[#E5E5E0] transition-all"
                    title="Xem"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {(post.authorId === profile.uid || profile.role === 'admin' || profile.role === 'editor') && (
                    <button
                      onClick={() => onEdit(post.id)}
                      className="p-2 text-[#5A5A40] hover:bg-white rounded-full border border-transparent hover:border-[#E5E5E0] transition-all"
                      title="Sửa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
