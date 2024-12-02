export function isEmpty(value: any) {
  if (value == null) return true; // null hoặc undefined
  if (typeof value === "string" && value.trim() === "") return true; // Chuỗi rỗng
  if (Array.isArray(value) && value.length === 0) return true; // Mảng rỗng
  if (typeof value === "object" && Object.keys(value).length === 0) return true; // Đối tượng rỗng
  return false;
}
