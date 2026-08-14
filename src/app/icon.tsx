import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <svg width="32" height="32" viewBox="0 0 32 32">
      <circle
        cx="16"
        cy="16"
        r="15"
        fill="#c3d94a"
        stroke="#8a9e2e"
        strokeWidth="1"
      />
      <path
        d="M 3,16 C 9,6 15,6 16,16 C 17,26 23,26 29,16"
        fill="none"
        stroke="#f7fbe8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>,
    { ...size },
  );
}
