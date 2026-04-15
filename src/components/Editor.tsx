import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Post, Block, UserProfile, PostStatus, Version } from '../types';
import { useBlogData } from '../lib/storage';
import { 
  Plus, Save, Send, X, GripVertical, Trash2, Image as ImageIcon, 
  Video, FileText, Type, Heading, Link as LinkIcon, Loader2, History, MessageSquare, CheckCircle, Edit2,
  List, ListOrdered, CheckSquare, Quote, Table, ChevronDown, ChevronUp
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Discussion } from './Discussion';
import { VersionHistory } from './VersionHistory';
import { ReviewSystem } from './ReviewSystem';

interface EditorProps {
  postId?: string;
  profile: UserProfile;
  onClose: () => void;
}

export function Editor({ postId, profile, onClose }: EditorProps) {
  const storage = useBlogData();
  const [post, setPost] = useState<Partial<Post>>({
    title: '',
    content: [],
    status: 'draft',
    authorId: profile.uid,
  });
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'history' | 'discussion' | 'review'>('edit');

  useEffect(() => {
    if (postId) {
      const existingPost = storage.getPost(postId);
      if (existingPost) {
        setPost(existingPost);
      }
      setLoading(false);
    }
  }, [postId, storage]);

  const pointerSensor = useSensor(PointerSensor);
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });
  const sensors = useSensors(pointerSensor, keyboardSensor);

  const handleSave = useCallback(async (status: PostStatus = post.status as PostStatus) => {
    setSaving(true);
    try {
      const finalPost: Post = {
        id: postId || Math.random().toString(36).substr(2, 9),
        title: post.title || 'Untitled',
        content: post.content || [],
        status,
        authorId: post.authorId || profile.uid,
        createdAt: post.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentVersionId: Math.random().toString(36).substr(2, 9),
      };

      storage.savePost(finalPost);
      
      // Create a version
      const version: Version = {
        id: finalPost.currentVersionId,
        postId: finalPost.id,
        content: finalPost.content,
        createdAt: finalPost.updatedAt,
        authorId: profile.uid,
      };
      storage.addVersion(finalPost.id, version);

      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  }, [postId, profile.uid, post, storage, onClose]);

  const addBlock = useCallback((type: Block['type']) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: '',
    };
    setPost(prev => ({ ...prev, content: [...(prev.content || []), newBlock] }));
  }, []);

  const updateBlock = useCallback((id: string, content: string, metadata?: any) => {
    setPost(prev => ({
      ...prev,
      content: prev.content?.map(b => b.id === id ? { ...b, content, metadata: { ...b.metadata, ...metadata } } : b)
    }));
  }, []);

  const removeBlock = useCallback((id: string) => {
    setPost(prev => ({ ...prev, content: prev.content?.filter(b => b.id !== id) }));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPost(prev => {
        const oldIndex = prev.content!.findIndex(b => b.id === active.id);
        const newIndex = prev.content!.findIndex(b => b.id === over.id);
        return { ...prev, content: arrayMove(prev.content!, oldIndex, newIndex) };
      });
    }
  }, []);

  const handleFileUpload = useCallback(async (id: string, file: File, type: 'image' | 'video' | 'pdf') => {
    // Mock upload using FileReader to get base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      updateBlock(id, url, { fileName: file.name, fileSize: file.size });
    };
    reader.readAsDataURL(file);
  }, [updateBlock]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#5A5A40]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex gap-8">
      <div className="flex-1">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all">
              <X className="w-6 h-6 text-[#5A5A40]" />
            </button>
            <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">
              {postId ? 'Sửa bài viết' : 'Bài viết mới'}
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 border border-[#5A5A40] text-[#5A5A40] rounded-full hover:bg-white transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Lưu nháp</span>
            </button>
            <button
              onClick={() => handleSave('review')}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-[#5A5A40] text-white rounded-full hover:bg-[#4A4A30] transition-all disabled:opacity-50 shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span>Gửi duyệt</span>
            </button>
          </div>
        </header>

        <div className="bg-white rounded-3xl border border-[#E5E5E0] p-12 shadow-sm min-h-[800px]">
          <input
            type="text"
            placeholder="Tiêu đề câu chuyện"
            value={post.title}
            onChange={e => setPost(prev => ({ ...prev, title: e.target.value }))}
            className="w-full text-5xl font-serif font-bold text-[#1A1A1A] placeholder-gray-200 border-none focus:ring-0 mb-12"
          />

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={post.content?.map(b => b.id) || []} strategy={verticalListSortingStrategy}>
              <div className="space-y-6">
                {post.content?.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    onUpdate={updateBlock}
                    onRemove={removeBlock}
                    onUpload={handleFileUpload}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="mt-12 pt-12 border-t border-[#F5F5F0] flex flex-wrap gap-4 justify-center">
            <BlockButton icon={<Heading />} label="Tiêu đề" onClick={() => addBlock('heading')} />
            <BlockButton icon={<Type />} label="Văn bản" onClick={() => addBlock('text')} />
            <BlockButton icon={<List />} label="Gạch đầu dòng" onClick={() => addBlock('bullet_list')} />
            <BlockButton icon={<ListOrdered />} label="Đánh số" onClick={() => addBlock('numbered_list')} />
            <BlockButton icon={<CheckSquare />} label="Việc cần làm" onClick={() => addBlock('todo_list')} />
            <BlockButton icon={<Quote />} label="Trích dẫn" onClick={() => addBlock('quote')} />
            <BlockButton icon={<Table />} label="Bảng" onClick={() => addBlock('table')} />
            <BlockButton icon={<ImageIcon />} label="Hình ảnh" onClick={() => addBlock('image')} />
            <BlockButton icon={<Video />} label="Video" onClick={() => addBlock('video')} />
            <BlockButton icon={<FileText />} label="PDF" onClick={() => addBlock('pdf')} />
            <BlockButton icon={<LinkIcon />} label="Nhúng" onClick={() => addBlock('embed')} />
          </div>
        </div>
      </div>

      {/* Sidebar for History, Discussion, Review */}
      <aside className="w-96 space-y-6 sticky top-8 h-fit">
        <div className="bg-white rounded-3xl border border-[#E5E5E0] overflow-hidden shadow-sm">
          <div className="flex border-b border-[#E5E5E0]">
            <TabButton active={activeTab === 'edit'} onClick={() => setActiveTab('edit')} icon={<Edit2 className="w-4 h-4" />} />
            <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History className="w-4 h-4" />} />
            <TabButton active={activeTab === 'discussion'} onClick={() => setActiveTab('discussion')} icon={<MessageSquare className="w-4 h-4" />} />
            <TabButton active={activeTab === 'review'} onClick={() => setActiveTab('review')} icon={<CheckCircle className="w-4 h-4" />} />
          </div>
          <div className="p-6 h-[600px] overflow-y-auto">
            {activeTab === 'edit' && (
              <div className="text-center py-12">
                <p className="text-[#5A5A40]">Chế độ chỉnh sửa đang hoạt động. Sử dụng các khối bên trái để xây dựng câu chuyện của bạn.</p>
              </div>
            )}
            {activeTab === 'history' && postId && <VersionHistory postId={postId} onRestore={(content) => setPost(prev => ({ ...prev, content }))} />}
            {activeTab === 'discussion' && postId && <Discussion postId={postId} profile={profile} />}
            {activeTab === 'review' && postId && <ReviewSystem postId={postId} profile={profile} onStatusChange={(status) => setPost(prev => ({ ...prev, status }))} />}
          </div>
        </div>
      </aside>
    </div>
  );
}

function SortableBlock({ block, onUpdate, onRemove, onUpload }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 0 };
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div ref={setNodeRef} style={style} className={`group relative bg-white rounded-2xl border ${isDragging ? 'border-[#5A5A40] shadow-xl' : 'border-transparent hover:border-[#E5E5E0]'} transition-all p-4`}>
      <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
        <button {...attributes} {...listeners} className="p-2 text-gray-400 hover:text-[#5A5A40] cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5" />
        </button>
        <button onClick={() => onRemove(block.id)} className="p-2 text-gray-400 hover:text-red-500">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {block.type === 'heading' && (
        <input
          type="text"
          value={block.content}
          onChange={e => onUpdate(block.id, e.target.value)}
          placeholder="Tiêu đề mục"
          className="w-full text-2xl font-serif font-bold text-[#1A1A1A] border-none focus:ring-0 p-0"
        />
      )}

      {block.type === 'text' && (
        <div onClick={() => setIsEditing(true)}>
          {isEditing ? (
            <textarea
              autoFocus
              onBlur={() => setIsEditing(false)}
              value={block.content}
              onChange={e => onUpdate(block.id, e.target.value)}
              placeholder="Viết điều gì đó tuyệt vời... (Hỗ trợ Markdown)"
              className="w-full text-lg text-[#1A1A1A] leading-relaxed border-none focus:ring-0 p-0 min-h-[100px] resize-none"
            />
          ) : (
            <div className="prose prose-lg max-w-none min-h-[100px] text-[#1A1A1A]">
              {block.content ? <ReactMarkdown>{block.content}</ReactMarkdown> : <span className="text-gray-300 italic">Viết điều gì đó tuyệt vời...</span>}
            </div>
          )}
        </div>
      )}

      {block.type === 'bullet_list' && (
        <ListEditor 
          items={block.metadata?.items || ['']} 
          onChange={(items) => onUpdate(block.id, block.content, { items })}
          ordered={false}
        />
      )}

      {block.type === 'numbered_list' && (
        <ListEditor 
          items={block.metadata?.items || ['']} 
          onChange={(items) => onUpdate(block.id, block.content, { items })}
          ordered={true}
        />
      )}

      {block.type === 'todo_list' && (
        <TodoEditor 
          items={block.metadata?.items || [{ text: '', checked: false }]} 
          onChange={(items) => onUpdate(block.id, block.content, { items })}
        />
      )}

      {block.type === 'quote' && (
        <div className="border-l-4 border-[#5A5A40] pl-6 py-2 italic text-xl text-[#5A5A40]">
          <textarea
            value={block.content}
            onChange={e => onUpdate(block.id, e.target.value)}
            placeholder="Nhập trích dẫn..."
            className="w-full bg-transparent border-none focus:ring-0 p-0 resize-none"
          />
        </div>
      )}

      {block.type === 'table' && (
        <TableEditor 
          rows={block.metadata?.rows || [['', ''], ['', '']]} 
          onChange={(rows) => onUpdate(block.id, block.content, { rows })}
        />
      )}

      {(block.type === 'image' || block.type === 'video' || block.type === 'pdf') && (
        <div className="relative">
          {block.content ? (
            <div className="rounded-xl overflow-hidden bg-[#F9F9F7]">
              {block.type === 'image' && <img src={block.content} alt="" className="w-full h-auto" referrerPolicy="no-referrer" />}
              {block.type === 'video' && <video src={block.content} controls className="w-full h-auto" />}
              {block.type === 'pdf' && (
                <div className="p-8 flex items-center gap-4">
                  <FileText className="w-12 h-12 text-[#5A5A40]" />
                  <div>
                    <p className="font-medium text-[#1A1A1A]">{block.metadata?.fileName || 'Tài liệu PDF'}</p>
                    <a href={block.content} target="_blank" rel="noopener noreferrer" className="text-sm text-[#5A5A40] underline">Xem PDF</a>
                  </div>
                </div>
              )}
              <button onClick={() => onUpdate(block.id, '')} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#E5E5E0] rounded-2xl cursor-pointer hover:bg-[#F9F9F7] transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {block.type === 'image' ? <ImageIcon className="w-10 h-10 text-gray-400 mb-3" /> :
                 block.type === 'video' ? <Video className="w-10 h-10 text-gray-400 mb-3" /> :
                 <FileText className="w-10 h-10 text-gray-400 mb-3" />}
                <p className="text-sm text-gray-500">Nhấp để tải lên {block.type === 'image' ? 'hình ảnh' : block.type === 'video' ? 'video' : 'tài liệu'}</p>
              </div>
              <input type="file" className="hidden" accept={block.type === 'image' ? 'image/*' : block.type === 'video' ? 'video/*' : 'application/pdf'} onChange={e => e.target.files?.[0] && onUpload(block.id, e.target.files[0], block.type)} />
            </label>
          )}
        </div>
      )}

      {block.type === 'embed' && (
        <div className="space-y-4">
          <input
            type="text"
            value={block.content}
            onChange={e => onUpdate(block.id, e.target.value)}
            placeholder="Dán URL nhúng (YouTube, Vimeo, v.v.)"
            className="w-full px-4 py-2 bg-[#F9F9F7] border border-[#E5E5E0] rounded-xl focus:ring-1 focus:ring-[#5A5A40] outline-none"
          />
          {block.content && (
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <iframe src={block.content} className="w-full h-full" allowFullScreen />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BlockButton({ icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-[#F9F9F7] transition-all group"
    >
      <div className="p-3 bg-white border border-[#E5E5E0] rounded-xl group-hover:border-[#5A5A40] group-hover:text-[#5A5A40] transition-all">
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
      <span className="text-xs font-medium text-[#5A5A40]">{label}</span>
    </button>
  );
}

function TabButton({ active, onClick, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center py-4 border-b-2 transition-all ${
        active ? 'border-[#5A5A40] text-[#5A5A40]' : 'border-transparent text-gray-400 hover:text-[#5A5A40]'
      }`}
    >
      {icon}
    </button>
  );
}

function ListEditor({ items, onChange, ordered }: { items: string[], onChange: (items: string[]) => void, ordered: boolean }) {
  const addItem = () => onChange([...items, '']);
  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };
  const removeItem = (index: number) => {
    if (items.length > 1) {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-[#5A5A40] font-medium w-6 text-right">
            {ordered ? `${index + 1}.` : '•'}
          </span>
          <input
            type="text"
            value={item}
            onChange={e => updateItem(index, e.target.value)}
            className="flex-1 border-none focus:ring-0 p-0 text-lg text-[#1A1A1A]"
            placeholder="Nội dung danh sách..."
          />
          <button onClick={() => removeItem(index)} className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={addItem} className="text-sm text-[#5A5A40] hover:underline flex items-center gap-1 mt-2">
        <Plus className="w-3 h-3" /> Thêm mục
      </button>
    </div>
  );
}

function TodoEditor({ items, onChange }: { items: { text: string, checked: boolean }[], onChange: (items: { text: string, checked: boolean }[]) => void }) {
  const addItem = () => onChange([...items, { text: '', checked: false }]);
  const updateItem = (index: number, updates: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    onChange(newItems);
  };
  const removeItem = (index: number) => {
    if (items.length > 1) {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={e => updateItem(index, { checked: e.target.checked })}
            className="w-5 h-5 rounded border-[#E5E5E0] text-[#5A5A40] focus:ring-[#5A5A40]"
          />
          <input
            type="text"
            value={item.text}
            onChange={e => updateItem(index, { text: e.target.value })}
            className={`flex-1 border-none focus:ring-0 p-0 text-lg ${item.checked ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'}`}
            placeholder="Việc cần làm..."
          />
          <button onClick={() => removeItem(index)} className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={addItem} className="text-sm text-[#5A5A40] hover:underline flex items-center gap-1 mt-2">
        <Plus className="w-3 h-3" /> Thêm việc
      </button>
    </div>
  );
}

function TableEditor({ rows, onChange }: { rows: string[][], onChange: (rows: string[][]) => void }) {
  const addRow = () => onChange([...rows, new Array(rows[0].length).fill('')]);
  const addCol = () => onChange(rows.map(row => [...row, '']));
  
  const updateCell = (r: number, c: number, value: string) => {
    const newRows = rows.map((row, ri) => ri === r ? row.map((cell, ci) => ci === c ? value : cell) : row);
    onChange(newRows);
  };

  const removeRow = (r: number) => {
    if (rows.length > 1) onChange(rows.filter((_, ri) => ri !== r));
  };

  const removeCol = (c: number) => {
    if (rows[0].length > 1) onChange(rows.map(row => row.filter((_, ci) => ci !== c)));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} className="border border-[#E5E5E0] p-2 relative group/cell">
                  <input
                    type="text"
                    value={cell}
                    onChange={e => updateCell(ri, ci, e.target.value)}
                    className="w-full border-none focus:ring-0 p-0 text-sm"
                  />
                  {ri === 0 && (
                    <button onClick={() => removeCol(ci)} className="absolute -top-6 left-1/2 -translate-x-1/2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover/cell:opacity-100">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </td>
              ))}
              <td className="border-none p-2">
                <button onClick={() => removeRow(ri)} className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                  <X className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-4 mt-4">
        <button onClick={addRow} className="text-xs text-[#5A5A40] hover:underline flex items-center gap-1">
          <Plus className="w-3 h-3" /> Thêm hàng
        </button>
        <button onClick={addCol} className="text-xs text-[#5A5A40] hover:underline flex items-center gap-1">
          <Plus className="w-3 h-3" /> Thêm cột
        </button>
      </div>
    </div>
  );
}
