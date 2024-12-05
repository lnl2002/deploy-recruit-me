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
import { today, getLocalTimeZone } from "@internationalized/date";

interface DatePickerProps {
  onSelectDate: (date: Date) => void;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  onSelectDate,
  className = "min-w-[200px]",
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    handleDateSelect(dayjs(new Date()));
  }, []);

  const handleDateSelect = (date: Dayjs) => {
    setIsOpen(false);
    setSelectedDate(date.toDate());

    if (onSelectDate) {
      onSelectDate(date.toDate());
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
            <span className="mr-2">
              {selectedDate ? dayjs(selectedDate).format("DD MMM YYYY") : "Select Date"}
            </span>
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

export default DatePicker;
