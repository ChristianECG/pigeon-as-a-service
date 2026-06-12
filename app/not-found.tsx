export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          background: "#0a0a0a",
          color: "#ededed",
          fontFamily: "monospace",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "1rem",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <p style={{ fontSize: "5rem", color: "#1f1f1f", margin: 0 }}>404</p>
        <h1 style={{ color: "#ef4444", margin: 0 }}>NXPIGEON</h1>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", maxWidth: 360 }}>
          The carrier arrived but no datagram was found.
        </p>
        <a href="/" style={{ color: "#c8a97e", fontSize: "0.875rem" }}>
          Return to home loft →
        </a>
      </body>
    </html>
  );
}
