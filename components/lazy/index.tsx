import dynamic from 'next/dynamic';
import { CardSkeleton, MeetingCardSkeleton, ReportCardSkeleton, ListSkeleton } from '@/components/ui/Skeleton';

// 懒加载通知铃铛组件
export const LazyNotificationBell = dynamic(
  () => import('@/components/notifications/NotificationBell').then(mod => ({ default: mod.NotificationBell })),
  {
    ssr: false,
    loading: () => <div className="w-8 h-8" />,
  }
);

// 懒加载周报卡片组件
export const LazyWeeklyReportCard = dynamic(
  () => import('@/components/reports/WeeklyReportCard').then(mod => ({ default: mod.WeeklyReportCard })),
  {
    loading: () => <ReportCardSkeleton />,
  }
);
