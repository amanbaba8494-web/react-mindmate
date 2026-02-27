import React, { useState } from 'react';
import './StressAnalysis.css';

const QUESTIONS = [
  'Have you felt overwhelmed by studies in the last 7 days?',
  'Do you find it hard to sleep because of stress or worry?',
  'Have you had difficulty concentrating during classes or study time?',
  'Do you feel physically tired or drained most days?',
  'Have you been avoiding tasks because they feel too stressful?',
  'Do you often feel anxious about your future or performance?'
];

const STRESS_HISTORY_KEY = 'stressAnalysisHistory';

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
      label: 'Very stable',
      suggestion: 'Your stress regulation is excellent. Keep your routine, sleep cycle, and daily breaks consistent.'
    };
  }

  if (average >= 70) {
    return {
      grade: 'B',
      label: 'Stable',
      suggestion: 'You are managing stress well. Add one intentional relaxation habit daily to move toward A.'
    };
  }

  if (average >= 50) {
    return {
      grade: 'C',
      label: 'At risk',
      suggestion: 'Stress is moderate. Protect your sleep, reduce phone usage at night, and use short breathing breaks.'
    };
  }

  return {
    grade: 'D',
    label: 'High concern',
    suggestion: 'Your trend suggests high stress. Please talk to a trusted parent, teacher, counselor, or mentor soon.'
  };
};

function StressAnalysis({ onClose }) {
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [selectedWindow, setSelectedWindow] = useState(30);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STRESS_HISTORY_KEY) || '{}');
    } catch {
      return {};
    }
  });

  const setAnswer = (index, value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  const answeredCount = answers.filter(answer => answer !== null).length;
  const yesCount = answers.filter(answer => answer === 'yes').length;
  const canSubmit = answeredCount === QUESTIONS.length;
  const stressControlScore = Math.round(((QUESTIONS.length - yesCount) / QUESTIONS.length) * 100);

  const getResult = () => {
    if (yesCount <= 1) {
      return {
        level: 'Low Stress',
        message: 'You seem to be managing stress well. Keep your routine balanced and continue healthy habits.'
      };
    }

    if (yesCount <= 3) {
      return {
        level: 'Moderate Stress',
        message: 'You may be experiencing manageable stress. Prioritize sleep, short breaks, and daily relaxation practices.'
      };
    }

    return {
      level: 'High Stress',
      message: 'Your stress indicators are high. Please consider speaking with a trusted teacher, parent, counselor, or mentor.'
    };
  };

  const result = getResult();
  const windowData = buildWindowData(history, selectedWindow);
  const windowAverage = Math.round(
    windowData.reduce((sum, point) => sum + point.value, 0) / selectedWindow
  );
  const gradeInfo = getGradeInfo(windowAverage);

  const handleAnalyze = () => {
    if (!canSubmit) {
      return;
    }

    setShowResult(true);

    const todayKey = getISODateKey(new Date());
    const updatedHistory = {
      ...history,
      [todayKey]: stressControlScore
    };

    setHistory(updatedHistory);
    localStorage.setItem(STRESS_HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  return (
    <div className="stress-overlay">
      <div className="stress-modal">
        <div className="stress-header">
          <h2>Stress Analysis</h2>
          <button className="stress-close" onClick={onClose}>✕</button>
        </div>

        <div className="stress-body">
          <p className="stress-subtitle">Answer each question with Yes or No for a quick daily stress check.</p>

          <div className="stress-questions">
            {QUESTIONS.map((question, index) => (
              <div key={index} className="stress-question-card">
                <p>{index + 1}. {question}</p>
                <div className="stress-options">
                  <button
                    className={`stress-option ${answers[index] === 'yes' ? 'selected' : ''}`}
                    onClick={() => setAnswer(index, 'yes')}
                  >
                    Yes
                  </button>
                  <button
                    className={`stress-option ${answers[index] === 'no' ? 'selected' : ''}`}
                    onClick={() => setAnswer(index, 'no')}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="stress-footer">
            {!showResult ? (
              <button
                className="stress-submit"
                onClick={handleAnalyze}
                disabled={!canSubmit}
              >
                Analyze Stress Level
              </button>
            ) : (
              <>
                <div className="stress-result">
                  <h3>{result.level}</h3>
                  <p>{result.message}</p>
                </div>

                <div className="stress-analytics">
                  <div className="stress-analytics-header">
                    <h3>Progressive Stress Trend</h3>
                    <div className="stress-window-buttons">
                      <button
                        className={`stress-window-btn ${selectedWindow === 30 ? 'active' : ''}`}
                        onClick={() => setSelectedWindow(30)}
                      >
                        30 Days
                      </button>
                      <button
                        className={`stress-window-btn ${selectedWindow === 40 ? 'active' : ''}`}
                        onClick={() => setSelectedWindow(40)}
                      >
                        40 Days
                      </button>
                    </div>
                  </div>

                  <div className="stress-analytics-summary">
                    <p><strong>Average Stress-Control Score:</strong> {windowAverage}%</p>
                    <p><strong>Grade:</strong> {gradeInfo.grade} ({gradeInfo.label})</p>
                  </div>

                  <div className="stress-analytics-bars">
                    {windowData.map((point) => (
                      <div
                        key={point.dateKey}
                        className="stress-analytics-bar-wrap"
                        title={`${point.dateKey}: ${point.value}%`}
                      >
                        <div className="stress-analytics-bar" style={{ height: `${Math.max(point.value, 6)}%` }}></div>
                      </div>
                    ))}
                  </div>

                  <p className="stress-analytics-suggestion">{gradeInfo.suggestion}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StressAnalysis;
