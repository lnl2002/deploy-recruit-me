export function formatDateTime(isoString: string): string {
    const date = new Date(isoString)

    const day = date.getDate().toString().padStart(2, '0') // Lấy ngày (dd)
    const month = (date.getMonth() + 1).toString().padStart(2, '0') // Lấy tháng (mm)
    const year = date.getFullYear() // Lấy năm (yyyy)

    const hours = date.getHours().toString().padStart(2, '0') // Lấy giờ (hh)
    const minutes = date.getMinutes().toString().padStart(2, '0') // Lấy phút (mm)

    return `${day}-${month}-${year} ${hours}:${minutes}`
}

export const truncateToMinutes = (date: Date) => {
    const truncated = new Date(date);
    truncated.setSeconds(0, 0); // Reset seconds and milliseconds to zero
    return truncated;
};
