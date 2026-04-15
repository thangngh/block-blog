import React, { useState, useEffect } from 'react';
import { Version, Block } from '../types';
import { History, RotateCcw, Clock, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useBlogData } from '../lib/storage';

interface VersionHistoryProps {
  postId: string;
  onRestore: (content: Block[]) => void;
}

export function VersionHistory({ postId, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const storage = useBlogData();

  useEffect(() => {
    setVersions(storage.getVersions(postId).reverse());
  }, [postId, storage]);

  return (
    <div className="space-y-4">
      {versions.map((version) => (
        <div key={version.id} className="group p-4 bg-[#F9F9F7] rounded-2xl border border-transparent hover:border-[#E5E5E0] transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#5A5A40]" />
              <span className="text-sm font-medium text-[#1A1A1A]">{formatDistanceToNow(new Date(version.createdAt))} trước</span>
            </div>
            <button
              onClick={() => onRestore(version.content)}
              className="p-2 text-[#5A5A40] hover:bg-white rounded-full transition-all opacity-0 group-hover:opacity-100"
              title="Khôi phục phiên bản này"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#5A5A40]">
            <UserIcon className="w-3 h-3" />
            <span>Bởi {version.authorId === 'current' ? 'Bạn' : 'Tác giả'}</span>
          </div>
          <div className="mt-3 text-xs text-gray-400">
            {version.content.length} khối • {version.content.reduce((acc, b) => acc + (b.content?.length || 0), 0)} ký tự
          </div>
        </div>
      ))}
    </div>
  );
}
