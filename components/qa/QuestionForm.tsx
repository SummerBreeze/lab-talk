import React, { useState } from 'react';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface QuestionFormProps {
  onSubmit: (data: { title: string; content: string; isAnonymous: boolean }) => void;
  onCancel: () => void;
}

export function QuestionForm({ onSubmit, onCancel }: QuestionFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isAnonymous: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ title: '', content: '', isAnonymous: false });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="问题标题"
        placeholder="简要描述你的问题..."
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <Textarea
        label="问题详情"
        placeholder="详细描述你遇到的问题..."
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        rows={6}
        required
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="anonymous"
          checked={formData.isAnonymous}
          onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
          className="w-4 h-4 text-[#9db4c0] border-[#d8d4cc] rounded focus:ring-[#9db4c0]"
        />
        <label htmlFor="anonymous" className="text-sm text-[#4a4a4a]">
          匿名提问
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="primary">
          发布问题
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  );
}
