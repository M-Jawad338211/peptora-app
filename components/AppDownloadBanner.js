"use client";
import { useState } from "react";
import Image from "next/image";

export default function AppDownloadBanner() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(0,214,143,0.08) 0%, rgba(0,240,160,0.04) 100%)",
          border: "1px solid rgba(0,214,143,0.18)",
          borderRadius: "16px",
          maxWidth: "1100px",
          margin: "0 auto 40px",
          padding: "20px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(0,214,143,0.12)",
              border: "1px solid rgba(0,214,143,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              flexShrink: 0,
            }}
          >
            📱
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--tx)",
                marginBottom: "2px",
              }}
            >
              Peptora is now on mobile
            </div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                fontWeight: 300,
                color: "var(--tx2)",
              }}
            >
              Get the app on Android — all your tools, offline-ready.
            </div>
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            fontWeight: 600,
            color: "#021a0e",
            background: "linear-gradient(135deg, #00d68f, #00f0a0)",
            border: "none",
            borderRadius: "10px",
            padding: "10px 24px",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,214,143,0.28)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Download app →
        </button>
      </div>

      {/* Modal overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,16,26,0.80)",
            backdropFilter: "blur(8px)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--navy2, #1e2d42)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "20px",
              padding: "36px 32px",
              maxWidth: "360px",
              width: "100%",
              textAlign: "center",
              position: "relative",
            }}
          >
            <button
              onClick={() => setOpen(false)}
              style={{
                position: "absolute",
                top: "14px",
                right: "16px",
                background: "transparent",
                border: "none",
                color: "var(--tx3)",
                fontSize: "20px",
                cursor: "pointer",
                lineHeight: 1,
              }}
              aria-label="Close"
            >
              ×
            </button>

            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "18px",
                fontWeight: 600,
                color: "var(--tx)",
                marginBottom: "6px",
              }}
            >
              Scan to download
            </div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                fontWeight: 300,
                color: "var(--tx2)",
                marginBottom: "24px",
              }}
            >
              Point your camera at the QR code to get the Peptora app.
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: "14px",
                padding: "16px",
                display: "inline-block",
              }}
            >
              <Image
                src="/App QR Code.png"
                alt="Peptora app QR code"
                width={220}
                height={220}
                style={{ display: "block" }}
              />
            </div>

            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--tx3)",
                marginTop: "18px",
              }}
            >
              Android · APK download
            </div>
          </div>
        </div>
      )}
    </>
  );
}
