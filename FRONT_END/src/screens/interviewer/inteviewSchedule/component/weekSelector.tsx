// WeekSelector.tsx
import React, { useEffect, useState } from "react";
import {
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/en"; // Ensure dayjs uses the correct locale
import { CalendarIcon } from "lucide-react";
import {today, getLocalTimeZone} from "@internationalized/date";

interface Week {
  startDate: Date;
  endDate: Date;
  toString: string
}

interface WeekSelectorProps {
  onSelectWeek: (week: Week) => void;
  className?: "min-w-[200px]";
}

const WeekSelector: React.FC<WeekSelectorProps> = ({
  onSelectWeek,
  className,
}) => {
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    handleDateSelect(dayjs(new Date()));
  }, []);

  const handleDateSelect = (date: Dayjs) => {
    setIsOpen(false);
    const startOfWeek = dayjs(date).startOf("week").add(1, "day"); // Adjust to start on Monday
    const endOfWeek = dayjs(date).endOf("week").add(1, "day");
    setSelectedWeek(
      `${startOfWeek.format("DDMMM")} - ${endOfWeek.format("DDMMM")} ${startOfWeek.year()}`
    );
    setCalendarVisible(false);

    if (onSelectWeek) {
      onSelectWeek({
        toString: `${startOfWeek.format("DDMMM")} - ${endOfWeek.format("DDMMM")} ${startOfWeek.year()}`,
        startDate: startOfWeek.toDate(),
        endDate: endOfWeek.toDate(),
      });
    }
  };

  return (
    <div>
      <Popover placement="bottom" isOpen={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <Button
            className={`${className} flex items-center justify-between px-4`}
            variant="bordered"
          >
            <span className="mr-2">{`${selectedWeek}`}</span>
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <Calendar
            defaultValue={today(getLocalTimeZone())}
            onChange={(date) => handleDateSelect(dayjs(date))}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default WeekSelector;
