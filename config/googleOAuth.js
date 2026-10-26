const crypto = require("crypto");
const { User, Profile } = require("../models");

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKENINFO_URL = "https://www.googleapis.com/oauth2/v1/tokeninfo";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const DEFAULT_SCOPE = "profile email";

function getClientId() {
  return (process.env.GOOGLE_CLIENT_ID || "").trim();
}

function isGoogleOAuthConfigured() {
  return Boolean(getClientId());
}

function getCallbackUrl() {
  return (
    process.env.GOOGLE_CALLBACK_URL ||
    `http://localhost:${process.env.PORT || 3000}/auth/google/callback`
  );
}

function createOAuthState() {
  return crypto.randomBytes(16).toString("hex");
}

function buildImplicitAuthUrl({ state }) {
  const params = new URLSearchParams({
    client_id: getClientId(),
    redirect_uri: getCallbackUrl(),
    response_type: "token",
    scope: DEFAULT_SCOPE,
    include_granted_scopes: "true",
    state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

function tokenBelongsToClient(tokenInfo, clientId) {
  const audiences = [tokenInfo.aud, tokenInfo.audience, tokenInfo.issued_to, tokenInfo.azp]
    .filter(Boolean)
    .flatMap((value) => (Array.isArray(value) ? value : [value]));

  return audiences.includes(clientId);
}

async function verifyAccessToken(accessToken) {
  const response = await fetch(
    `${GOOGLE_TOKENINFO_URL}?access_token=${encodeURIComponent(accessToken)}`
  );

  if (!response.ok) {
    const error = new Error("Token Google tidak valid atau sudah kedaluwarsa.");
    error.statusCode = 401;
    throw error;
  }

  const tokenInfo = await response.json();
  const clientId = getClientId();

  if (!tokenBelongsToClient(tokenInfo, clientId)) {
    const error = new Error("Token Google tidak valid untuk aplikasi ini.");
    error.statusCode = 401;
    throw error;
  }

  return tokenInfo;
}

async function fetchGoogleProfile(accessToken) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = new Error("Gagal mengambil profil Google.");
    error.statusCode = 502;
    throw error;
  }

  return response.json();
}

async function findOrCreateGoogleUser(profile) {
  const email = profile.email;
  const googleId = profile.sub;

  if (!email || !googleId) {
    const error = new Error("Email Google tidak tersedia.");
    error.statusCode = 400;
    throw error;
  }

  let user = await User.findOne({ where: { googleId } });
  if (user) {
    if (user.role === "admin") {
      const error = new Error("Akun admin harus masuk dengan email dan password.");
      error.statusCode = 403;
      throw error;
    }
    return user;
  }

  user = await User.findOne({ where: { email } });
  if (user) {
    if (user.role === "admin") {
      const error = new Error("Akun admin harus masuk dengan email dan password.");
      error.statusCode = 403;
      throw error;
    }
    if (!user.googleId) {
      await user.update({ googleId });
    }
    return user;
  }

  const username = profile.name || email.split("@")[0];
  user = await User.create({
    username,
    email,
    googleId,
    password: null,
    role: "user",
  });

  await Profile.create({
    fullName: profile.name || username,
    UserId: user.id,
  });

  return user;
}

module.exports = {
  getClientId,
  isGoogleOAuthConfigured,
  getCallbackUrl,
  createOAuthState,
  buildImplicitAuthUrl,
  verifyAccessToken,
  fetchGoogleProfile,
  findOrCreateGoogleUser,
};
