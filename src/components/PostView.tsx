import React, { useState, useEffect } from 'react';
import { Post, UserProfile } from '../types';
import { Edit2, MessageSquare, Clock, User as UserIcon, Loader2, FileText, CheckSquare, Square } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Discussion } from './Discussion';
import { useBlogData } from '../lib/storage';
import ReactMarkdown from 'react-markdown';

interface PostViewProps {
  postId: string;
  profile: UserProfile;
  onEdit: (id: string) => void;
}

export function PostView({ postId, profile, onEdit }: PostViewProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const storage = useBlogData();

  useEffect(() => {
    const existingPost = storage.getPost(postId);
    if (existingPost) {
      setPost(existingPost);
    }
    setLoading(false);
  }, [postId, storage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#5A5A40]" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-serif text-[#1A1A1A]">Không tìm thấy bài viết.</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 text-[#5A5A40]">
            <div className="flex items-center gap-2 px-3 py-1 bg-white border border-[#E5E5E0] rounded-full text-xs font-medium">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(post.createdAt))} trước
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white border border-[#E5E5E0] rounded-full text-xs font-medium">
              <UserIcon className="w-3 h-3" />
              ID Tác giả: {post.authorId.substring(0, 8)}...
            </div>
          </div>
          {(post.authorId === profile.uid || profile.role === 'admin' || profile.role === 'editor') && (
            <button
              onClick={() => onEdit(post.id)}
              className="flex items-center gap-2 px-6 py-2 bg-[#5A5A40] text-white rounded-full hover:bg-[#4A4A30] transition-all shadow-lg"
            >
              <Edit2 className="w-4 h-4" />
              <span className="font-medium">Sửa câu chuyện</span>
            </button>
          )}
        </div>

        <h1 className="text-6xl font-serif font-bold text-[#1A1A1A] leading-tight mb-8">
          {post.title}
        </h1>
      </header>

      <article className="prose prose-lg max-w-none mb-24">
        {post.content.map((block) => (
          <div key={block.id} className="mb-8">
            {block.type === 'heading' && (
              <h2 className="text-3xl font-serif font-bold text-[#1A1A1A] mt-12 mb-6">
                {block.content}
              </h2>
            )}
            {block.type === 'text' && (
              <div className="text-lg text-[#1A1A1A] leading-relaxed prose prose-lg max-w-none">
                <ReactMarkdown>{block.content}</ReactMarkdown>
              </div>
            )}
            {block.type === 'bullet_list' && (
              <ul className="list-disc list-inside space-y-2 text-lg text-[#1A1A1A]">
                {block.metadata?.items?.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
            {block.type === 'numbered_list' && (
              <ol className="list-decimal list-inside space-y-2 text-lg text-[#1A1A1A]">
                {block.metadata?.items?.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            )}
            {block.type === 'todo_list' && (
              <div className="space-y-2">
                {block.metadata?.items?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-lg">
                    {item.checked ? <CheckSquare className="w-5 h-5 text-[#5A5A40]" /> : <Square className="w-5 h-5 text-gray-300" />}
                    <span className={item.checked ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'}>{item.text}</span>
                  </div>
                ))}
              </div>
            )}
            {block.type === 'quote' && (
              <blockquote className="border-l-4 border-[#5A5A40] pl-6 py-2 italic text-2xl text-[#5A5A40] font-serif">
                {block.content}
              </blockquote>
            )}
            {block.type === 'table' && (
              <div className="overflow-x-auto my-8">
                <table className="w-full border-collapse border border-[#E5E5E0]">
                  <tbody>
                    {block.metadata?.rows?.map((row: string[], ri: number) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="border border-[#E5E5E0] p-4 text-lg">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {block.type === 'image' && (
              <figure className="my-12">
                <img src={block.content} alt="" className="w-full rounded-3xl shadow-xl" referrerPolicy="no-referrer" />
              </figure>
            )}
            {block.type === 'video' && (
              <div className="my-12 aspect-video rounded-3xl overflow-hidden shadow-xl bg-black">
                <video src={block.content} controls className="w-full h-full" />
              </div>
            )}
            {block.type === 'pdf' && (
              <div className="my-12 p-8 bg-white rounded-3xl border border-[#E5E5E0] flex items-center gap-6 shadow-sm">
                <div className="p-4 bg-[#F5F5F0] rounded-2xl">
                  <FileText className="w-12 h-12 text-[#5A5A40]" />
                </div>
                <div>
                  <h4 className="text-xl font-serif font-bold text-[#1A1A1A] mb-1">{block.metadata?.fileName || 'PDF Document'}</h4>
                  <p className="text-[#5A5A40] mb-4">Size: {(block.metadata?.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                  <a href={block.content} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-2 bg-[#5A5A40] text-white rounded-full hover:bg-[#4A4A30] transition-all">
                    View Document
                  </a>
                </div>
              </div>
            )}
            {block.type === 'embed' && (
              <div className="my-12 aspect-video rounded-3xl overflow-hidden shadow-xl bg-black">
                <iframe src={block.content} className="w-full h-full" allowFullScreen />
              </div>
            )}
          </div>
        ))}
      </article>

      <section className="border-t border-[#E5E5E0] pt-12 pb-24">
        <div className="flex items-center gap-3 mb-12">
          <MessageSquare className="w-6 h-6 text-[#5A5A40]" />
          <h3 className="text-2xl font-serif font-bold text-[#1A1A1A]">Thảo luận</h3>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-[#E5E5E0] shadow-sm">
          <Discussion postId={postId} profile={profile} />
        </div>
      </section>
    </div>
  );
}
