import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
          fontWeight: 900,
          fontFamily: "sans-serif",
        }}
      >
        <span style={{ color: "#ffffff" }}>H</span>
        <span style={{ color: "#FF6B35" }}>H</span>
      </div>
    ),
    { ...size }
  );
}