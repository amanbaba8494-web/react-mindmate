import React, { useState, useEffect } from 'react';
import './Checklist.css';

const TASK_LIST = [
  'Sleep 7–9 Hours Daily: Proper sleep improves memory, mood, and focus. Avoid mobile 1 hour before bed.',
  'Follow a Simple Daily Routine: Wake up, study, eat, and sleep at fixed times. Routine reduces anxiety and confusion.',
  'Do 20–30 Minutes of Physical Activity: Walking, yoga, cycling, or stretching reduces stress hormones and boosts happiness chemicals.',
  'Practice Deep Breathing or Meditation (5–10 mins): Helps calm the nervous system and improves concentration.',
  'Eat Balanced & Regular Meals: Include fruits, vegetables, proteins, and enough water. Avoid too much junk food and caffeine.',
  'Break Study into Small Sessions: Use the 25–30 minute study method (like Pomodoro). Short breaks prevent burnout.',
  'Limit Social Media Time: Too much scrolling increases comparison and anxiety. Fix a time limit.',
  'Talk to Someone You Trust: Share feelings with parents, friends, or teachers. Don\'t keep stress inside.',
  'Practice Gratitude: Write 3 good things daily. It shifts focus from stress to positivity.',
  'Do One Thing You Enjoy Daily: Music, drawing, reading, gardening, prayer, or hobbies refresh your mind.'
];

const CHECKLIST_TASKS_KEY = 'checklistTasks';
const CHECKLIST_RESET_DATE_KEY = 'checklistResetDate';
const CHECKLIST_HISTORY_KEY = 'checklistHistory';

const getISODateKey = (date) => date.toISOString().split('T')[0];

const buildWindowData = (history, days) => {
  const points = [];
  const today = new Date();

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    const key = getISODateKey(date);
    points.push({ dateKey: key, value: history[key] ?? 0 });
  }

  return points;
};

const getGradeInfo = (average) => {
  if (average >= 85) {
    return {
      grade: 'A',
      label: 'Excellent consistency',
      suggestion: 'You are maintaining strong wellness discipline. Keep this routine and mentor a friend with your habits.'
    };
  }

  if (average >= 70) {
    return {
      grade: 'B',
      label: 'Good progress',
      suggestion: 'You are doing well. Focus on completing 1–2 missed tasks daily to reach excellent consistency.'
    };
  }

  if (average >= 50) {
    return {
      grade: 'C',
      label: 'Moderate consistency',
      suggestion: 'Build momentum by fixing a morning and night routine first. Small daily wins will improve your score steadily.'
    };
  }

  return {
    grade: 'D',
    label: 'Needs attention',
    suggestion: 'Start with just 3 core tasks (sleep, hydration, movement) and track them daily for the next week.'
  };
};

function Checklist({ onClose }) {
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState({});
  const [selectedWindow, setSelectedWindow] = useState(30);

  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem(CHECKLIST_RESET_DATE_KEY);
    const storedTasks = JSON.parse(localStorage.getItem(CHECKLIST_TASKS_KEY) || '[]');
    const storedHistory = JSON.parse(localStorage.getItem(CHECKLIST_HISTORY_KEY) || '{}');

    setHistory(storedHistory);

    // Reset tasks if it's a new day
    if (storedDate !== today) {
      const resetTasks = TASK_LIST.map(() => false);
      setTasks(resetTasks);
      localStorage.setItem(CHECKLIST_RESET_DATE_KEY, today);
      localStorage.setItem(CHECKLIST_TASKS_KEY, JSON.stringify(resetTasks));
    } else {
      const safeTasks = storedTasks.length === TASK_LIST.length ? storedTasks : TASK_LIST.map(() => false);
      setTasks(safeTasks);
    }
  }, []);

  useEffect(() => {
    if (tasks.length !== TASK_LIST.length) {
      return;
    }

    localStorage.setItem(CHECKLIST_TASKS_KEY, JSON.stringify(tasks));

    const todayKey = getISODateKey(new Date());
    const completedCount = tasks.filter(task => task).length;
    const todayPercentage = Math.round((completedCount / TASK_LIST.length) * 100);

    setHistory((previousHistory) => {
      const updatedHistory = {
        ...previousHistory,
        [todayKey]: todayPercentage
      };

      localStorage.setItem(CHECKLIST_HISTORY_KEY, JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  }, [tasks]);

  const toggleTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = !updatedTasks[index];
    setTasks(updatedTasks);
  };

  const completedCount = tasks.filter(t => t).length;
  const totalTasks = TASK_LIST.length;
  const progressPercentage = Math.round((completedCount / totalTasks) * 100);

  const windowData = buildWindowData(history, selectedWindow);
  const windowAverage = Math.round(
    windowData.reduce((sum, point) => sum + point.value, 0) / selectedWindow
  );
  const gradeInfo = getGradeInfo(windowAverage);

  return (
    <div className="checklist-overlay">
      <div className="checklist-modal">
        <div className="checklist-header">
          <h2>Daily Wellness Checklist</h2>
          <button className="checklist-close" onClick={onClose}>✕</button>
        </div>

        <div className="checklist-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <p className="progress-text">{completedCount} of {totalTasks} tasks completed ({progressPercentage}%)</p>
          <p className="reset-info">Resets daily at midnight</p>
        </div>

        <div className="checklist-analytics">
          <div className="analytics-header">
            <h3>Progressive Wellness Score</h3>
            <div className="window-buttons">
              <button
                className={`window-btn ${selectedWindow === 30 ? 'active' : ''}`}
                onClick={() => setSelectedWindow(30)}
              >
                30 Days
              </button>
              <button
                className={`window-btn ${selectedWindow === 40 ? 'active' : ''}`}
                onClick={() => setSelectedWindow(40)}
              >
                40 Days
              </button>
            </div>
          </div>

          <div className="analytics-summary">
            <p><strong>Average Completion:</strong> {windowAverage}%</p>
            <p><strong>Grade:</strong> {gradeInfo.grade} ({gradeInfo.label})</p>
          </div>

          <div className="analytics-bars">
            {windowData.map((point) => (
              <div
                key={point.dateKey}
                className="analytics-bar-wrap"
                title={`${point.dateKey}: ${point.value}%`}
              >
                <div className="analytics-bar" style={{ height: `${Math.max(point.value, 6)}%` }}></div>
              </div>
            ))}
          </div>

          <p className="analytics-suggestion">{gradeInfo.suggestion}</p>
        </div>

        <div className="checklist-tasks">
          {TASK_LIST.map((task, index) => (
            <div key={index} className="task-item">
              <input
                type="checkbox"
                id={`task-${index}`}
                checked={tasks[index] || false}
                onChange={() => toggleTask(index)}
                className="task-checkbox"
              />
              <label htmlFor={`task-${index}`} className="task-label">
                {task}
              </label>
            </div>
          ))}
        </div>

        <div className="checklist-footer">
          <p className="encouragement">
            {progressPercentage === 100 ? '🎉 Fantastic! You completed all tasks today!' : `Keep going! ${totalTasks - completedCount} tasks remaining.`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Checklist;
