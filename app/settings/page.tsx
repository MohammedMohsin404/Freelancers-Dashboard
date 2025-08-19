"use client";

import { useState, ChangeEvent, useEffect } from "react";
import ThemeToggle from "../components/ThemeToggle";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();

  // Initialize profile state with session data if available
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    image: "",
  });

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setProfile({
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "https://via.placeholder.com/150",
      });
    }
  }, [session]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save logic here, e.g., API call to update user profile
    alert("Profile updated!");
  };

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Settings</h1>

      {/* Profile Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-base-100 p-6 rounded-xl shadow-lg"
      >
        <div className="flex flex-col items-center gap-2">
          <img
            src={profile.image || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-primary"
          />
          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={profile.image}
            onChange={handleInputChange}
            className="input input-bordered w-full"
          />
        </div>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={profile.name}
          onChange={handleInputChange}
          className="input input-bordered w-full"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={profile.email}
          onChange={handleInputChange}
          className="input input-bordered w-full"
          required
        />

        <button type="submit" className="btn btn-primary mt-2">
          Save Profile
        </button>
      </form>

      {/* Theme Toggle */}
      <div className="mt-6 flex items-center justify-between bg-base-100 p-4 rounded-xl shadow-lg">
        <span className="font-medium text-lg">Dark / Light Theme</span>
        <ThemeToggle />
      </div>
    </div>
  );
}
