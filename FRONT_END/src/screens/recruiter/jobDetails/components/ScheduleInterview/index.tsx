import meetingApi, { IMeeting } from "@/api/meetingApi";
import { Input, Select, SelectItem } from "@nextui-org/react";
import { Search, View } from "lucide-react";
import { useEffect, useState } from "react";
import CalendarTimeline from "./component/weeklyCalendar";
import WeekSelector from "./component/weekSelector";
import MonthCalendar from "./component/monthlyCalendar";
import { format } from "date-fns";
import DatePicker from "./component/datePicker";

const ViewMode = {
  monthly: "monthly",
  weekly: "weekly",
};

export const ScheduleInterview: React.FC<{ jobId: string }> = ({
  jobId,
}: {
  jobId: string;
}) => {
  const [interviewRoom, setInterViewRoom] = useState<IMeeting[]>([]);
  const [viewMode, setViewMode] = useState<string>(ViewMode.weekly);
  const [title, setTitle] = useState<string>("Current week");
  const [selectDate, setSelectDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchInterviewMeetingRoom();
  }, []);

  const fetchInterviewMeetingRoom = async () => {
    const rooms = await meetingApi.getAllMeetingRoomsByJobId(jobId);
    setInterViewRoom(rooms.data);
  };

  const handeChangeViewMode = (viewMode: string) => {
    setViewMode(viewMode);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          {/* <Input
            type="text"
            placeholder="Find a candidate"
            className="min-w-[300px]"
            startContent={<Search className="text-themeDark" />}
          /> */}
          <p className="text-xl text-textSecondary font-semibold">{`Events in ${title}`}</p>
        </div>
        <div className="flex gap-2 text-themeDark">
          <Select
            defaultSelectedKeys={[ViewMode.weekly]}
            className="min-w-[250px]"
            onChange={(e) => handeChangeViewMode(e.target.value)}
          >
            <SelectItem
              key={ViewMode.weekly}
              value={ViewMode.weekly}
              className="text-themeDark"
            >
              View by Week
            </SelectItem>
            <SelectItem
              key={ViewMode.monthly}
              value={ViewMode.monthly}
              className="text-themeDark"
            >
              View by month
            </SelectItem>
          </Select>
          {viewMode == ViewMode.weekly && (
            <WeekSelector
              onSelectWeek={(dateRange) => {
                console.log(dateRange.startDate + "===" + dateRange.endDate);
                setTitle(dateRange.toString);
                setSelectDate(dateRange.startDate);
              }}
            />
          )}
          {viewMode == ViewMode.monthly && (
            <DatePicker
              onSelectDate={(date) => {
                setTitle(format(date, "yyyy-MM"));
                setSelectDate(date);
              }}
            />
          )}
        </div>
      </div>

      <div className="mt-10">
        {viewMode == ViewMode.weekly && (
          <CalendarTimeline events={interviewRoom} selectedWeek={selectDate} />
        )}
        {viewMode == ViewMode.monthly && (
          <MonthCalendar events={interviewRoom} onDateSelect={(date) => setSelectDate(date)} selectedDate={selectDate} />
        )}
      </div>
    </div>
  );
};
