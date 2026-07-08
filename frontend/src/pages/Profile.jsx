import { useState } from "react";
import { FaClock, FaMoon, FaGlobe, FaBrain } from "react-icons/fa";

export default function Profile() {
  const [profile, setProfile] = useState({
    preferred_wake_time: "07:00",
    target_sleep_hours: 8,
    time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    difficulty_preference: "medium",
  });

  const handleChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    console.log(profile);

    // TODO:
    // await apiClient.put("/profile", profile);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <div>
          <h2>Profile Settings</h2>
          <p>Manage your wake-up preferences.</p>
        </div>
      </div>

      <form className="auth-form" onSubmit={handleSave}>

       <label>Preferred Wake-up Time</label>
        <div className="input-group">
        <FaClock className="input-icon" />
        <input
            type="time"
            value={profile.preferred_wake_time}
            onChange={(e) =>
            handleChange("preferred_wake_time", e.target.value)
            }
        />
        </div>

        <label>Target Sleep Hours</label>
        <input
          type="number"
          min="1"
          max="24"
          step="0.5"
          value={profile.target_sleep_hours}
          onChange={(e) =>
            handleChange("target_sleep_hours", Number(e.target.value))
          }
        />

        <label>Time Zone</label>
        <input
          type="text"
          value={profile.time_zone}
          onChange={(e) =>
            handleChange("time_zone", e.target.value)
          }
        />

        <label>Default Difficulty</label>

        <select
          value={profile.difficulty_preference}
          onChange={(e) =>
            handleChange("difficulty_preference", e.target.value)
          }
        >
          <option value="beginner">Beginner</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="expert">Expert</option>
        </select>

        <button className="btn-gradient" type="submit">
          Save Changes
        </button>

      </form>
    </div>
  );
}