import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#17140f",
          color: "#f5f2ea",
          fontSize: 20,
          fontWeight: 900,
        }}
      >
        K<span style={{ color: "#ff5a1f" }}>Z</span>
      </div>
    ),
    { ...size }
  );
}
