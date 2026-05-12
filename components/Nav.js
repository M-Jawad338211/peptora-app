"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function NavLogo() {
  return (
    <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
      <div style={{
        width: "34px", height: "34px", borderRadius: "9px",
        background: "rgba(0,214,143,0.10)", border: "1px solid rgba(0,214,143,0.22)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
      }}>🧬</div>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: "17px", fontWeight: 600, color: "var(--tx)", letterSpacing: "-0.2px" }}>
        Peptora<em style={{ color: "var(--teal)", fontStyle: "normal" }}>.io</em>
      </span>
    </Link>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const links = [
    { href: "/calculator", label: "Calculator", icon: "⚗️" },
    { href: "/encyclopedia", label: "Encyclopedia", icon: "📖" },
    { href: "/stack-checker", label: "Stack Checker", icon: "🔬" },
    { href: "/cycle-tracker", label: "Cycle Tracker", icon: "📊" },
    { href: "/vendors", label: "Vendors", icon: "🛡️" },
    { href: "/regulations", label: "Regulations", icon: "⚖️" },
  ];

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push("/");
  };

  return (
    <>
      <nav style={{
        height: "62px", display: "flex", alignItems: "center",
        background: "rgba(26,37,53,0.97)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.09)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{
          width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "0 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
        }}>
          <NavLogo />

          {/* Desktop nav links */}
          <div className="nav-desktop-links">
            {links.map((link) => (
              <Link key={link.href} href={link.href} style={{
                fontFamily: "var(--font-mono)", fontSize: "12px",
                color: pathname === link.href ? "var(--teal)" : "var(--tx2)",
                textDecoration: "none", padding: "6px 12px", borderRadius: "7px",
                background: pathname === link.href ? "rgba(0,214,143,0.10)" : "transparent",
                transition: "all 0.15s",
              }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth buttons */}
          <div className="nav-desktop-auth" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {!loading && user ? (
              <>
                <Link href="/dashboard" style={{
                  fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--tx2)",
                  textDecoration: "none", padding: "7px 16px",
                  border: "1px solid rgba(255,255,255,0.14)", borderRadius: "8px",
                }}>
                  {user.plan === "pro" ? "⭐ Pro" : user.email.split("@")[0]}
                </Link>
                <button onClick={handleLogout} style={{
                  fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--tx3)",
                  background: "transparent", border: "none", cursor: "pointer", padding: "7px 10px",
                }}>
                  Log out
                </button>
              </>
            ) : !loading ? (
              <>
                <Link href="/auth/login" style={{
                  fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--tx2)",
                  textDecoration: "none", padding: "7px 16px",
                  border: "1px solid rgba(255,255,255,0.14)", borderRadius: "8px",
                }}>
                  Log in
                </Link>
                <Link href="/auth/signup" style={{
                  fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: 600,
                  color: "#021a0e", background: "linear-gradient(135deg, #00d68f, #00f0a0)",
                  textDecoration: "none", padding: "8px 18px", borderRadius: "8px",
                  boxShadow: "0 4px 14px rgba(0,214,143,0.25)",
                }}>
                  Get started
                </Link>
              </>
            ) : null}
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              padding: "6px", color: "var(--tx2)", display: "none",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="5" width="18" height="2" rx="1" fill="currentColor" />
              <rect x="2" y="10" width="18" height="2" rx="1" fill="currentColor" />
              <rect x="2" y="15" width="18" height="2" rx="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Overlay */}
      {menuOpen && (
        <div
          onClick={closeMenu}
          style={{
            position: "fixed", inset: 0, zIndex: 90,
            background: "rgba(10,16,26,0.60)", backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* Side drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 100,
        width: "280px",
        background: "rgba(26,37,53,0.98)", backdropFilter: "blur(20px)",
        borderLeft: "1px solid rgba(255,255,255,0.09)",
        transform: menuOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.26s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
        padding: "0",
        overflowY: "auto",
      }}>
        {/* Drawer header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <NavLogo />
          <button
            onClick={closeMenu}
            aria-label="Close menu"
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "var(--tx3)", padding: "4px", lineHeight: 1,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <div style={{ padding: "12px 12px 0", flex: 1 }}>
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} onClick={closeMenu} style={{
                display: "flex", alignItems: "center", gap: "12px",
                textDecoration: "none", padding: "11px 12px", borderRadius: "10px",
                marginBottom: "2px",
                background: active ? "rgba(0,214,143,0.10)" : "transparent",
                transition: "background 0.15s",
              }}>
                <span style={{ fontSize: "16px", lineHeight: 1 }}>{link.icon}</span>
                <span style={{
                  fontFamily: "var(--font-sans)", fontSize: "15px", fontWeight: 500,
                  color: active ? "var(--teal)" : "var(--tx2)",
                }}>
                  {link.label}
                </span>
                {active && (
                  <span style={{
                    marginLeft: "auto", width: "6px", height: "6px", borderRadius: "50%",
                    background: "var(--teal)", boxShadow: "0 0 6px var(--teal)",
                  }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Drawer auth section */}
        <div style={{
          padding: "16px 12px 20px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          marginTop: "12px",
        }}>
          {!loading && user ? (
            <>
              <Link href="/dashboard" style={{
                display: "flex", alignItems: "center", gap: "10px",
                textDecoration: "none", padding: "11px 12px", borderRadius: "10px",
                background: "rgba(255,255,255,0.04)",
                marginBottom: "8px",
              }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: "rgba(0,214,143,0.12)", border: "1px solid rgba(0,214,143,0.20)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--teal)",
                }}>
                  {user.plan === "pro" ? "⭐" : user.email[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: 600, color: "var(--tx)" }}>
                    {user.plan === "pro" ? "Pro account" : user.email.split("@")[0]}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--tx3)" }}>
                    {user.plan === "pro" ? user.email.split("@")[0] : "Free plan"}
                  </div>
                </div>
              </Link>
              <button onClick={handleLogout} style={{
                width: "100%", padding: "11px", borderRadius: "10px",
                background: "transparent", border: "1px solid rgba(255,255,255,0.09)",
                fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: 500,
                color: "var(--tx3)", cursor: "pointer", textAlign: "center",
              }}>
                Log out
              </button>
            </>
          ) : !loading ? (
            <>
              <Link href="/auth/login" style={{
                display: "block", textAlign: "center", padding: "12px",
                borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)",
                fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: 500,
                color: "var(--tx2)", textDecoration: "none", marginBottom: "8px",
              }}>
                Log in
              </Link>
              <Link href="/auth/signup" style={{
                display: "block", textAlign: "center", padding: "12px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #00d68f, #00f0a0)",
                fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: 600,
                color: "#021a0e", textDecoration: "none",
                boxShadow: "0 4px 14px rgba(0,214,143,0.25)",
              }}>
                Get started
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
