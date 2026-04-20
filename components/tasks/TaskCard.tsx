import React from 'react';
import { Badge } from '@/components/ui/Badge';

interface TaskCardProps {
  title: string;
  description?: string;
  assigneeName: string;
  assignerName: string;
  dueDate?: Date;
  isCompleted: boolean;
  isOverdue?: boolean;
  onToggleComplete?: () => void;
}

export function TaskCard({
  title,
  description,
  assigneeName,
  assignerName,
  dueDate,
  isCompleted,
  isOverdue = false,
  onToggleComplete,
}: TaskCardProps) {
  return (
    <div className="p-4 rounded-xl border border-[#d8d4cc] bg-white hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3
              className={`text-lg font-semibold ${
                isCompleted ? 'text-[#a8a8a0] line-through' : 'text-[#4a4a4a]'
              }`}
            >
              {title}
            </h3>
            {isOverdue && !isCompleted && <Badge variant="warning">已逾期</Badge>}
            {isCompleted && <Badge variant="success">已完成</Badge>}
          </div>
          {description && (
            <p className="text-sm text-[#a8a8a0] mb-3">{description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-[#a8a8a0]">
            <span>负责人：{assigneeName}</span>
            <span>分配者：{assignerName}</span>
            {dueDate && (
              <span className={isOverdue && !isCompleted ? 'text-red-500' : ''}>
                截止：{dueDate.toLocaleDateString('zh-CN')}
              </span>
            )}
          </div>
        </div>
        {!isCompleted && onToggleComplete && (
          <button
            onClick={onToggleComplete}
            className="ml-4 px-3 py-1.5 text-sm border-2 border-[#9db4c0] text-[#9db4c0] rounded-lg hover:bg-[#9db4c0] hover:text-white transition-colors"
          >
            标记完成
          </button>
        )}
      </div>
    </div>
  );
}
