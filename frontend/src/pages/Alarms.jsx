import React, { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import {
  FaPlus,
  FaClock,
  FaCalculator,
  FaPuzzlePiece,
  FaQuestionCircle,
  FaBrain,
  FaTimes,
} from "react-icons/fa";

const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case "math":
      return FaCalculator;
    case "memory":
      return FaPuzzlePiece;
    case "logic":
      return FaBrain;
    default:
      return FaQuestionCircle;
  }
};

const getCategoryColor = (category) => {
  switch (category?.toLowerCase()) {
    case "math":
      return "text-rose-500";
    case "memory":
      return "text-indigo-500";
    case "logic":
      return "text-amber-600";
    default:
      return "text-slate-500";
  }
};

export const AlarmsPage = () => {
  const FULL_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const SHORT_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

  const [alarms, setAlarms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [alarmForm, setAlarmForm] = useState({
    title: "",
    alarm_time: "07:00",
    days_of_week: ["MON", "TUE", "WED", "THU", "FRI"],
    challenge_category: "math",
    difficulty_override: "default",
    snooze_limit: 3,
  });

  const handleChange = (field, value) => {
    setAlarmForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrorMessage("");
  };

  const handleEdit = (alarm) => {
    setEditingAlarm(alarm);
    setAlarmForm({
      title: alarm.title,
      alarm_time: alarm.alarm_time,
      days_of_week: alarm.days_of_week ? alarm.days_of_week.split(",") : [],
      challenge_category: alarm.challenge_category,
      difficulty_override: alarm.difficulty_override,
      snooze_limit: alarm.snooze_limit,
    });
    setShowModal(true);
  };

  const deleteAlarm = async (id) => {
    try {
      await apiClient.delete(`/alarms/${id}`);
      fetchAlarms();
    } catch (err) {
      console.error(err);
      alert("Unable to delete alarm.");
    }
  };

  const fetchAlarms = async () => {
    try {
      const res = await apiClient.get("/alarms");
      setAlarms(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlarms();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!alarmForm.title.trim()) {
      setErrorMessage("Please enter an alarm label");
      return;
    }

    if (alarmForm.days_of_week.length === 0) {
      setErrorMessage("Please select at least one day");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        title: alarmForm.title,
        alarm_time: alarmForm.alarm_time,
        days_of_week: alarmForm.days_of_week.join(","),
        challenge_category: alarmForm.challenge_category,
        difficulty_override: alarmForm.difficulty_override,
        snooze_limit: alarmForm.snooze_limit,
      };

      if (editingAlarm) {
        await apiClient.put(`/alarms/${editingAlarm.id}`, payload);
      } else {
        await apiClient.post("/alarms", payload);
      }

      setShowModal(false);
      fetchAlarms();
      setEditingAlarm(null);
      setAlarmForm({
        title: "",
        alarm_time: "07:00",
        days_of_week: ["MON", "TUE", "WED", "THU", "FRI"],
        challenge_category: "math",
        difficulty_override: "default",
        snooze_limit: 3,
      });
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.detail || "Failed to save alarm. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAlarm = async (id) => {
    await apiClient.put(`/alarms/${id}/toggle`);
    fetchAlarms();
  };

  const parseTime = (time24) => {
    if (!time24) return { time: "00:00", ampm: "AM" };
    let [h, m] = time24.split(":");
    h = parseInt(h, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return { time: `${h12.toString().padStart(2, "0")}:${m}`, ampm };
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Manage Alarms
          </h1>
          <p className="text-slate-500 text-sm">
            Configure your waking sequences and intelligence challenges.
          </p>

          <div className="flex gap-2 mt-4 text-xs font-semibold">
            <button className="px-4 py-1.5 rounded-full bg-orange-200 text-orange-900">
              All Alarms
            </button>
            <button className="px-4 py-1.5 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50">
              Active
            </button>
            <button className="px-4 py-1.5 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50">
              Snoozed
            </button>
            <button className="px-4 py-1.5 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50">
              By Label
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingAlarm(null);
            setAlarmForm({
              title: "",
              alarm_time: "07:00",
              days_of_week: [],
              challenge_category: "math",
              difficulty_override: "default",
              snooze_limit: 3,
            });
            setShowModal(true);
          }}
          className="bg-rose-500 hover:bg-rose-600 text-black px-6 py-2.5 rounded-md font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <FaPlus /> Add New Alarm
        </button>
      </div>

      {/* Alarms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {alarms.map((alarm) => {
          const Icon = getCategoryIcon(alarm.challenge_category);
          const colorClass = getCategoryColor(alarm.challenge_category);
          const { time, ampm } = parseTime(alarm.alarm_time);
          const activeDays = alarm.days_of_week
            ? alarm.days_of_week.split(",")
            : [];

          return (
            <div
              key={alarm.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative group"
            >
              {/* Toggle switch */}
              <div className="absolute top-6 right-6">
                <button
                  onClick={() => toggleAlarm(alarm.id)}
                  className={`w-12 h-6 rounded-full flex items-center transition-colors px-1 ${alarm.is_active ? "bg-slate-900" : "bg-slate-200"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${alarm.is_active ? "translate-x-6" : ""}`}
                  />
                </button>
              </div>

              {/* Time */}
              <div
                className="flex items-baseline gap-1 mb-1"
                onClick={() => handleEdit(alarm)}
                style={{ cursor: "pointer" }}
              >
                <span className="text-4xl font-bold text-slate-900">
                  {time}
                </span>
                <span className="text-lg font-medium text-slate-500">
                  {ampm}
                </span>
              </div>

              <div className="text-sm font-medium text-slate-600 mb-4">
                {alarm.title || "Alarm"}
              </div>

              {/* Days Pills */}
              <div className="flex gap-1.5 mb-4">
                {FULL_DAYS.map((fullDay, idx) => {
                  const isActive = activeDays.includes(fullDay);
                  return (
                    <div
                      key={fullDay}
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold
                        ${isActive ? "bg-slate-200 text-slate-800" : "bg-slate-50 text-slate-300"}`}
                    >
                      {SHORT_DAYS[idx]}
                    </div>
                  );
                })}
              </div>

              <hr className="border-slate-100 my-4" />

              <div className="flex justify-between items-center">
                <div
                  className={`flex items-center gap-2 text-sm font-semibold capitalize ${colorClass}`}
                >
                  <Icon /> {alarm.challenge_category} Challenge -{" "}
                  {alarm.difficulty_override !== "default"
                    ? alarm.difficulty_override
                    : "Medium"}
                </div>

                {/* Edit and Delete buttons (visible on hover) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-4">
                  <button
                    onClick={() => handleEdit(alarm)}
                    className="text-xs text-indigo-500 hover:text-indigo-600 font-bold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this alarm?"))
                        deleteAlarm(alarm.id);
                    }}
                    className="text-xs text-rose-500 hover:text-rose-600 font-bold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add New Empty State Card */}
        <div
          onClick={() => {
            setEditingAlarm(null);
            setAlarmForm({
              title: "",
              alarm_time: "07:00",
              days_of_week: [],
              challenge_category: "math",
              difficulty_override: "default",
              snooze_limit: 3,
            });
            setShowModal(true);
          }}
          className="border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center py-12 min-h-[220px] rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
        >
          <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-3">
            <FaClock className="text-slate-400 text-xl" />
          </div>
          <span className="font-semibold">Create New</span>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-slate-200/50 rounded-xl p-6 border border-slate-300/50">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-lg font-bold text-slate-900">
              Success Rate
              <br />
              Insights
            </h3>
            <span className="text-xs font-medium text-slate-500">
              Past 30 Days
            </span>
          </div>

          {/* Faux Bar Chart */}
          <div className="flex items-end justify-between h-32 mb-4 gap-2">
            {[40, 60, 30, 70, 50, 60, 50].map((h, i) => (
              <div
                key={i}
                className="w-full bg-rose-500 rounded-t-sm"
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>

          <hr className="border-slate-300 mb-4" />
          <p className="text-xs text-slate-600">
            Your completion rate for the{" "}
            <strong className="text-slate-900">Math Challenge</strong> has
            improved by 12% this week.
          </p>
        </div>

        <div className="bg-[#2a2624] rounded-xl p-6 text-white flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Smart Suggestion</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Based on your sleep cycles, an alarm at{" "}
              <strong className="text-white">06:45 AM</strong> would result in
              higher morning alertness.
            </p>
          </div>
          <button className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-md mt-6 transition-colors">
            Update All Alarms
          </button>
        </div>
      </div>

      {/* Modal - Kept mostly same but restyled */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/20"
            onClick={() => setShowModal(false)}
          />

          {/* Drawer */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-slide-in-right">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {editingAlarm ? "Edit Alarm" : "Add New Alarm"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setErrorMessage("");
                  setIsLoading(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form
              onSubmit={handleCreate}
              className="p-6 flex-1 flex flex-col gap-6 text-sm"
            >
              <div>
                <label className="block text-xs font-bold text-slate-500 tracking-wider mb-2 uppercase">
                  Set Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    className="w-full bg-slate-50 border-none text-slate-900 text-4xl font-bold rounded-lg px-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={alarmForm.alarm_time}
                    onChange={(e) => handleChange("alarm_time", e.target.value)}
                    required
                  />
                  <FaClock className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-slate-900" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 tracking-wider mb-2 uppercase">
                  Label
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border-none text-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="e.g. Work Morning"
                  value={alarmForm.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 tracking-wider mb-2 uppercase">
                  Repeat
                </label>
                <div className="flex gap-2 justify-between">
                  {FULL_DAYS.map((day, idx) => {
                    const isSelected = alarmForm.days_of_week.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => {
                          if (isSelected)
                            handleChange(
                              "days_of_week",
                              alarmForm.days_of_week.filter((d) => d !== day),
                            );
                          else
                            handleChange("days_of_week", [
                              ...alarmForm.days_of_week,
                              day,
                            ]);
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs transition-colors border
                          ${isSelected ? "bg-black text-white border-black" : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"}`}
                      >
                        {SHORT_DAYS[idx]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 tracking-wider mb-2 uppercase">
                  Intelligence Challenge
                </label>
                <select
                  className="w-full bg-slate-50 border-none text-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={alarmForm.challenge_category}
                  onChange={(e) =>
                    handleChange("challenge_category", e.target.value)
                  }
                >
                  <option value="math">Math Challenge</option>
                  <option value="memory">Memory Challenge</option>
                  <option value="logic">Logic Puzzle</option>
                  <option value="riddle">Riddle</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 tracking-wider mb-2 uppercase">
                    Difficulty
                  </label>
                  <select
                    className="w-full bg-slate-50 border-none text-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={alarmForm.difficulty_override}
                    onChange={(e) =>
                      handleChange("difficulty_override", e.target.value)
                    }
                  >
                    <option value="default">Default</option>
                    <option value="beginner">Beginner</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 tracking-wider mb-2 uppercase">
                    Snooze Limit
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    className="w-full bg-slate-50 border-none text-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={alarmForm.snooze_limit}
                    onChange={(e) =>
                      handleChange("snooze_limit", Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-white py-4 mt-auto z-10 space-y-3">
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {errorMessage}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 font-bold text-base rounded-xl transition-colors shadow-lg ${
                    isLoading
                      ? "bg-rose-300 text-white cursor-not-allowed"
                      : "bg-rose-500 text-white hover:bg-rose-600"
                  }`}
                >
                  {isLoading ? "Saving..." : editingAlarm ? "Update Alarm" : "Create Alarm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
