const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined" && !path.startsWith("/auth")) {
      window.location.href = "/auth/login";
    }
    throw new Error("Not authenticated");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    const error = new Error(err.detail || "Request failed");
    error.status = res.status;
    error.data = err;
    throw error;
  }

  if (res.status === 204) return null;
  return res.json();
}

export const auth = {
  register: (email, password, fullName, deviceFingerprint) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        device_fingerprint: deviceFingerprint,
      }),
    }),
  login: (email, password) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
  me: () => apiFetch("/auth/me"),
  forgotPassword: (email) =>
    apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token, newPassword) =>
    apiFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password: newPassword }),
    }),
};

export const calculator = {
  checkTrial: (deviceFingerprint, platform = "web") =>
    apiFetch("/calculator/check-trial", {
      method: "POST",
      body: JSON.stringify({ device_fingerprint: deviceFingerprint, platform }),
    }),
  recordUse: (data) =>
    apiFetch("/calculator/record-use", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getHistory: () => apiFetch("/calculator/history"),
};

export const subscriptions = {
  createCheckout: (plan) =>
    apiFetch("/subscriptions/create-checkout", {
      method: "POST",
      body: JSON.stringify({ plan }),
    }),
  getStatus: () => apiFetch("/subscriptions/status"),
  openPortal: () => apiFetch("/subscriptions/portal"),
  cancel: () => apiFetch("/subscriptions/cancel", { method: "POST" }),
};

export const ai = {
  chat: (message, conversationHistory = []) =>
    apiFetch("/ai/assistant", {
      method: "POST",
      body: JSON.stringify({
        message,
        conversation_history: conversationHistory,
      }),
    }),
  stackCheck: (peptides) =>
    apiFetch("/ai/stack-check", {
      method: "POST",
      body: JSON.stringify({ peptides }),
    }),
};
