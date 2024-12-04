import { JobStatus } from "@/api/jobApi";

export const getStatusJob = (
  startDate: Date,
  endDate: Date,
  currentStatus: string
): string => {
  const today = new Date();
  today.setHours(0);
  today.setSeconds(0);
  today.setMinutes(0);

  // Check if today's date is after the end date
  if (today > endDate && JobStatus.APPROVED === currentStatus) {
    return "expired";
  }

  // Check if today's date is within the range and the status is "Approved"
  if (
    currentStatus === JobStatus.APPROVED &&
    today >= startDate &&
    today <= endDate
  ) {
    return "published";
  }

  // Return the original status if no other conditions are met
  return currentStatus;
};
