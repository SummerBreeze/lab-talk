import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';

interface ReportCreateFormProps {
  groups: any[];
  formData: {
    title: string;
    content: string;
    groupId: string;
    visibility: 'private' | 'group' | 'teacher';
  };
  onFormDataChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function ReportCreateForm({
  groups,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
}: ReportCreateFormProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <Input
            label="周报标题"
            placeholder="例如：第8周周报 - 模型训练进展"
            value={formData.title}
            onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-[#4a4a4a] mb-1.5">
              所属课题组
            </label>
            <select
              className="w-full px-4 py-2 border border-[#d8d4cc] rounded-lg bg-white text-[#4a4a4a] focus:outline-none focus:ring-2 focus:ring-[#9db4c0] focus:border-transparent"
              value={formData.groupId}
              onChange={(e) => onFormDataChange({ ...formData, groupId: e.target.value })}
              required
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <Textarea
            label="周报内容"
            placeholder="详细描述本周的工作内容、遇到的问题、下周计划等..."
            value={formData.content}
            onChange={(e) => onFormDataChange({ ...formData, content: e.target.value })}
            rows={12}
            required
          />

          <div>
            <label className="block text-sm font-medium text-[#4a4a4a] mb-2">
              可见性
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-[#d8d4cc] rounded-lg cursor-pointer hover:bg-[#f0ede8] transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={formData.visibility === 'private'}
                  onChange={(e) => onFormDataChange({ ...formData, visibility: 'private' })}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-[#4a4a4a]">仅自己可见</p>
                  <p className="text-sm text-[#a8a8a0]">草稿状态，只有你能看到</p>
                </div>
              </label>
              <label className="flex items-center p-3 border border-[#d8d4cc] rounded-lg cursor-pointer hover:bg-[#f0ede8] transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="teacher"
                  checked={formData.visibility === 'teacher'}
                  onChange={(e) => onFormDataChange({ ...formData, visibility: 'teacher' })}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-[#4a4a4a]">仅教师可见</p>
                  <p className="text-sm text-[#a8a8a0]">只有导师能看到你的周报</p>
                </div>
              </label>
              <label className="flex items-center p-3 border border-[#d8d4cc] rounded-lg cursor-pointer hover:bg-[#f0ede8] transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="group"
                  checked={formData.visibility === 'group'}
                  onChange={(e) => onFormDataChange({ ...formData, visibility: 'group' })}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-[#4a4a4a]">组内可见</p>
                  <p className="text-sm text-[#a8a8a0]">课题组所有成员都能看到</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary">
              保存草稿
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel}>
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
