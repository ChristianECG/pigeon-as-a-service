import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") ?? "Loft";
  const subtitle =
    searchParams.get("subtitle") ??
    "A Standard for the Transmission of IP Datagrams on Avian Carriers";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0d0d0f",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          position: "relative",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "#8b5cf6",
          }}
        />

        {/* Main content — pushed to bottom */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              color: "#3f3f46",
              fontSize: "13px",
              marginBottom: "20px",
              fontFamily: "monospace",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            April 1, 1990 · RFC 1149
          </div>

          <div
            style={{
              color: "#ededef",
              fontSize: "68px",
              fontWeight: "bold",
              lineHeight: 1,
              marginBottom: "20px",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>

          <div
            style={{
              color: "#8b5cf6",
              fontSize: "22px",
              maxWidth: "820px",
              lineHeight: 1.45,
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Footer divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "52px",
            paddingTop: "28px",
            borderTop: "1px solid #27272a",
          }}
        >
          <div
            style={{
              color: "#27272a",
              fontSize: "12px",
              fontFamily: "monospace",
            }}
          >
            draft-cruzgonzalez-ipoac-dns
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#52525b",
              fontSize: "14px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#8b5cf6",
              }}
            />
            Loft
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
