import Image from "next/image";

import { VetraLogo } from "@/components/vetra-logo";

import { AUTH_APP_NAME } from "../constants";

export function LoginMarketingPanel() {
  return (
    <div className="relative hidden min-h-screen w-1/2 overflow-hidden lg:block">
      <Image
        src="/QRCode.jpg"
        alt="Truy xuất nguồn gốc — xu hướng truy xuất và minh bạch chuỗi cung ứng"
        fill
        priority
        sizes="50vw"
        className="object-cover object-center"
      />
      {/* Nhẹ để chữ logo đọc được trên ảnh sáng/tối khác vùng */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/20" />

      <div className="relative z-10 flex min-h-screen w-full flex-col justify-between px-8 py-10 lg:px-12 lg:py-12">
        <div className="flex items-center drop-shadow-md">
          <VetraLogo alt={`${AUTH_APP_NAME} logo`} className="size-10 rounded-sm" priority />
          <h1 className="ml-2 text-2xl font-bold text-white drop-shadow-sm">{AUTH_APP_NAME}</h1>
        </div>

        <p className="text-right text-xs text-white/80 drop-shadow-sm">
          Minh bạch hôm nay — vững bước tương lai
        </p>
      </div>
    </div>
  );
}
