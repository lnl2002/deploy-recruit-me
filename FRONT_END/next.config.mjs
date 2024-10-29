/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "i.pinimg.com",
      "st4.depositphotos.com",
      "fpt.edu.vn",
      "youtu.be",
    ], // Thêm domain của hình ảnh vào đây
  },
  reactStrictMode: false, // tránh việc re-render 2 lần sẽ ảnh hưởng tới meetings
};

export default nextConfig;
