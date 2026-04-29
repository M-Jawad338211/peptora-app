"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function ProGate({ feature, children }) {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "300px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--tx3)",
          }}
        >
          Loading…
        </span>
      </div>
    );

  if (!user)
    return (
      <div
        style={{
          maxWidth: "480px",
          margin: "80px auto",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "20px" }}>🔒</div>
        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "26px",
            color: "var(--tx)",
            fontWeight: 400,
            marginBottom: "10px",
          }}
        >
          Sign in to access {feature}
        </h2>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            color: "var(--tx2)",
            marginBottom: "28px",
          }}
        >
          Create a free account to get started.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Link
            href="/auth/signup"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
              fontWeight: 600,
              color: "#021a0e",
              background: "linear-gradient(135deg, #00d68f, #00f0a0)",
              textDecoration: "none",
              padding: "12px 28px",
              borderRadius: "10px",
            }}
          >
            Create free account
          </Link>
          <Link
            href="/auth/login"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
              color: "var(--tx2)",
              background: "var(--sl)",
              border: "1px solid rgba(255,255,255,0.12)",
              textDecoration: "none",
              padding: "12px 28px",
              borderRadius: "10px",
            }}
          >
            Log in
          </Link>
        </div>
      </div>
    );

  if (user.plan !== "pro")
    return (
      <div
        style={{
          maxWidth: "480px",
          margin: "80px auto",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "20px" }}>⭐</div>
        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "26px",
            color: "var(--tx)",
            fontWeight: 400,
            marginBottom: "10px",
          }}
        >
          {feature} is a Pro feature
        </h2>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            color: "var(--tx2)",
            marginBottom: "28px",
          }}
        >
          Upgrade to Peptora Pro to unlock unlimited access to all AI-powered
          tools.
        </p>
        <Link
          href="/pricing"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "15px",
            fontWeight: 600,
            color: "#021a0e",
            background: "linear-gradient(135deg, #00d68f, #00f0a0)",
            textDecoration: "none",
            padding: "13px 32px",
            borderRadius: "11px",
            display: "inline-block",
          }}
        >
          View Pro plans →
        </Link>
      </div>
    );

  return children;
}
