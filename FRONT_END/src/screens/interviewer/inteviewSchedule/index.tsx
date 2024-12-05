import meetingApi, { IMeeting } from "@/api/meetingApi";
import { Input, Select, SelectItem, user } from "@nextui-org/react";
import { Search, View } from "lucide-react";
import { useEffect, useState } from "react";
import CalendarTimeline from "./component/weeklyCalendar";
import WeekSelector from "./component/weekSelector";
import MonthCalendar from "./component/monthlyCalendar";
import { format } from "date-fns";
import DatePicker from "./component/datePicker";
import { useAppSelector } from "@/store/store";

const ViewMode = {
  monthly: "monthly",
  weekly: "weekly",
};

const getMonthRange = (date: Date) => {
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { startDate, endDate };
};

export const InterviewScheduleInterviewer: React.FC<{}> = () => {
  const getCurrentMonthRange = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startDate, endDate };
  };
  const [interviewRoom, setInterViewRoom] = useState<IMeeting[]>([]);
  const [viewMode, setViewMode] = useState<string>(ViewMode.weekly);
  const [title, setTitle] = useState<string>("Current week");
  const [selectDate, setSelectDate] = useState<Date>(new Date());
  const { userInfo, isLoggedIn } = useAppSelector((state) => state.user);
  const [selectDateRange, setSelectDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>(getCurrentMonthRange());

  useEffect(() => {
    getSchedules();
  }, []);

  useEffect(() => {
    getSchedules();
  }, [selectDateRange]);

  const getSchedules = async () => {
    const result: IMeeting[] = [];

    const data = await meetingApi.getScheduleById({
      interviewerId: userInfo?._id ?? "",
      endTime: selectDateRange?.endDate.toISOString(),
      startTime: selectDateRange?.startDate.toISOString(),
    });

    if (data) {
      result.push(
        ...data.map((d) => {
          return {
            ...d,
            participantId: userInfo?._id,
          };
        })
      );
    }
    setInterViewRoom(result);
  };

  const handeChangeViewMode = (viewMode: string) => {
    setViewMode(viewMode);
  };

  return (
    <div className="flex justify-center">
      <div className="w-[80vw] mt-10">
        <h1 className="text-textPrimary text-4xl font-bold">
          Interview Schedule
        </h1>
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
                  setTitle(dateRange.toString);
                  setSelectDate(dateRange.startDate);
                  setSelectDateRange(dateRange);
                }}
              />
            )}
            {viewMode == ViewMode.monthly && (
              <DatePicker
                onSelectDate={(date) => {
                  setTitle(format(date, "yyyy-MM"));
                  const { startDate, endDate } = getMonthRange(date);
                  setSelectDate(date);
                  setSelectDateRange({ startDate, endDate });
                }}
              />
            )}
          </div>
        </div>

        <div className="mt-10">
          {viewMode == ViewMode.weekly && (
            <CalendarTimeline
              events={interviewRoom}
              selectedWeek={selectDate}
            />
          )}
          {viewMode == ViewMode.monthly && (
            <MonthCalendar
              events={interviewRoom}
              onDateSelect={(date) => setSelectDate(date)}
              selectedDate={selectDate}
            />
          )}
        </div>
      </div>
    </div>
  );
};
