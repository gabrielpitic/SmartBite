
"use client";

import { useState } from "react";
import type { Restaurant } from "@prisma/client";

interface Props {
  restaurant: Restaurant;
  adminEmail: string;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export default function SettingsForm({ restaurant, adminEmail }: Props) {
  const [nameEn, setNameEn] = useState(restaurant.nameEn);
  const [nameRo, setNameRo] = useState(restaurant.nameRo);
  const [restaurantState, setRestaurantState] = useState<SaveState>("idle");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordState, setPasswordState] = useState<SaveState>("idle");
  const [passwordError, setPasswordError] = useState("");

  const inputClass =
    "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all";
  const labelClass =
    "text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block";

  const handleRestaurantSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setRestaurantState("saving");

    const res = await fetch("/api/settings/restaurant", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameEn, nameRo }),
    });

    setRestaurantState(res.ok ? "saved" : "error");
    setTimeout(() => setRestaurantState("idle"), 3000);
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    setPasswordState("saving");

    const res = await fetch("/api/settings/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (res.ok) {
      setPasswordState("saved");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      const data = await res.json();
      setPasswordError(data.error ?? "Something went wrong.");
      setPasswordState("error");
    }
    setTimeout(() => setPasswordState("idle"), 3000);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Restaurant Info */}
      <form onSubmit={handleRestaurantSave} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-1">Restaurant Info</h2>
        <p className="text-xs text-gray-400 mb-5">This name is shown to customers in the chat header.</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Name in English 🇬🇧</label>
            <input
              className={inputClass}
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="My Restaurant"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Name in Romanian 🇷🇴</label>
            <input
              className={inputClass}
              value={nameRo}
              onChange={(e) => setNameRo(e.target.value)}
              placeholder="Restaurantul Meu"
              required
            />
          </div>
        </div>

        {/* QR Info */}
        <div className="mt-5 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-orange-700 mb-1">📱 Customer QR Code URL</p>
          <p className="text-xs text-orange-600 font-mono break-all">
            {typeof window !== "undefined" ? window.location.origin : ""}/?r={restaurant.slug}
          </p>
          <p className="text-xs text-orange-500 mt-1.5">
            Print this as a QR code and place it on each table.
          </p>
        </div>

        <SaveButton state={restaurantState} label="Save Restaurant Info" className="mt-5" />
      </form>

      {/* Account */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-1">Account</h2>
        <p className="text-xs text-gray-400 mb-4">Your login credentials</p>

        <div className="mb-4">
          <label className={labelClass}>Email</label>
          <input
            className={inputClass + " opacity-60 cursor-not-allowed"}
            value={adminEmail}
            disabled
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
        </div>
      </div>

      {/* Change Password */}
      <form onSubmit={handlePasswordSave} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-1">Change Password</h2>
        <p className="text-xs text-gray-400 mb-5">Use a strong password of at least 8 characters.</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Current Password</label>
            <input
              type="password"
              className={inputClass}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className={labelClass}>New Password</label>
            <input
              type="password"
              className={inputClass}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Confirm New Password</label>
            <input
              type="password"
              className={inputClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {passwordError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
            {passwordError}
          </div>
        )}

        <SaveButton state={passwordState} label="Update Password" className="mt-5" />
      </form>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100">
        <h2 className="font-bold text-red-600 mb-1">Danger Zone</h2>
        <p className="text-xs text-gray-400 mb-4">
          These actions are irreversible. Please be certain.
        </p>
        <button
          type="button"
          onClick={() => alert("Please contact support to delete your account.")}
          className="px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all"
        >
          🗑️ Delete Restaurant & All Data
        </button>
      </div>

    </div>
  );
}

// ---- Reusable save button with state feedback ----
function SaveButton({ state, label, className = "" }: { state: SaveState; label: string; className?: string }) {
  const map = {
    idle:   { text: label,        cls: "from-orange-400 to-rose-500 text-white shadow-lg" },
    saving: { text: "Saving...",  cls: "from-orange-300 to-rose-400 text-white opacity-70" },
    saved:  { text: "✓ Saved",    cls: "from-green-400 to-emerald-500 text-white shadow" },
    error:  { text: "✕ Error",    cls: "from-red-400 to-rose-500 text-white shadow" },
  };
  const { text, cls } = map[state];
  return (
    <button
      type="submit"
      disabled={state === "saving"}
      className={`w-full py-3 bg-gradient-to-r ${cls} rounded-xl font-bold text-sm active:scale-95 transition-all disabled:cursor-not-allowed ${className}`}
    >
      {text}
    </button>
  );
}
