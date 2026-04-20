import React from 'react';

interface MeetingCardProps {
  title: string;
  scheduledAt: Date;
  location?: string;
  description?: string;
  status: 'upcoming' | 'past';
  onClick?: () => void;
}

export function MeetingCard({
  title,
  scheduledAt,
  location,
  description,
  status,
  onClick,
}: MeetingCardProps) {
  const isUpcoming = status === 'upcoming';

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border border-[#d8d4cc] transition-all cursor-pointer ${
        isUpcoming
          ? 'bg-white hover:shadow-md hover:border-[#9db4c0]'
          : 'bg-[#f5f3f0] hover:bg-[#f0ede8]'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3
          className={`text-lg font-semibold ${
            isUpcoming ? 'text-[#4a4a4a]' : 'text-[#a8a8a0]'
          }`}
        >
          {title}
        </h3>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isUpcoming
              ? 'bg-[#9db4c0] text-white'
              : 'bg-[#c8c8c0] text-[#4a4a4a]'
          }`}
        >
          {isUpcoming ? '即将开始' : '已结束'}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div
          className={`flex items-center gap-2 ${
            isUpcoming ? 'text-[#4a4a4a]' : 'text-[#a8a8a0]'
          }`}
        >
          <span>📅</span>
          <span>{scheduledAt.toLocaleString('zh-CN')}</span>
        </div>

        {location && (
          <div
            className={`flex items-center gap-2 ${
              isUpcoming ? 'text-[#4a4a4a]' : 'text-[#a8a8a0]'
            }`}
          >
            <span>📍</span>
            <span>{location}</span>
          </div>
        )}

        {description && (
          <p className="text-[#a8a8a0] mt-2 line-clamp-2">{description}</p>
        )}
      </div>
    </div>
  );
}
