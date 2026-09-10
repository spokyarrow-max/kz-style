import { ImageResponse } from "next/og";

export const alt = "KZ Style — Polski Premium Streetwear";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SIGNAL = "#ff5a1f";
const STONE_950 = "#17140f";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: STONE_950,
        }}
      >
        <div
          style={{
            display: "flex",
            height: 18,
            width: "100%",
            backgroundImage: `repeating-linear-gradient(-45deg, ${SIGNAL} 0 22px, ${STONE_950} 22px 44px)`,
          }}
        />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", fontSize: 128, fontWeight: 900, color: "#f5f2ea" }}>
            KZ<span style={{ color: SIGNAL }}>.</span>Style
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 32,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#a39c8c",
            }}
          >
            Polski Premium Streetwear
          </div>
        </div>
        <div
          style={{
            display: "flex",
            height: 18,
            width: "100%",
            backgroundImage: `repeating-linear-gradient(-45deg, ${SIGNAL} 0 22px, ${STONE_950} 22px 44px)`,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
