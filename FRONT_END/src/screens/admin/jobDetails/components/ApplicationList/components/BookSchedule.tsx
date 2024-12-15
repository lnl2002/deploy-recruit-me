// components/ScheduleInterviewModal.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Button,
  Input,
  Spacer,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalContent,
  DatePicker,
  TimeInput,
} from "@nextui-org/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import SelectUser from "./SelectUser";
import { now, getLocalTimeZone, CalendarDate, ZonedDateTime, CalendarDateTime, Time } from "@internationalized/date";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import meetingApi, { IMeeting } from "@/api/meetingApi";
import { toast } from "react-toastify";
import applyApi from "@/api/applyApi";
import systemApi from "@/api/systemApi";

interface ScheduleInterviewModalProps {
  onClose: () => void;
  onSend: (data: any) => void;
  disclosure: DisclosureProp;
  cv: any
  changeStatus?: ({ status }: { status: string; }) => void
  applyId: string
}

type DisclosureProp = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onOpenChange: () => void;
  isControlled: boolean;
  getButtonProps: (props?: unknown) => unknown;
  getDisclosureProps: (props?: unknown) => unknown;
};

const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  onClose,
  onSend,
  disclosure,
  cv,
  changeStatus,
  applyId
}) => {
  const zonedDateTime = now(getLocalTimeZone());
  const date = new CalendarDate(
    zonedDateTime.year,
    zonedDateTime.month,
    zonedDateTime.day
  )
  const currentTime = new Time(zonedDateTime.hour, zonedDateTime.minute, zonedDateTime.second);

  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [interviewDate, setInterviewDate] = useState<ZonedDateTime | CalendarDate | CalendarDateTime>(date);
  const [startTime, setStartTime] = useState<any>(currentTime);
  const [endTime, setEndTime] = useState<any>(currentTime.add({hours: 0.5}));
  const [participantSchedules, setParticipantSchedules] = useState<any[]>([]);
  const calendarRef = useRef<FullCalendar | null>(null);

  const jobInfo = useSelector((state: RootState) => state.job.job);

  const jsDate = new Date(interviewDate.year, interviewDate.month - 1, interviewDate.day)

  const handleSend = async () => {
    const timeStart = new Date(interviewDate.year, interviewDate.month - 1, interviewDate.day, startTime.hour, startTime.minute, 0 );
    const timeEnd = new Date(interviewDate.year, interviewDate.month - 1, interviewDate.day, endTime.hour, endTime.minute, 0 );

    setIsLoading(true);
    const data = await meetingApi.createSchedule({
      participantIds: participants,
      timeEnd: timeEnd.toISOString(),
      timeStart: timeStart.toISOString(),
      title,
      applyId
    })
    participants.forEach(p=> {
      systemApi.createNotification({
        content: "You have new meeting schedule. Don't miss it!",
        receiver: p ?? "",
        url: "/job-details?id=" + jobInfo?._id,
      });
    })
    setIsLoading(false);

    applyApi.updateApplyStatus({
      applyId: applyId,
      newStatus: 'Pending Interview Confirmation'
    })
    
    if(!data){
      toast.error('Something went wrong. Please try again');
      return
    } else if(data?.isError){
      toast.error(data?.message || 'Something went wrong. Please try again');
      return
    }
    changeStatus?.({status: 'Pending Interview Confirmation'})
    toast.success('Created successfully')
    getSchedules()
    onClose()
  };
  console.log("applyId", applyId);
  

  const handleChangeDate = (date: ZonedDateTime | CalendarDate | CalendarDateTime) => {
    setInterviewDate(date)
  }
  const handleChangeTime = (time: any,type: string) => {
    if(type === 'start'){
      setStartTime(time)
    } else if(type === 'end'){
      setEndTime(time)
    }
  }

  const getSchedules = async () => {
    const result: IMeeting[] = [];
    for(const participantId of participants){
      const date = (new Date(interviewDate.year, interviewDate.month - 1, interviewDate.day)).toISOString();

      const data = await meetingApi.getScheduleById({
        interviewerId: participantId,
        endTime: date,
        startTime: date
      })

      if (data) {
          result.push(...data.map(d => {
            return {
              ...d,
              participantId: participantId
            }
          }));
      }
    }
    setParticipantSchedules(result);
  }

  useEffect(() => {
    if(interviewDate && calendarRef.current){
      const calendarApi = calendarRef?.current?.getApi();
      calendarApi?.gotoDate(new Date(interviewDate.year, interviewDate.month - 1, interviewDate.day))
    }
  }, [interviewDate])
  
  useEffect(() => {
    if(interviewDate && participants.length > 0){
      getSchedules()
    }
  }, [participants, interviewDate])
  

  return (
    <Modal
      isOpen={disclosure.isOpen}
      onClose={() => disclosure.onClose()}
      onOpenChange={disclosure.onOpenChange}
      placement="top-center"
      size="5xl"
    >
      <ModalContent className="text-themeDark">
        <ModalHeader>
          <div>
            <h3>Schedule an Interview Time</h3>
            <div className="font-light text-[13px] opacity-70">
              Please provide details about the interview
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="grid grid-cols-3 gap-6">
          {/* Left Side Form */}
          <div className="col-span-2">
            <Input
              fullWidth
              label="Title"
              required
              placeholder={`Interview for ${jobInfo?.title}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Spacer y={8} />
            {/* <Input
              fullWidth
              label="participants"
              required
              placeholder="@John_doe, @Lily"
              value={participants}
              onChange={(e) => setInterviewers(e.target.value)}
            /> */}
            <SelectUser 
              users={[{
                ...cv,
                _id: cv.candidateId
              }, jobInfo?.interviewManager]}
              setParticipants={setParticipants}
              />
            <Spacer y={8} />
            <DatePicker
              fullWidth
              label="Interview Date"
              defaultValue={date}
              granularity="day"
              minValue={date}
              value={interviewDate}
              onChange={handleChangeDate}
            />
            <Spacer y={8} />
            <div className="flex gap-2">
              <TimeInput
                label="Start Time"
                minValue={startTime}
                value={(startTime as any)}
                onChange={(time) => handleChangeTime(time, 'start')}
              />
              <TimeInput
                label="End Time"
                minValue={startTime}
                value={(endTime as any)}
                onChange={(time) => handleChangeTime(time, 'end')}
              />
            </div>
          </div>

          {/* Right Side Calendar */}
          <div className="col-span-1 max-h-[40vh] overflow-y-scroll">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridDay"
              initialDate={jsDate}
              scrollTime={"22:00:00"}
              headerToolbar={{
                left: "prev",
                center: "title",
                right: "next",
              }}
              events={[
                {
                  title: `${title}`,
                  start: `${interviewDate}T${startTime}`,
                  end: `${interviewDate}T${endTime}`,
                  color: "#48c570",
                },
                ...participantSchedules.map((schedule) => {
                  return {
                    title: `This time slot is already occupied`,
                    start: `${schedule.timeStart}`,
                    end: `${schedule.timeEnd}`,
                    color: "#ea5e63",
                    textColor: "#000",
                    className: "text-[12px]"
                  }
                })
              ]}
              selectAllow={(selectInfo) => {
                const now = new Date();
                return selectInfo.start >= now;
              }}
              selectable={true}
              editable={true}
              height="auto"
            />
          </div>
        </ModalBody>
        <ModalFooter className="w-full">
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button
              className="border-1 border-themeOrange bg-opacity-0 text-themeOrange"
              radius="full"
              onClick={() => disclosure.onClose()}
            >
              Cancel
            </Button>
            <Button className="bg-themeOrange text-[#fff]" radius="full" onClick={handleSend} isLoading={isLoading}>
              Create Schedule
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ScheduleInterviewModal;
