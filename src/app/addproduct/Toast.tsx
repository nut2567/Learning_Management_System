"use client";
import { useEffect } from "react";

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose(); // ทำให้ข้อความเลือนหายไปหลัง 3 วินาที
      }, 3000);

      return () => clearTimeout(timer); // ล้าง timer เมื่อ component ถูก unmount หรือเมื่อ show เปลี่ยนค่า
    }
  }, [show, onClose]);

  return (
    <div
      className={`text-red-600 px-4 py-2 rounded-md shadow-lg transition-opacity duration-500 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      {message}
    </div>
  );
};

export default Toast;
