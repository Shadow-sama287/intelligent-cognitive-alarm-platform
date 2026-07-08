import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { FaPlus, FaClock, FaToggleOn, FaToggleOff, FaCalculator, FaPuzzlePiece, FaQuestionCircle, FaChevronRight } from 'react-icons/fa';

const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case "math":
      return FaCalculator;
    case "memory":
      return FaPuzzlePiece;
    case "logic":
    default:
      return FaQuestionCircle;
  }
};

export const AlarmsPage = () => {
  const [alarms, setAlarms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState(null);
  const [alarmForm, setAlarmForm] = useState({
  title: '',
  alarm_time: '07:00',
  days_of_week: [],
  challenge_category: 'math',
  difficulty_override: 'default',
  snooze_limit: 3,
});
  const handleChange = (field, value) => {
  setAlarmForm((prev) => ({
    ...prev,
    [field]: value,
  }));
};
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const handleEdit = (alarm) => {
    setEditingAlarm(alarm);

    setAlarmForm({
        title: alarm.title,
        alarm_time: alarm.alarm_time,
        days_of_week: alarm.days_of_week.split(","),
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
      const res = await apiClient.get('/alarms');
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

  try {
    await apiClient.post("/alarms", {
      title: alarmForm.title,
      alarm_time: alarmForm.alarm_time,
      days_of_week: alarmForm.days_of_week.join(","),
      challenge_category: alarmForm.challenge_category,
      difficulty_override: alarmForm.difficulty_override,
      snooze_limit: alarmForm.snooze_limit,
    });

    setShowModal(false);
    fetchAlarms();
  } catch (err) {
    console.error(err);
  }
};

  const toggleAlarm = async (id) => {
    await apiClient.put(`/alarms/${id}/toggle`);
    fetchAlarms();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <div>
          <h2>Alarm Scheduler</h2>
          <p>View, toggle, and create your cognitive alarms.</p>
        </div>
        <button 
          type="button"
          onClick={() => setShowModal(true)}
          className="btn-gradient btn-inline"
        >
          <FaPlus /> New Alarm
        </button>
      </div>

      <div className="upcoming-section">
        <div className="alarm-list">
          {alarms.length > 0 ? alarms.map((alarm) => {
            const Icon = getCategoryIcon(alarm.challenge_category);
            const statusKey = alarm.is_active ? "active" : "inactive";
            return (
              <div className="alarm-item" key={alarm.id}>
                <div className={`alarm-icon ${statusKey}`}>
                  <Icon />
                </div>
                <div className="alarm-info">
                  <h4>{alarm.title}</h4>
                  <p>{alarm.alarm_time}</p>
                  <p className="capitalize">{alarm.challenge_category} Challenge • {alarm.days_of_week}</p>
                </div>
                <div className="alarm-actions">
  <button
    className="btn-ghost"
    onClick={() => handleEdit(alarm)}
  >
    Edit
  </button>

  <button
    className="btn-ghost"
    onClick={() => {
      if (window.confirm("Delete this alarm?")) {
        deleteAlarm(alarm.id);
      }
    }}
  >
    Delete
  </button>
</div>
                <button 
                  onClick={() => toggleAlarm(alarm.id)} 
                  style={{ 
                    fontSize: '28px', 
                    color: alarm.is_active ? 'var(--color-purple)' : 'var(--color-text-muted)', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {alarm.is_active ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
            );
          }) : <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>No alarms found. Create one!</p>}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {editingAlarm ? "Edit Alarm" : "Create New Alarm"}
              </h2>
            </div>
            <form onSubmit={handleCreate} className="auth-form">
            <label>Title</label>
            <div className="input-group">
              <input
                type="text"
                placeholder="Workday Wakeup"
                value={alarmForm.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>
              <label>Time</label>
              <div className="input-group">
                <FaClock className="input-icon" />
                <input
                  type="time"
                  value={alarmForm.alarm_time}
                  onChange={(e) =>
                    handleChange("alarm_time", e.target.value)
                  }
                />
              </div><label>Days of Week</label>

              <div className="days-grid">
                {DAYS.map((day) => (
                  <label key={day}>
                    <input
                      type="checkbox"
                      checked={alarmForm.days_of_week.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleChange("days_of_week", [
                            ...alarmForm.days_of_week,
                            day,
                          ]);
                        } else {
                          handleChange(
                            "days_of_week",
                            alarmForm.days_of_week.filter(
                              (d) => d !== day
                            )
                          );
                        }
                      }}
                    />
                    {day}
                  </label>
                ))}
              </div>
              <label>Challenge Category</label>
              <div className="input-group">
                <select
                  value={alarmForm.challenge_category}
                  onChange={(e)=>
                  handleChange(
                  "challenge_category",
                  e.target.value)
                  }
                  style={{ 
                    width: '100%', 
                    padding: '14px 16px', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--color-border)', 
                    background: 'var(--color-card-solid)', 
                    fontSize: '14px', 
                    color: 'var(--color-text)',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="math">Math</option>
                  <option value="memory">Memory</option>
                  <option value="logic">Logic</option>
                  <option value="riddle">Riddle</option>
                </select>
              </div><label>Difficulty Override</label>

              <select
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
              <label>Snooze Limit</label>

              <input
                type="number"
                min="0"
                max="10"
                value={alarmForm.snooze_limit}
                onChange={(e) =>
                  handleChange("snooze_limit", Number(e.target.value))
                }
              />
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gradient"
                >
                  {editingAlarm ? "Update Alarm" : "Save Alarm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};