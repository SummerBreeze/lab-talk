import React from 'react';
import { Badge } from '@/components/ui/Badge';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment?: (content: string) => void;
  canComment?: boolean;
}

export function CommentSection({ comments, onAddComment, canComment = false }: CommentSectionProps) {
  const [commentContent, setCommentContent] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !onAddComment) return;
    onAddComment(commentContent);
    setCommentContent('');
  };

  return (
    <div className="space-y-4">
      {canComment && (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            className="w-full px-4 py-2 border border-[#d8d4cc] rounded-lg bg-white text-[#4a4a4a] placeholder-[#a8a8a0] focus:outline-none focus:ring-2 focus:ring-[#9db4c0] focus:border-transparent transition-colors resize-vertical"
            placeholder="添加评论..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            rows={3}
          />
          <button
            type="submit"
            className="mt-3 inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-[#9db4c0] text-white hover:bg-[#8aa3af] focus:ring-[#9db4c0] px-4 py-2 text-base"
          >
            发表评论
          </button>
        </form>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-[#a8a8a0] text-center py-8">暂无评论</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-lg border border-[#d8d4cc] bg-[#f5f3f0]"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#9db4c0] flex items-center justify-center text-white font-medium flex-shrink-0">
                  {comment.userName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-[#4a4a4a]">{comment.userName}</span>
                    <Badge variant="info">教师</Badge>
                    <span className="text-xs text-[#a8a8a0]">
                      {comment.createdAt.toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <p className="text-sm text-[#4a4a4a]">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
