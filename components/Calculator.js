"use client";
import { useState, useEffect } from "react";
import { calculator, auth, subscriptions } from "@/lib/api";
import { generateFingerprint } from "@/lib/fingerprint";

const PEPTIDES = [
  {
    name: "BPC-157",
    category: "Healing",
    halfLife: "~4h",
    typicalDose: "250–500 mcg",
    note: "Subcutaneous or intramuscular",
  },
  {
    name: "TB-500",
    category: "Healing",
    halfLife: "~4–6 days",
    typicalDose: "2–2.5 mg",
    note: "Subcutaneous",
  },
  {
    name: "GHK-Cu",
    category: "Regenerative",
    halfLife: "~3h",
    typicalDose: "1–2 mg",
    note: "Subcutaneous or topical",
  },
  {
    name: "Ipamorelin",
    category: "GH Peptide",
    halfLife: "~2h",
    typicalDose: "200–300 mcg",
    note: "Subcutaneous before sleep",
  },
  {
    name: "CJC-1295 (no DAC)",
    category: "GH Peptide",
    halfLife: "~30 min",
    typicalDose: "100–200 mcg",
    note: "Combine with GHRP",
  },
  {
    name: "CJC-1295 (with DAC)",
    category: "GH Peptide",
    halfLife: "~7–8 days",
    typicalDose: "1–2 mg",
    note: "Once or twice weekly",
  },
  {
    name: "GHRP-2",
    category: "GH Peptide",
    halfLife: "~2h",
    typicalDose: "100–300 mcg",
    note: "Increases ghrelin",
  },
  {
    name: "GHRP-6",
    category: "GH Peptide",
    halfLife: "~2h",
    typicalDose: "100–300 mcg",
    note: "Increases appetite",
  },
  {
    name: "Sermorelin",
    category: "GH Peptide",
    halfLife: "~11 min",
    typicalDose: "200–500 mcg",
    note: "Before sleep",
  },
  {
    name: "Tesamorelin",
    category: "GH Peptide",
    halfLife: "~26 min",
    typicalDose: "1–2 mg",
    note: "FDA approved for HIV lipodystrophy",
  },
  {
    name: "Semaglutide",
    category: "GLP-1",
    halfLife: "~7 days",
    typicalDose: "0.25–2.4 mg",
    note: "Weekly dosing",
  },
  {
    name: "Tirzepatide",
    category: "GLP-1/GIP",
    halfLife: "~5 days",
    typicalDose: "2.5–15 mg",
    note: "Weekly dosing",
  },
  {
    name: "Retatrutide",
    category: "GLP-1/GIP/GCG",
    halfLife: "~6 days",
    typicalDose: "1–12 mg",
    note: "Research compound",
  },
  {
    name: "AOD-9604",
    category: "Fat Loss",
    halfLife: "~30 min",
    typicalDose: "300 mcg",
    note: "Fasting state",
  },
  {
    name: "Semax",
    category: "Nootropic",
    halfLife: "~20 min",
    typicalDose: "400–600 mcg",
    note: "Intranasal or SC",
  },
  {
    name: "Selank",
    category: "Nootropic",
    halfLife: "~2 min",
    typicalDose: "250–500 mcg",
    note: "Intranasal",
  },
  {
    name: "Dihexa",
    category: "Nootropic",
    halfLife: "~days",
    typicalDose: "10–20 mg",
    note: "Oral or transdermal",
  },
  {
    name: "Epitalon",
    category: "Anti-aging",
    halfLife: "~2h",
    typicalDose: "5–10 mg",
    note: "10-day course",
  },
  {
    name: "Thymalin",
    category: "Immune",
    halfLife: "Short",
    typicalDose: "5–10 mg",
    note: "Daily for 10 days",
  },
  {
    name: "Thymosin Alpha-1",
    category: "Immune",
    halfLife: "~2h",
    typicalDose: "1.6 mg",
    note: "Twice weekly",
  },
  {
    name: "MOTS-C",
    category: "Mitochondrial",
    halfLife: "~unknown",
    typicalDose: "5–10 mg",
    note: "Twice weekly",
  },
  {
    name: "SS-31",
    category: "Mitochondrial",
    halfLife: "~unknown",
    typicalDose: "1–5 mg",
    note: "Research compound",
  },
  {
    name: "KPV",
    category: "Anti-inflammatory",
    halfLife: "Short",
    typicalDose: "500 mcg–1 mg",
    note: "Subcutaneous",
  },
  {
    name: "Cerebrolysin",
    category: "Nootropic",
    halfLife: "~unknown",
    typicalDose: "5–10 mL",
    note: "IV or IM protocol",
  },
  {
    name: "MK-677",
    category: "GH Secretagogue",
    halfLife: "~24h",
    typicalDose: "10–25 mg",
    note: "Oral, daily",
  },
  {
    name: "Custom",
    category: "Custom",
    halfLife: "—",
    typicalDose: "—",
    note: "Enter your own values",
  },
];

export default function Calculator() {
  const [fingerprint, setFingerprint] = useState("");
  const [trial, setTrial] = useState(null);
  const [peptide, setPeptide] = useState(PEPTIDES[0]);
  const [vialMg, setVialMg] = useState("");
  const [bacMl, setBacMl] = useState("");
  const [targetMcg, setTargetMcg] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // 'signup' | 'paywall'
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  useEffect(() => {
    generateFingerprint().then((fp) => {
      setFingerprint(fp);
      calculator
        .checkTrial(fp, "web")
        .then(setTrial)
        .catch(() => {});
    });
  }, []);

  const calculate = async () => {
    if (!vialMg || !bacMl || !targetMcg) return;
    setLoading(true);
    try {
      const check = await calculator.checkTrial(fingerprint, "web");
      setTrial(check);
      if (!check.allowed) {
        setModal(check.reason === "anonymous_limit" ? "signup" : "paywall");
        return;
      }

      const vial = parseFloat(vialMg);
      const bac = parseFloat(bacMl);
      const target = parseFloat(targetMcg);
      const concMcgPerMl = (vial * 1000) / bac;
      const drawMl = target / concMcgPerMl;
      const drawUnits = drawMl * 100;
      const dosesPerVial = Math.floor((vial * 1000) / target);

      setResult({ concMcgPerMl, drawMl, drawUnits, dosesPerVial });

      await calculator
        .recordUse({
          device_fingerprint: fingerprint,
          platform: "web",
          peptide_name: peptide.name,
          vial_mg: vial,
          bac_water_ml: bac,
          target_mcg: target,
          result_units: drawUnits,
          result_ml: drawMl,
        })
        .catch(() => {});

      // Refresh trial count
      calculator
        .checkTrial(fingerprint, "web")
        .then(setTrial)
        .catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError("");
    setSignupLoading(true);
    try {
      await auth.register(signupEmail, signupPassword, signupName, fingerprint);
      const check = await calculator.checkTrial(fingerprint, "web");
      setTrial(check);
      setModal(null);
    } catch (err) {
      setSignupError(err.message || "Signup failed");
    } finally {
      setSignupLoading(false);
    }
  };

  const handleCheckout = async (plan) => {
    try {
      const data = await subscriptions.createCheckout(plan);
      window.location.href = data.checkout_url;
    } catch (err) {
      if (err.status === 401) window.location.href = "/auth/signup";
    }
  };

  const fillPct = result ? Math.min((result.drawUnits / 100) * 100, 100) : 0;

  return (
    <div
      style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px 60px" }}
    >
      {/* Trial counter */}
      {trial && (
        <div
          style={{
            background: "var(--navy2)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "10px",
            padding: "12px 18px",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--tx2)",
            }}
          >
            {trial.reason === "pro"
              ? "⭐ Peptora Pro — unlimited calculations"
              : trial.remaining !== null
                ? `${trial.remaining} free use${trial.remaining !== 1 ? "s" : ""} remaining`
                : "Limit reached"}
          </span>
          {trial.reason !== "pro" && (
            <a
              href="/pricing"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--teal)",
                textDecoration: "none",
              }}
            >
              Upgrade →
            </a>
          )}
        </div>
      )}

      {/* Calculator card */}
      <div
        style={{
          background: "var(--navy2)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "20px",
          padding: "32px",
        }}
      >
        {/* Peptide selector */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--tx3)",
              display: "block",
              marginBottom: "8px",
            }}
          >
            PEPTIDE
          </label>
          <select
            value={peptide.name}
            onChange={(e) =>
              setPeptide(PEPTIDES.find((p) => p.name === e.target.value))
            }
            style={{
              width: "100%",
              background: "var(--sl)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "10px",
              padding: "12px 14px",
              color: "var(--tx)",
              fontFamily: "var(--font-sans)",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            {PEPTIDES.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name} — {p.category}
              </option>
            ))}
          </select>
          {peptide.note && (
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--tx3)",
                marginTop: "6px",
              }}
            >
              {peptide.note} · Typical: {peptide.typicalDose} · Half-life:{" "}
              {peptide.halfLife}
            </p>
          )}
        </div>

        {/* Inputs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          {[
            {
              label: "VIAL POTENCY (mg)",
              value: vialMg,
              set: setVialMg,
              placeholder: "e.g. 5",
            },
            {
              label: "BAC WATER (mL)",
              value: bacMl,
              set: setBacMl,
              placeholder: "e.g. 2",
            },
            {
              label: "TARGET DOSE (mcg)",
              value: targetMcg,
              set: setTargetMcg,
              placeholder: "e.g. 250",
            },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label}>
              <label
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--tx3)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                {label}
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                style={{
                  width: "100%",
                  background: "var(--sl)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                  padding: "12px",
                  color: "var(--tx)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "15px",
                }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={calculate}
          disabled={loading || !vialMg || !bacMl || !targetMcg}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #00d68f, #00f0a0)",
            color: "#021a0e",
            fontFamily: "var(--font-sans)",
            fontSize: "16px",
            fontWeight: 600,
            border: "none",
            cursor: loading ? "wait" : "pointer",
            opacity: !vialMg || !bacMl || !targetMcg ? 0.5 : 1,
          }}
        >
          {loading ? "Calculating…" : "Calculate dose"}
        </button>

        {/* Result */}
        {result && (
          <div style={{ marginTop: "28px" }}>
            <div
              style={{
                background: "rgba(0,214,143,0.06)",
                border: "1px solid rgba(0,214,143,0.2)",
                borderRadius: "14px",
                padding: "24px",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--tx3)",
                  marginBottom: "6px",
                }}
              >
                DRAW
              </div>
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "56px",
                  color: "var(--teal)",
                  lineHeight: 1,
                }}
              >
                {result.drawUnits.toFixed(1)}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  color: "var(--tx2)",
                  marginTop: "4px",
                }}
              >
                units on insulin syringe
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              {[
                { label: "Volume", value: `${result.drawMl.toFixed(4)} mL` },
                {
                  label: "Concentration",
                  value: `${result.concMcgPerMl.toFixed(1)} mcg/mL`,
                },
                { label: "Doses per vial", value: result.dosesPerVial },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    background: "var(--sl)",
                    borderRadius: "10px",
                    padding: "14px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--tx3)",
                      marginBottom: "4px",
                    }}
                  >
                    {label.toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "var(--tx)",
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Visual syringe */}
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--tx3)",
                  marginBottom: "8px",
                }}
              >
                SYRINGE FILL LEVEL
              </div>
              <div
                style={{
                  height: "16px",
                  background: "var(--sl)",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${fillPct}%`,
                    borderRadius: "8px",
                    background: "linear-gradient(90deg, #00d68f, #00f0a0)",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--tx3)",
                  marginTop: "4px",
                }}
              >
                {fillPct.toFixed(1)}% of 100-unit syringe
              </div>
            </div>

            {/* Steps */}
            <div
              style={{
                background: "var(--sl)",
                borderRadius: "12px",
                padding: "18px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--tx3)",
                  marginBottom: "12px",
                }}
              >
                RECONSTITUTION STEPS
              </div>
              {[
                `Clean vial top with alcohol swab`,
                `Draw ${result.drawMl >= 1 ? result.drawMl.toFixed(2) + " mL" : (result.drawMl * 1000).toFixed(0) + " μL"} of BAC water into syringe`,
                `Insert needle at angle, slowly inject water down the side of vial`,
                `Gently swirl — do not shake — until fully dissolved`,
                `Draw ${result.drawUnits.toFixed(1)} units from reconstituted vial for your dose`,
              ].map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: i < 4 ? "10px" : 0,
                  }}
                >
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: "rgba(0,214,143,0.15)",
                      border: "1px solid rgba(0,214,143,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--teal)",
                    }}
                  >
                    {i + 1}
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "13.5px",
                      color: "var(--tx2)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--tx3)",
          textAlign: "center",
          marginTop: "20px",
          lineHeight: 1.7,
        }}
      >
        For research and educational purposes only. Not medical advice. Consult
        a licensed healthcare provider.
      </p>

      {/* Signup Modal */}
      {modal === "signup" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "var(--navy2)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "20px",
              padding: "36px",
              maxWidth: "420px",
              width: "100%",
            }}
          >
            <h2
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "26px",
                color: "var(--tx)",
                marginBottom: "8px",
              }}
            >
              Get 20 more free calculations
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                color: "var(--tx2)",
                marginBottom: "24px",
              }}
            >
              Create your free Peptora account — no credit card needed.
            </p>
            <form onSubmit={handleSignup}>
              {[
                {
                  placeholder: "Full name (optional)",
                  value: signupName,
                  set: setSignupName,
                  type: "text",
                },
                {
                  placeholder: "Email address",
                  value: signupEmail,
                  set: setSignupEmail,
                  type: "email",
                },
                {
                  placeholder: "Password (min 8 chars)",
                  value: signupPassword,
                  set: setSignupPassword,
                  type: "password",
                },
              ].map(({ placeholder, value, set, type }) => (
                <input
                  key={placeholder}
                  type={type}
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  required={placeholder !== "Full name (optional)"}
                  style={{
                    width: "100%",
                    marginBottom: "12px",
                    background: "var(--sl)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "10px",
                    padding: "13px",
                    color: "var(--tx)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              ))}
              {signupError && (
                <p
                  style={{
                    color: "var(--red)",
                    fontSize: "13px",
                    marginBottom: "12px",
                  }}
                >
                  {signupError}
                </p>
              )}
              <button
                type="submit"
                disabled={signupLoading}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #00d68f, #00f0a0)",
                  color: "#021a0e",
                  fontFamily: "var(--font-sans)",
                  fontSize: "15px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {signupLoading ? "Creating account…" : "Create free account"}
              </button>
            </form>
            <button
              onClick={() => setModal(null)}
              style={{
                marginTop: "14px",
                width: "100%",
                background: "transparent",
                border: "none",
                color: "var(--tx3)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* Paywall Modal */}
      {modal === "paywall" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "var(--navy2)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "20px",
              padding: "36px",
              maxWidth: "460px",
              width: "100%",
            }}
          >
            <h2
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "26px",
                color: "var(--tx)",
                marginBottom: "8px",
              }}
            >
              Unlock unlimited access
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                color: "var(--tx2)",
                marginBottom: "28px",
              }}
            >
              You&apos;ve used your 25 free calculations. Upgrade to Pro for
              unlimited access.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              {[
                {
                  plan: "monthly",
                  price: "£9.99",
                  period: "/month",
                  badge: null,
                },
                {
                  plan: "annual",
                  price: "£79",
                  period: "/year",
                  badge: "Best value — save 20%",
                },
              ].map(({ plan, price, period, badge }) => (
                <button
                  key={plan}
                  onClick={() => handleCheckout(plan)}
                  style={{
                    background: "var(--sl)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "14px",
                    padding: "20px",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {badge && (
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        color: "var(--gold)",
                        marginBottom: "8px",
                      }}
                    >
                      {badge}
                    </div>
                  )}
                  <div
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: "28px",
                      color: "var(--tx)",
                    }}
                  >
                    {price}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--tx3)",
                    }}
                  >
                    {period}
                  </div>
                </button>
              ))}
            </div>
            <ul style={{ listStyle: "none", padding: 0, marginBottom: "20px" }}>
              {[
                "Unlimited calculations",
                "AI research assistant",
                "Peptide stack checker",
                "Cycle tracker",
                "Protocol finder",
              ].map((f) => (
                <li
                  key={f}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "13.5px",
                    color: "var(--tx2)",
                    padding: "5px 0",
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "var(--teal)" }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setModal(null)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: "var(--tx3)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
