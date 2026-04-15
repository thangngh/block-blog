import React, { useState, useEffect } from 'react';
import { Comment, UserProfile } from '../types';
import { Send, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useBlogData } from '../lib/storage';

interface DiscussionProps {
  postId: string;
  profile: UserProfile;
}

export function Discussion({ postId, profile }: DiscussionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const storage = useBlogData();

  useEffect(() => {
    setComments(storage.getComments(postId));
  }, [postId, storage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      postId,
      authorId: profile.uid,
      authorName: profile.displayName,
      text: newComment,
      createdAt: new Date().toISOString(),
    };

    storage.addComment(postId, comment);
    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-6 mb-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F5F5F0] flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-4 h-4 text-[#5A5A40]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-[#1A1A1A] truncate">{comment.authorName}</span>
                <span className="text-[10px] text-gray-400">{formatDistanceToNow(new Date(comment.createdAt))} trước</span>
              </div>
              <p className="text-sm text-[#5A5A40] leading-relaxed break-words">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Thêm bình luận..."
          className="w-full px-4 py-3 bg-[#F9F9F7] border border-[#E5E5E0] rounded-2xl focus:ring-1 focus:ring-[#5A5A40] outline-none text-sm resize-none pr-12"
          rows={3}
        />
        <button
          type="submit"
          className="absolute right-3 bottom-3 p-2 bg-[#5A5A40] text-white rounded-xl hover:bg-[#4A4A30] transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
