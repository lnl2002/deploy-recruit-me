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

interface ScheduleInterviewModalProps {
  onClose: () => void;
  onSend: (data: any) => void;
  disclosure: DisclosureProp;
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
}) => {
  const zonedDateTime = now(getLocalTimeZone());
  const date = new CalendarDate(
    zonedDateTime.year,
    zonedDateTime.month,
    zonedDateTime.day
  )
  const currentTime = new Time(zonedDateTime.hour, zonedDateTime.minute, zonedDateTime.second);

  const [title, setTitle] = useState("");
  const [interviewers, setInterviewers] = useState("");
  const [interviewDate, setInterviewDate] = useState<ZonedDateTime | CalendarDate | CalendarDateTime>(date);
  const [startTime, setStartTime] = useState<any>(currentTime);
  const [endTime, setEndTime] = useState<any>(currentTime.add({hours: 0.5}));
  const calendarRef = useRef<FullCalendar | null>(null);

  const jsDate = new Date(interviewDate.year, interviewDate.month - 1, interviewDate.day)

  const handleSend = () => {
    const data = {
      title,
      interviewers,
      interviewDate,
      startTime,
      endTime,
    };
    onSend(data);
    onClose();
  };

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

  useEffect(() => {
    if(interviewDate && calendarRef.current){
      const calendarApi = calendarRef?.current?.getApi();
      calendarApi?.gotoDate(new Date(interviewDate.year, interviewDate.month - 1, interviewDate.day))
    }
  }, [interviewDate])

  // useEffect(() => {
  //   if (calendarRef.current && startTime && endTime) {
  //     const calendarApi = calendarRef.current.getApi();
  //     console.log('here');
      
  //     calendarApi.scrollToTime('05:00');
  //   }
  // }, [startTime, endTime])

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
              placeholder="Interview for Digital Marketing Position"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Spacer y={8} />
            {/* <Input
              fullWidth
              label="Interviewers"
              required
              placeholder="@John_doe, @Lily"
              value={interviewers}
              onChange={(e) => setInterviewers(e.target.value)}
            /> */}
            <SelectUser />
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
              ]}
              selectAllow={(selectInfo) => {
                const now = new Date();
                return selectInfo.start >= now;
              }}
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
            <Button className="bg-themeOrange text-[#fff]" radius="full">
              Shortlisting
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ScheduleInterviewModal;
