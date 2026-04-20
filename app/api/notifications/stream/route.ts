import { NextRequest } from 'next/server';
import { db } from '@/db/drizzle';
import { notifications } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq, desc, gt, and } from 'drizzle-orm';

// GET /api/notifications/stream - SSE实时通知流
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();
  let lastCheckTime = new Date();

  const stream = new ReadableStream({
    async start(controller) {
      // 发送初始连接消息
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
      );

      // 轮询检查新通知
      const intervalId = setInterval(async () => {
        try {
          const newNotifications = await db
            .select()
            .from(notifications)
            .where(
              and(
                eq(notifications.userId, session.userId),
                gt(notifications.createdAt, lastCheckTime)
              )
            )
            .orderBy(desc(notifications.createdAt));

          if (newNotifications.length > 0) {
            lastCheckTime = new Date();

            for (const notification of newNotifications) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'notification',
                    data: notification
                  })}\n\n`
                )
              );
            }
          }

          // 发送心跳保持连接
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch (error) {
          console.error('SSE error:', error);
          clearInterval(intervalId);
          controller.close();
        }
      }, 5000); // 每5秒检查一次

      // 清理函数
      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
