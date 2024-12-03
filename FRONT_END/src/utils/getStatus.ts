export const getStatusJob = (
  startDate: Date,
  endDate: Date,
  currentStatus: string
): string => {
  const today = new Date();

  // Check if today's date is after the end date
  if (today > endDate) {
    return "expired";
  }

  // Check if today's date is within the range and the status is "Approved"
  if (currentStatus === "approved" && today >= startDate && today <= endDate) {
    return "published";
  }

  // Return the original status if no other conditions are met
  return currentStatus;
};
