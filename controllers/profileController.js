const { User, Profile } = require("../models");

const GENDERS = ["male", "female", "other"];

async function getUserWithProfile(userId) {
  const user = await User.findByPk(userId, { include: [Profile] });
  if (!user) return null;

  if (!user.Profile) {
    user.Profile = await Profile.create({
      fullName: user.username,
      UserId: user.id,
    });
  }

  return user;
}

async function showProfile(req, res) {
  const user = await getUserWithProfile(req.session.user.id);
  if (!user) {
    req.flash("error", "Akun tidak ditemukan.");
    return res.redirect("/login");
  }

  res.render("user/profile", {
    title: "Profil Saya",
    user,
    profile: user.Profile,
    genders: GENDERS,
  });
}

async function updateProfile(req, res) {
  const user = await getUserWithProfile(req.session.user.id);
  if (!user) {
    req.flash("error", "Akun tidak ditemukan.");
    return res.redirect("/login");
  }

  const { fullName, address, phoneNumber, birthDate, gender } = req.body;

  if (!fullName || !fullName.trim()) {
    req.flash("error", "Nama lengkap wajib diisi.");
    return res.redirect("/user/profile");
  }

  const normalizedGender = gender && GENDERS.includes(gender) ? gender : null;
  const normalizedBirthDate = birthDate && birthDate.trim() ? birthDate : null;

  await user.Profile.update({
    fullName: fullName.trim(),
    address: address?.trim() || null,
    phoneNumber: phoneNumber?.trim() || null,
    birthDate: normalizedBirthDate,
    gender: normalizedGender,
  });

  req.flash("success", "Profil berhasil diperbarui.");
  return res.redirect("/user/profile");
}

module.exports = { showProfile, updateProfile };
