import React, { useState } from 'react';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface TaskFormProps {
  groupMembers: Array<{ id: string; name: string }>;
  onSubmit: (data: {
    title: string;
    description: string;
    assignedTo: string;
    dueDate: string;
  }) => void;
  onCancel: () => void;
}

export function TaskForm({ groupMembers, onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: groupMembers[0]?.id || '',
    dueDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ title: '', description: '', assignedTo: groupMembers[0]?.id || '', dueDate: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="任务标题"
        placeholder="例如：完成模型评估报告"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <Textarea
        label="任务描述"
        placeholder="详细描述任务内容..."
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={4}
      />

      <div>
        <label className="block text-sm font-medium text-[#4a4a4a] mb-1.5">
          分配给
        </label>
        <select
          className="w-full px-4 py-2 border border-[#d8d4cc] rounded-lg bg-white text-[#4a4a4a] focus:outline-none focus:ring-2 focus:ring-[#9db4c0] focus:border-transparent"
          value={formData.assignedTo}
          onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
          required
        >
          {groupMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="截止日期"
        type="date"
        value={formData.dueDate}
        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
      />

      <div className="flex gap-3">
        <Button type="submit" variant="primary">
          创建任务
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  );
}
