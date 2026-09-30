import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "rgb(252,250,246)",
          color: "rgb(58,45,38)",
          borderRadius: 96,
          fontSize: 220,
          fontWeight: 700,
          border: "24px solid rgb(58,45,38)",
          letterSpacing: "-0.12em",
        }}
      >
        BT
      </div>
    ),
    size,
  );
}
