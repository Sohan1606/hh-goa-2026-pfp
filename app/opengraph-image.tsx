import { ImageResponse } from "next/og";

export const alt = "HH Goa 2026 PFP Generator — Build your HH Goa identity";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            height: 800,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 60%)",
          }}
        />

        {/* HH mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 96,
            fontWeight: 900,
            marginBottom: 24,
            zIndex: 1,
          }}
        >
          <span style={{ color: "#ffffff" }}>H</span>
          <span style={{ color: "#FF6B35" }}>H</span>
        </div>

        {/* Main heading */}
        <div
          style={{
            fontSize: 78,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: -2,
            zIndex: 1,
            display: "flex",
            gap: 16,
          }}
        >
          <span>HACKER HOUSE</span>
          <span style={{ color: "#FF6B35" }}>GOA</span>
        </div>

        {/* Year divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 12,
            zIndex: 1,
          }}
        >
          <div style={{ width: 60, height: 1, background: "#3f3f46" }} />
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#71717a",
              letterSpacing: 8,
            }}
          >
            2026
          </span>
          <div style={{ width: 60, height: 1, background: "#3f3f46" }} />
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "#a1a1aa",
            marginTop: 40,
            fontWeight: 500,
            zIndex: 1,
          }}
        >
          Build your HH Goa identity.
        </div>

        {/* Bottom badge */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            gap: 12,
            zIndex: 1,
          }}
        >
          <div
            style={{
              padding: "8px 20px",
              borderRadius: 999,
              background: "rgba(255,107,53,0.1)",
              border: "1px solid rgba(255,107,53,0.3)",
              color: "#FF8C42",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            #FrameGoa
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}