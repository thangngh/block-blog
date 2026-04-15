import React, { useState, useEffect } from 'react';
import { Review, UserProfile, PostStatus } from '../types';
import { CheckCircle, AlertCircle, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useBlogData } from '../lib/storage';

interface ReviewSystemProps {
  postId: string;
  profile: UserProfile;
  onStatusChange: (status: PostStatus) => void;
}

export function ReviewSystem({ postId, profile, onStatusChange }: ReviewSystemProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const storage = useBlogData();

  useEffect(() => {
    setReviews(storage.getReviews(postId).reverse());
  }, [postId, storage]);

  const handleSubmit = async (status: 'approved' | 'requested_changes') => {
    if (!feedback.trim()) return;
    setSubmitting(true);

    try {
      const review: Review = {
        id: Math.random().toString(36).substr(2, 9),
        postId,
        reviewerId: profile.uid,
        status,
        feedback,
        createdAt: new Date().toISOString(),
      };

      storage.addReview(postId, review);
      setReviews(prev => [review, ...prev]);

      const newPostStatus = status === 'approved' ? 'published' : 'draft';
      const post = storage.getPost(postId);
      if (post) {
        storage.savePost({ ...post, status: newPostStatus });
        onStatusChange(newPostStatus);
      }
      setFeedback('');
    } catch (error) {
      console.error('Review submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const isEditor = profile.role === 'admin' || profile.role === 'editor';

  return (
    <div className="space-y-8">
      {isEditor && (
        <div className="bg-[#F9F9F7] p-6 rounded-3xl border border-[#E5E5E0]">
          <h3 className="text-lg font-serif font-bold text-[#1A1A1A] mb-4">Gửi đánh giá</h3>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Cung cấp phản hồi cho tác giả..."
            className="w-full px-4 py-3 bg-white border border-[#E5E5E0] rounded-2xl focus:ring-1 focus:ring-[#5A5A40] outline-none text-sm resize-none mb-4"
            rows={4}
          />
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit('requested_changes')}
              disabled={submitting || !feedback.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition-all disabled:opacity-50"
            >
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Yêu cầu sửa đổi</span>
            </button>
            <button
              onClick={() => handleSubmit('approved')}
              disabled={submitting || !feedback.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Duyệt & Xuất bản</span>
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-sm font-medium text-[#5A5A40] uppercase tracking-wider">Lịch sử đánh giá</h3>
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400 italic text-sm">Chưa có đánh giá nào.</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-4 bg-white rounded-2xl border border-[#E5E5E0]">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  review.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {review.status === 'approved' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {review.status === 'approved' ? 'Đã duyệt' : 'Yêu cầu sửa'}
                </div>
                <span className="text-[10px] text-gray-400">{formatDistanceToNow(new Date(review.createdAt))} trước</span>
              </div>
              <p className="text-sm text-[#5A5A40] leading-relaxed mb-3">{review.feedback}</p>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <UserIcon className="w-3 h-3" />
                <span>ID Người duyệt: {review.reviewerId.substring(0, 8)}...</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
