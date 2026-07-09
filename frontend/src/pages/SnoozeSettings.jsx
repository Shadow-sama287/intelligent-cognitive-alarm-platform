import { useState } from "react";
import { FaBellSlash, FaFire, FaLayerGroup } from "react-icons/fa";

// Bounds are enforced in two places on purpose:
// 1. The <input min/max/step> attributes stop the browser's native
//    spinner/scroll-wheel from going out of range.
// 2. The clamp() calls in the handlers stop a user from typing an
//    out-of-range number directly and tabbing away, which the min/max
//    attributes alone do NOT prevent.
const MAX_SNOOZE_BOUNDS = { min: 0, max: 3 };
const PUZZLE_BOUNDS = { min: 1, max: 5 };

const clamp = (value, min, max) => {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
};

export default function SnoozeSettings() {
  const [maxSnoozeLimit, setMaxSnoozeLimit] = useState(2);
  const [penaltyEscalation, setPenaltyEscalation] = useState(true);
  const [consecutivePuzzlesRequired, setConsecutivePuzzlesRequired] = useState(2);
  const [savedMessage, setSavedMessage] = useState("");

  const handleMaxSnoozeChange = (e) => {
    const clamped = clamp(Number(e.target.value), MAX_SNOOZE_BOUNDS.min, MAX_SNOOZE_BOUNDS.max);
    setMaxSnoozeLimit(clamped);
  };

  const handlePuzzlesChange = (e) => {
    const clamped = clamp(Number(e.target.value), PUZZLE_BOUNDS.min, PUZZLE_BOUNDS.max);
    setConsecutivePuzzlesRequired(clamped);
  };

  const handleSave = (e) => {
    e.preventDefault();
    // No backend yet — this is where a real save call would go.
    // For now, just confirm the values are captured correctly in state.
    setSavedMessage("Settings saved for this session.");
    setTimeout(() => setSavedMessage(""), 2500);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>Anti-Snooze &amp; Hardcore Mode</h2>
        <p>Tune how forgiving — or unforgiving — your alarms are allowed to be.</p>
      </div>

      <form className="settings-card" onSubmit={handleSave}>
        {/* Max Snooze Limit */}
        <div className="settings-row">
          <div className="settings-row-label">
            <div className="settings-icon purple">
              <FaBellSlash />
            </div>
            <div>
              <h4>Max Snooze Limit</h4>
              <p>How many times an alarm can be snoozed before it locks (0–3).</p>
            </div>
          </div>
          <div className="settings-control">
            <input
              type="number"
              min={MAX_SNOOZE_BOUNDS.min}
              max={MAX_SNOOZE_BOUNDS.max}
              step={1}
              value={maxSnoozeLimit}
              onChange={handleMaxSnoozeChange}
              className="settings-number-input"
              aria-label="Max snooze limit, 0 to 3"
            />
          </div>
        </div>

        {/* Penalty Escalation */}
        <div className="settings-row">
          <div className="settings-row-label">
            <div className="settings-icon orange">
              <FaFire />
            </div>
            <div>
              <h4>Penalty Escalation</h4>
              <p>Each additional snooze makes the wake-up puzzle harder.</p>
            </div>
          </div>
          <div className="settings-control">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={penaltyEscalation}
                onChange={(e) => setPenaltyEscalation(e.target.checked)}
                aria-label="Toggle penalty escalation"
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {/* Consecutive Puzzles Required */}
        <div className="settings-row">
          <div className="settings-row-label">
            <div className="settings-icon lavender">
              <FaLayerGroup />
            </div>
            <div>
              <h4>Consecutive Puzzles Required</h4>
              <p>Puzzles you must solve correctly in a row to dismiss the alarm (1–5).</p>
            </div>
          </div>
          <div className="settings-control">
            <input
              type="number"
              min={PUZZLE_BOUNDS.min}
              max={PUZZLE_BOUNDS.max}
              step={1}
              value={consecutivePuzzlesRequired}
              onChange={handlePuzzlesChange}
              className="settings-number-input"
              aria-label="Consecutive puzzles required, 1 to 5"
            />
          </div>
        </div>

        <div className="settings-footer">
          {savedMessage && <span className="settings-saved-msg">{savedMessage}</span>}
          <button type="submit" className="btn-gradient">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}