import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0D1712",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 4,
          border: "1.5px solid #D4A24C",
        }}
      >
        <svg
          viewBox="0 0 32 32"
          width={24}
          height={24}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 22 C 11 14, 17 8, 23 8 C 23 15, 18 22, 11 22 Z"
            fill="#6B9B57"
          />
          <path
            d="M11 22 C 15 18, 19 14, 23 8"
            stroke="#0D1712"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
            opacity="0.55"
          />
          <circle cx="9" cy="9" r="1.5" fill="#D4A24C" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
