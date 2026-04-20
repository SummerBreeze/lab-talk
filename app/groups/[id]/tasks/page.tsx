'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { useGroupsStore } from '@/stores/groupsStore';
import { useTasksStore } from '@/stores/tasksStore';
import { useAuthStore } from '@/stores/authStore';
import { getUserById } from '@/lib/mock-data';

export default function GroupTasksPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const { user } = useAuthStore();
  const { groups, fetchGroups } = useGroupsStore();
  const { tasks, fetchTasks, createTask, toggleTaskComplete } = useTasksStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (groups.length === 0) {
      fetchGroups();
    }
    fetchTasks(groupId);
  }, [groupId, groups.length, fetchGroups, fetchTasks]);

  const group = groups.find(g => g.id === groupId);
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const groupMembers = group?.members
    .map(m => {
      const user = getUserById(m.userId);
      return user ? { id: user.id, name: user.name } : null;
    })
    .filter(Boolean) as Array<{ id: string; name: string }>;

  const handleCreateTask = async (data: {
    title: string;
    description: string;
    assignedTo: string;
    dueDate: string;
  }) => {
    await createTask({
      ...data,
      groupId,
      createdBy: user?.id,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });
    setShowForm(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push(`/groups/${groupId}`)}>
          ← 返回课题组
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#4a4a4a]">任务管理</h1>
            <p className="text-[#a8a8a0] mt-1">{group?.name}</p>
          </div>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '取消' : '创建任务'}
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>创建新任务</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskForm
                groupMembers={groupMembers}
                onSubmit={handleCreateTask}
                onCancel={() => setShowForm(false)}
              />
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-xl font-semibold text-[#4a4a4a] mb-4">进行中</h2>
          {activeTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-[#a8a8a0] mb-4">暂无进行中的任务</p>
                <Button variant="primary" onClick={() => setShowForm(true)}>
                  创建第一个任务
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeTasks.map((task) => {
                const assignee = task.assignedTo ? getUserById(task.assignedTo) : null;
                const assigner = getUserById(task.createdBy);
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

                return (
                  <TaskCard
                    key={task.id}
                    title={task.title}
                    description={task.description}
                    assigneeName={assignee?.name || '未知'}
                    assignerName={assigner?.name || '未知'}
                    dueDate={task.dueDate}
                    isCompleted={task.status === 'completed'}
                    isOverdue={isOverdue}
                    onToggleComplete={() => toggleTaskComplete(task.id)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-[#4a4a4a] mb-4">已完成</h2>
            <div className="space-y-3">
              {completedTasks.map((task) => {
                const assignee = task.assignedTo ? getUserById(task.assignedTo) : null;
                const assigner = getUserById(task.createdBy);

                return (
                  <TaskCard
                    key={task.id}
                    title={task.title}
                    description={task.description}
                    assigneeName={assignee?.name || '未知'}
                    assignerName={assigner?.name || '未知'}
                    dueDate={task.dueDate}
                    isCompleted={task.status === 'completed'}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
