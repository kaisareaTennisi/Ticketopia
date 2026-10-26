(function (window) {
  const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
  const DEFAULT_SCOPE = "profile email";

  function parseHashParams() {
    const params = {};
    new URLSearchParams(window.location.hash.substring(1)).forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }

  function startLogin(config) {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: "token",
      scope: DEFAULT_SCOPE,
      include_granted_scopes: "true",
      state: config.state,
    });

    window.location.href = `${GOOGLE_AUTH_URL}?${params.toString()}`;
  }

  async function handleCallback() {
    const statusEl = document.getElementById("google-oauth-status");
    const params = parseHashParams();

    if (params.error) {
      if (statusEl) {
        statusEl.textContent = "Login Google dibatalkan.";
      }
      window.setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
      return;
    }

    const accessToken = params.access_token;
    const state = params.state;

    if (!accessToken || !state) {
      if (statusEl) {
        statusEl.textContent = "Respons Google tidak lengkap.";
      }
      window.setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
      return;
    }

    try {
      const response = await fetch("/auth/google/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          access_token: accessToken,
          state,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login Google gagal.");
      }

      window.location.replace(data.redirectTo || "/user/my-orders");
    } catch (err) {
      if (statusEl) {
        statusEl.textContent = err.message || "Login Google gagal.";
      }
      window.setTimeout(() => {
        window.location.href = "/login";
      }, 1800);
    }
  }

  window.GoogleOAuth = {
    startLogin,
    handleCallback,
  };
})(window);
