import React, { useMemo } from "react";
import {
  format,
  parseISO,
  differenceInMinutes,
  startOfDay,
  endOfDay,
  addHours,
} from "date-fns";
import { IMeeting } from "@/api/meetingApi";
import { useRouter } from "next/navigation";

interface DayEvents {
  [key: string]: IMeeting[];
}

interface CalendarTimelineProps {
  events: IMeeting[];
  selectedWeek: Date;
}

const CalendarTimeline: React.FC<CalendarTimelineProps> = ({
  events,
  selectedWeek,
}) => {
  const router = useRouter();
  // Group events by day
  const groupedEvents = useMemo(() => {
    const grouped: DayEvents = {};
    if (events && events.length > 0) {
      events.forEach((event) => {
        const day = format(parseISO(event.timeStart), "yyyy-MM-dd");
        if (!grouped[day]) {
          grouped[day] = [];
        }
        grouped[day].push(event);
      });
    }
    return grouped;
  }, [events]);

  // Calculate timeline range
  const timelineRange = useMemo(() => {
    if (events && events.length > 0) {
      if (events.length === 0) return { start: 0, end: 24 };

      const startTimes = events.map((e) => parseISO(e.timeStart).getHours());
      const endTimes = events.map((e) => parseISO(e.timeEnd).getHours());

      return {
        start: Math.max(0, Math.min(...startTimes) - 1),
        end: Math.min(24, Math.max(...endTimes) + 1),
      };
    }
  }, [events]);

  // Generate timeline hours
  const timelineHours = useMemo(() => {
    if (timelineRange) {
      const hours = [];
      for (let i = timelineRange.start; i <= timelineRange.end; i++) {
        hours.push(i);
      }
      return hours;
    }
  }, [timelineRange]);

  // Calculate event position and width
  const getEventStyle = (event: IMeeting) => {
    if (timelineRange) {
      const startTime = parseISO(event.timeStart);
      const endTime = parseISO(event.timeEnd);
      const dayStart = startOfDay(startTime);

      const startOffset = differenceInMinutes(startTime, dayStart);
      const duration = differenceInMinutes(endTime, startTime);

      const totalMinutesInView = (timelineRange.end - timelineRange.start) * 60;
      const leftPosition =
        ((startOffset - timelineRange.start * 60) / totalMinutesInView) * 100;
      const width = (duration / totalMinutesInView) * 100;

      return {
        left: `${leftPosition}%`,
        width: `${width}%`,
      };
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Timeline Header */}
      <div className="flex ml-20 border-b">
        {timelineHours?.map((hour) => (
          <div
            key={hour}
            className="flex-1 text-xs text-textSecondary text-center"
          >
            {format(addHours(startOfDay(new Date()), hour), "HH:mm a")}
          </div>
        ))}
      </div>

      {/* Days and Events */}
      <div className="flex flex-col">
        {Array.from({ length: 7 }).map((_, index) => {
          const currentDate = new Date(selectedWeek);
          currentDate.setDate(currentDate.getDate() + index);
          const dateKey = format(currentDate, "yyyy-MM-dd");
          const dayEvents = groupedEvents[dateKey] || [];

          return (
            <div key={dateKey} className="flex items-center min-h-16 border-b">
              {/* Date Column */}
              <div className="w-20 px-2 py-4 text-sm text-textSecondary">
                {format(currentDate, "d MMM")}
              </div>

              {/* Events Container */}
              <div className="flex-1 relative h-16">
                {/* Hour Grid Lines */}
                <div className="absolute inset-0 flex">
                  {timelineHours?.map((hour) => (
                    <div
                      key={hour}
                      className="flex-1 border-l border-gray-200 hover:bg-secondary-50"
                    />
                  ))}
                </div>

                {/* Events */}
                {dayEvents.map((event, eventIndex) => (
                  <button
                    key={eventIndex}
                    className="absolute top-2 h-12 rounded-md flex items-center px-2 text-sm"
                    onClick={() => router.push(event.url)}
                    style={{
                      ...getEventStyle(event),
                      backgroundColor: "#E5F6FD",
                      borderLeft: "4px solid",
                      borderColor: "#0EA5E9",
                    }}
                  >
                    {event.timeStart && (
                      <div className="flex items-center gap-2">
                        <p className="text-textPrimary">{`Meeting at ${format(
                          event.timeStart,
                          "HH:mm a"
                        )}`}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarTimeline;
