'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTasksStore } from '@/stores/tasksStore';
import { useAuthStore } from '@/stores/authStore';
import { useGroupsStore } from '@/stores/groupsStore';
import { TaskForm } from '@/components/tasks/TaskForm';

export default function TasksPage() {
  const { user } = useAuthStore();
  const { tasks, isLoading, fetchTasks, toggleTaskComplete } = useTasksStore();
  const { groups, fetchGroups } = useGroupsStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [groupMembers, setGroupMembers] = useState<any[]>([]);

  useEffect(() => {
    fetchTasks();
    if (groups.length === 0) {
      fetchGroups();
    }
  }, [fetchTasks, fetchGroups, groups.length]);

  // 获取选中课题组的成员
  useEffect(() => {
    const fetchGroupMembers = async () => {
      if (!selectedGroupId) return;

      try {
        const res = await fetch(`/api/groups/${selectedGroupId}`);
        const data = await res.json();
        if (data.group && data.group.members) {
          // 转换数据格式以匹配TaskForm的期望
          const formattedMembers = data.group.members.map((member: any) => ({
            id: member.userId,
            name: member.userName,
          }));
          setGroupMembers(formattedMembers);
        }
      } catch (error) {
        console.error('Failed to fetch group members:', error);
      }
    };

    if (selectedGroupId) {
      fetchGroupMembers();
    }
  }, [selectedGroupId]);

  const handleCreateTask = async (formData: any) => {
    try {
      await useTasksStore.getState().createTask({
        ...formData,
        groupId: selectedGroupId,
      });
      setShowCreateForm(false);
      setSelectedGroupId('');
    } catch (error) {
      alert('创建任务失败');
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      await toggleTaskComplete(taskId);
    } catch (error) {
      alert('更新任务状态失败');
    }
  };

  // 按状态分组任务
  const pendingTasks = useMemo(
    () => tasks.filter(t => t.status === 'pending' || t.status === 'in_progress'),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter(t => t.status === 'completed'),
    [tasks]
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#4a4a4a]">任务管理</h1>
            <p className="text-[#a8a8a0] mt-1">
              {user?.role === 'teacher' ? '发布和管理任务' : '查看和完成任务'}
            </p>
          </div>
          {user?.role === 'teacher' && (
            <Button
              variant="primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? '取消' : '发布任务'}
            </Button>
          )}
        </div>

        {/* 教师端：创建任务表单 */}
        {user?.role === 'teacher' && showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>发布新任务</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4a4a4a] mb-2">
                    选择课题组
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-[#e5e5e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b7355]"
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
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

                {selectedGroupId && groupMembers.length > 0 && (
                  <TaskForm
                    groupMembers={groupMembers}
                    onSubmit={handleCreateTask}
                    onCancel={() => {
                      setShowCreateForm(false);
                      setSelectedGroupId('');
                    }}
                  />
                )}

                {selectedGroupId && groupMembers.length === 0 && (
                  <p className="text-[#a8a8a0] text-center py-4">
                    该课题组暂无成员
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 待完成任务 */}
        <div>
          <h2 className="text-xl font-semibold text-[#4a4a4a] mb-4">
            待完成任务 ({pendingTasks.length})
          </h2>
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-[#a8a8a0]">加载中...</p>
              </CardContent>
            </Card>
          ) : pendingTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-[#a8a8a0]">暂无待完成任务</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <Card key={task.id} hover>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      {/* 复选框 */}
                      {user?.role === 'student' && (
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => handleToggleComplete(task.id)}
                          className="mt-1 w-5 h-5 rounded border-[#d8d4cc] text-[#6366f1] focus:ring-2 focus:ring-[#6366f1] cursor-pointer"
                        />
                      )}

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-[#0f172a]">{task.title}</h3>
                          <Badge variant={task.priority === 'high' ? 'warning' : task.priority === 'medium' ? 'info' : 'default'}>
                            {task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级'}
                          </Badge>
                        </div>

                        {task.description && (
                          <p className="text-sm text-[#64748b] mb-2">{task.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-[#64748b]">
                          {task.dueDate && (
                            <span>📅 截止：{new Date(task.dueDate).toLocaleDateString('zh-CN')}</span>
                          )}
                          <span>📌 {task.status === 'in_progress' ? '进行中' : '待开始'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 已完成任务 */}
        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-[#4a4a4a] mb-4">
              已完成任务 ({completedTasks.length})
            </h2>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      {/* 复选框 */}
                      {user?.role === 'student' && (
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={() => handleToggleComplete(task.id)}
                          className="mt-1 w-5 h-5 rounded border-[#d8d4cc] text-[#6366f1] focus:ring-2 focus:ring-[#6366f1] cursor-pointer"
                        />
                      )}

                      <div className="flex-1 opacity-60">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-[#0f172a] line-through">{task.title}</h3>
                          <Badge variant="success">已完成</Badge>
                        </div>

                        {task.description && (
                          <p className="text-sm text-[#64748b] mb-2">{task.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-[#64748b]">
                          {task.dueDate && (
                            <span>📅 截止：{new Date(task.dueDate).toLocaleDateString('zh-CN')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
