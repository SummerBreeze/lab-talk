import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';

interface MeetingCreateFormProps {
  groups: any[];
  formData: {
    groupId: string;
    title: string;
    description: string;
    scheduledAt: string;
    endTime: string;
    location: string;
  };
  onFormDataChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function MeetingCreateForm({
  groups,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
}: MeetingCreateFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>创建新组会</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#4a4a4a] mb-2">
              选择课题组
            </label>
            <select
              className="w-full px-3 py-2 border border-[#e5e5e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b7355]"
              value={formData.groupId}
              onChange={(e) => onFormDataChange({ ...formData, groupId: e.target.value })}
              required
            >
              <option value="">请选择课题组</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="会议标题"
            placeholder="例如：周例会 - 项目进度汇报"
            value={formData.title}
            onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
            required
          />
          <Textarea
            label="会议描述"
            placeholder="简要描述会议内容..."
            value={formData.description}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
            rows={3}
          />
          <Input
            label="开始时间"
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={(e) => onFormDataChange({ ...formData, scheduledAt: e.target.value })}
            required
          />
          <Input
            label="结束时间"
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => onFormDataChange({ ...formData, endTime: e.target.value })}
            required
          />
          <Input
            label="会议地点"
            placeholder="例如：实验室 A301"
            value={formData.location}
            onChange={(e) => onFormDataChange({ ...formData, location: e.target.value })}
          />
          <div className="flex gap-3">
            <Button type="submit" variant="primary">
              创建组会
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
