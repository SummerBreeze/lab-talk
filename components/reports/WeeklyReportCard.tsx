import React, { memo } from 'react';
import { Badge } from '@/components/ui/Badge';

interface WeeklyReportCardProps {
  title: string;
  content: string;
  authorName: string;
  submittedAt?: Date;
  updatedAt: Date;
  visibility: 'private' | 'group' | 'teacher';
  isSubmitted: boolean;
  onClick?: () => void;
}

export const WeeklyReportCard = memo(function WeeklyReportCard({
  title,
  content,
  authorName,
  submittedAt,
  updatedAt,
  visibility,
  isSubmitted,
  onClick,
}: WeeklyReportCardProps) {
  return (
    <div
      onClick={onClick}
      className="p-4 rounded-xl border border-[#d8d4cc] bg-white hover:shadow-md hover:border-[#9db4c0] transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-[#4a4a4a] flex-1">{title}</h3>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              visibility === 'group'
                ? 'info'
                : visibility === 'teacher'
                ? 'warning'
                : 'default'
            }
          >
            {visibility === 'group'
              ? '组内可见'
              : visibility === 'teacher'
              ? '仅教师'
              : '私密'}
          </Badge>
          {isSubmitted ? (
            <Badge variant="success">已提交</Badge>
          ) : (
            <Badge variant="default">草稿</Badge>
          )}
        </div>
      </div>

      <p className="text-sm text-[#a8a8a0] line-clamp-2 mb-3">{content}</p>

      <div className="flex items-center gap-4 text-xs text-[#a8a8a0]">
        <span>作者：{authorName}</span>
        <span>
          {isSubmitted
            ? `提交于 ${submittedAt?.toLocaleDateString('zh-CN')}`
            : `更新于 ${updatedAt.toLocaleDateString('zh-CN')}`}
        </span>
      </div>
    </div>
  );
});
