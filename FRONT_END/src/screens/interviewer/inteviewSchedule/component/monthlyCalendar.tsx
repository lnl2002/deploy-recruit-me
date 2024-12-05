import React, { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isToday,
  isSameMonth,
  startOfWeek,
  endOfWeek,
  parseISO,
  isSameDay,
} from "date-fns";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { Flag } from "lucide-react";
import { IMeeting } from "@/api/meetingApi";
import { useRouter } from "next/navigation";

interface MonthCalendarProps {
  events: IMeeting[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({
  events,
  selectedDate = new Date(),
  onDateSelect,
}) => {
  // Generate calendar days
  const router = useRouter();
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [selectedDate]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: { [key: string]: IMeeting[] } = {};
    events.forEach((event) => {
      const dateKey = format(parseISO(event.timeStart), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  // Days of the week header
  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const handleDateClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  return (
    <div className="w-full mx-auto border-1 border-textTertiary">
      {/* Calendar Header */}
      <div className="grid grid-cols-7 border-y-1 border-textTertiary">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-2 text-sm text-textSecondary font-medium text-center border-x-1 border-textTertiary"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate[dateKey] || [];

          const isCurrentMonth = isSameMonth(day, selectedDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <button
              key={dateKey}
              className={`min-h-24 p-1 border-1 relative border-textTertiary flex 
                ${!isCurrentMonth ? "bg-surfaceTertiary" : ""}
                ${isSelected ? "" : ""}
                ${isToday(day) ? "bg-blurEffectGold " : ""}
              `}
              onClick={() => handleDateClick(day)}
            >
              {/* Date Number */}
              <div className="flex items-start justify-between">
                <span
                  className={`
                  text-sm p-1 rounded-full w-7 h-7 flex items-center justify-center
                  ${
                    isSelected
                      ? "bg-themeOrange text-themeWhite border-none"
                      : ""
                  }
                  ${!isCurrentMonth ? "text-textSecondary" : "text-textPrimary"}
                `}
                >
                  {format(day, "d")}
                </span>

                {/* Month indicator for today */}
                {isToday(day) && (
                  <span className="text-xs text-themeOrange mt-1">
                    {"Today"}
                  </span>
                )}

                {/* Month indicator for first day */}
                {day.getDate() === 1 && (
                  <span className="text-xs text-primary-500 mt-1">
                    {format(day, "MMM")}
                  </span>
                )}
              </div>

              {/* Events */}
              <div className="mt-1 space-y-1">
                {dayEvents && dayEvents.length > 0 && (
                  <Popover placement="bottom">
                    <PopoverTrigger>
                      <Button
                        variant="bordered"
                        className="border-themeOrange text-themeOrange ml-2"
                      >
                        <Flag size={20} color="#f16e21" /> Events
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div>
                        <p className="text-textSecondary font-semibold my-3">{`Meeting schedules on ${format(
                          day,
                          "yyyy-MM-dd"
                        )}`}</p>
                        {dayEvents.map((event, eventIndex) => (
                          <>
                            {event.timeStart && (
                              <Button variant="bordered" onClick={() => router.push(event.url)}>
                                {format(event.timeStart, "HH:mm a")}
                              </Button>
                            )}
                          </>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthCalendar;
