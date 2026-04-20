import React from 'react';
import { Badge } from '@/components/ui/Badge';

interface QuestionCardProps {
  title: string;
  content: string;
  authorName: string;
  isAnonymous: boolean;
  createdAt: Date;
  replyCount: number;
  onClick?: () => void;
}

export function QuestionCard({
  title,
  content,
  authorName,
  isAnonymous,
  createdAt,
  replyCount,
  onClick,
}: QuestionCardProps) {
  return (
    <div
      onClick={onClick}
      className="p-4 rounded-xl border border-[#d8d4cc] bg-white hover:shadow-md hover:border-[#b8c5b0] transition-all cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[#b8c5b0] flex items-center justify-center text-white font-medium flex-shrink-0">
          {isAnonymous ? '?' : authorName.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-[#4a4a4a]">{title}</h3>
            {isAnonymous && <Badge variant="default">匿名</Badge>}
          </div>
          <p className="text-sm text-[#4a4a4a] mb-3 line-clamp-2">{content}</p>
          <div className="flex items-center gap-4 text-xs text-[#a8a8a0]">
            <span>{isAnonymous ? '匿名用户' : authorName}</span>
            <span>{createdAt.toLocaleString('zh-CN')}</span>
            <span>💬 {replyCount} 条回复</span>
          </div>
        </div>
      </div>
    </div>
  );
}
