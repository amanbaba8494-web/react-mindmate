import React, { useState } from 'react';
import './Dashboard.css';
import Checklist from './Checklist';
import StressAnalysis from './StressAnalysis';

const CHECKLIST_HISTORY_KEY = 'checklistHistory';
const STRESS_HISTORY_KEY = 'stressAnalysisHistory';
const STUDENT_WALLET_KEY = 'studentWallet';

const getCurrentMonthKey = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
};

const getMonthlyAverage = (history, monthKey) => {
  const values = Object.entries(history)
    .filter(([dateKey]) => dateKey.startsWith(monthKey))
    .map(([, value]) => Number(value) || 0);

  if (!values.length) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const getRewardCoins = (checklistAvg, stressAvg) => {
  if (checklistAvg >= 80 && stressAvg >= 80) {
    return 120;
  }

  if (checklistAvg >= 70 && stressAvg >= 70) {
    return 80;
  }

  if (checklistAvg >= 60 && stressAvg >= 60) {
    return 50;
  }

  return 0;
};

function Dashboard({ userName, onLogout }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showStressAnalysis, setShowStressAnalysis] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [wallet, setWallet] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STUDENT_WALLET_KEY) || '{}');
      return {
        balance: Number(parsed.balance) || 0,
        lastRewardMonth: parsed.lastRewardMonth || null,
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : []
      };
    } catch {
      return {
        balance: 0,
        lastRewardMonth: null,
        transactions: []
      };
    }
  });

  const moods = [
    { key: 'fantastic', emoji: '😄', label: 'Fantastic' },
    { key: 'good', emoji: '😊', label: 'Good' },
    { key: 'bad', emoji: '😕', label: 'Bad' },
    { key: 'depressed', emoji: '😢', label: 'Depressed' },
  ];

  const issues = [
    'Academic Pressure',
    'High Expectations from Parents',
    'Comparison with Others',
    'Fear of Failure',
    'Social Media Pressure',
    'Lack of Proper Sleep',
    'Loneliness',
    'Bullying or Negative Comments',
    'Career Confusion',
    'Poor Time Management',
    'Lack of Emotional Expression',
    'Overuse of Mobile Phones & Gaming',
    'Financial & Family Problems',
    'Overthinking'
  ];

  const suggestions = {
    'fantastic': [
      'Share your happiness – Talk with friends or family and spread positive vibes.',
      'Celebrate small achievements – Appreciate yourself even for small successes.',
      'Listen to your favorite music – Music helps keep your energy and mood high.',
      'Express gratitude – Think about 3 things you are thankful for today.',
      'Do something creative – Drawing, dancing, writing, or any hobby boosts joy.',
      'Help someone – Kind actions make you feel more positive inside.',
      'Stay active – Light exercise or a short walk keeps your mind fresh.',
      'Capture the moment – Take photos or write memories in a journal.',
      'Stay present – Enjoy the moment instead of worrying about the future.',
      'Encourage yourself – Use positive self-talk like “I did well today.”'
    ],
    'good': [
      'Celebrate the moment — do something small you really enjoy.',
      'Listen to energetic music and move or dance a little.',
      'Share your happiness with a friend or family member.',
      'Try something creative like drawing, singing, or writing.',
      'Step outside and enjoy fresh air or sunlight.',
      'Give yourself appreciation for what you did well today.',
      'Do a random act of kindness — helping others boosts joy.',
      'Laugh more by watching something funny or playful.',
      'Set a small exciting goal and complete it immediately.',
      'Capture the happy moment by journaling or taking a photo.'
    ],
    'Academic Pressure': [
      'Create a Study Plan: Make a simple timetable and divide your subjects into small tasks. Studying step-by-step reduces stress.',
      'Set Realistic Goals: Don\'t try to be perfect in everything. Set achievable daily and weekly goals.',
      'Take Short Breaks: Study for 40–50 minutes and take a 5–10 minute break. This improves focus and reduces mental tiredness.',
      'Practice Time Management: Avoid procrastination. Complete assignments early instead of waiting until the last minute.',
      'Maintain a Healthy Lifestyle: Eat nutritious food, sleep at least 7–8 hours, and drink enough water. A healthy body supports a healthy mind.',
      'Talk About Your Stress: Share your feelings with parents, teachers, or friends. Talking helps reduce emotional pressure.',
      'Practice Relaxation Techniques: Try deep breathing, meditation, or light exercise like yoga to calm your mind.',
      'Stay Positive and Believe in Yourself: Avoid comparing yourself with others. Focus on your improvement and celebrate small achievements.'
    ],
    'High Expectations from Parents': [
      'Understand Their Intention: Most parents expect more because they want you to be successful, don\'t want you to struggle like they did, and believe pressure motivates. Try to see their expectations as care, even if the method feels tough.',
      'Know Your Own Strengths: You cannot be good at everything. Ask yourself: What subjects do I truly enjoy? What am I naturally good at? What kind of career suits my personality? When you know your strengths, you can explain your goals confidently.',
      'Communicate Calmly (Not Emotionally): Instead of saying "You never understand me!" try "I am trying my best, but I feel stressed. Can we discuss this calmly?" Respectful communication works better than arguments.',
      'Set Realistic Goals: If parents expect 95% but you\'re scoring 75%, improve step by step and show progress. Improvement matters more than perfection.',
      'Don\'t Compare Yourself to Others: Comparison creates stress, jealousy, and low confidence. Remember: Everyone\'s journey is different.',
      'Balance Expectations with Mental Health: Success is important, but so is sleep, physical health, and mental peace. If expectations are affecting your mental health, talk to a teacher, counselor, or trusted elder.',
      'Turn Pressure into Motivation: Instead of thinking "Why are they forcing me?" think "How can I use this pressure to improve myself?" But don\'t let it break you.',
      'Remember This: You are not your marks. You are not your rank. You are not someone else\'s dream. You are your own person.',
      'Involve Parents in Your Plan: Instead of rejecting their expectations, include them in your goals. Show them your study schedule, explain your career plan, and share your progress regularly. When parents see planning and effort, they feel more secure.',
      'Learn to Say "No" Respectfully: Sometimes expectations may not match your interests. You can say "I respect your opinion, but I feel more interested in this field." Being respectful while standing for your dreams builds maturity and trust.'
    ],
    'Comparison with Others': [
      'Understand That Everyone Has a Different Timeline: Some succeed early, some later. Life is not a race — it\'s a journey.',
      'Focus on Self-Improvement, Not Competition: Instead of asking "Am I better than them?" ask "Am I better than yesterday?"',
      'Know Your Unique Strengths: Everyone has different talents — academics, sports, creativity, leadership, communication. You don\'t need to be good at everything.',
      'Stop Social Media Comparison: Most people only show their success, not their struggles. What you see online is not the full reality.',
      'Set Personal Goals: Create goals based on your abilities and interests — not on what others are doing.',
      'Learn From Others Instead of Feeling Jealous: If someone scores higher, ask what study method they use and how they manage time. Turn comparison into learning.',
      'Celebrate Your Small Wins: Even small progress matters. Improvement step-by-step builds confidence.',
      'Avoid Negative Self-Talk: Don\'t say "I am useless" or "I can\'t do anything." Replace it with "I\'m improving" and "I\'ll try again."',
      'Surround Yourself With Positive People: Friends who encourage you reduce unhealthy comparison.',
      'Remember: Your Value Is Not Based on Marks: Marks measure performance, not intelligence, character, or potential.'
    ],
    'Fear of Failure': [
      'Understand That Failure Is Normal: Every successful person has failed at some point. Failure is part of learning, not the end of success.',
      'Change Your Mindset: Instead of thinking "If I fail, everything is over" think "If I fail, I will learn and improve."',
      'Focus on Effort, Not Only Results: You can control your effort, not always the outcome. Hard work always builds experience.',
      'Break Big Goals into Small Steps: Large goals create fear. Small daily targets build confidence and reduce anxiety.',
      'Prepare Properly: Good preparation reduces fear. Make a study plan, revise regularly, and practice mock tests.',
      'Accept Mistakes as Lessons: Mistakes show you what to improve. They are teachers, not enemies.',
      'Avoid Comparing Yourself to Others: Comparison increases pressure and fear. Focus on your own progress.',
      'Talk About Your Fear: Share your worries with parents, teachers, or friends. Talking reduces stress.',
      'Practice Positive Self-Talk: Say to yourself "I am capable," "I will try again," and "One failure does not define me."',
      'Take Care of Your Health: Sleep, exercise, and healthy food improve confidence and reduce stress.'
    ],
    'Social Media Pressure': [
      'Limit screen time – Fix a daily time limit for social media so it doesn\'t control your day.',
      'Remember social media is not real life – People usually post only their best moments, not their struggles.',
      'Avoid comparing yourself – Everyone has a different journey, skills, and pace of success.',
      'Follow positive and educational content – Choose accounts that inspire learning, creativity, and motivation.',
      'Take regular digital breaks – Spend time offline doing hobbies, sports, or relaxing activities.',
      'Focus on your personal goals – Concentrate on studies, skills, and self-growth instead of online validation.',
      'Talk to someone you trust – Share your feelings with parents, friends, or teachers when you feel stressed.',
      'Practice self-confidence – Appreciate your own achievements, even small ones.',
      'Avoid checking likes and comments repeatedly – Your value is not decided by numbers on a screen.',
      'Maintain a healthy daily routine – Proper sleep, exercise, and study balance help reduce mental pressure.'
    ],
    'Lack of Proper Sleep': [
      'Maintain a fixed sleep schedule – Go to bed and wake up at the same time every day, even on weekends.',
      'Avoid mobile phones before bed – Stop using your phone, TV, or laptop at least 30–60 minutes before sleeping.',
      'Reduce caffeine intake – Avoid coffee, tea, and energy drinks in the evening.',
      'Create a calm sleeping environment – Keep your room dark, quiet, and cool.',
      'Do light exercise daily – Regular physical activity helps you sleep better (but avoid heavy workouts at night).',
      'Avoid heavy meals at night – Eat light and healthy food for dinner.',
      'Practice relaxation techniques – Try deep breathing, meditation, or listening to soft music before bed.',
      'Limit daytime naps – If needed, nap only for 20–30 minutes and not in the evening.',
      'Manage stress – Write down your worries or plan your next day before sleeping to relax your mind.',
      'Get sunlight in the morning – Exposure to natural light helps regulate your sleep cycle.'
    ],
    'Loneliness': [
      'Start by identifying your feelings – Try to name what you feel (happy, sad, stressed, confused, etc.).',
      'Write a daily journal – Writing thoughts helps express emotions safely and clearly.',
      'Talk to a trusted person – Share feelings with a friend, parent, teacher, or mentor.',
      'Use creative expression – Drawing, music, dance, or writing can help release emotions.',
      'Practice speaking slowly about feelings – Start with simple sentences like "I feel worried today."',
      'Avoid bottling up emotions – Keeping everything inside can increase stress over time.',
      'Learn emotional vocabulary – Knowing more feeling words makes expression easier.',
      'Practice active listening – When you listen to others openly, you also become more comfortable sharing.',
      'Use mood-tracking apps or notes – Tracking emotions daily builds awareness.',
      'Be patient with yourself – Emotional expression is a skill that improves step by step.'
    ],
    'Bullying or Negative Comments': [
      'Don\'t Believe Every Negative Comment: Just because someone says something hurtful doesn\'t mean it is true. Their words reflect them — not your value.',
      'Stay Calm and Don\'t React Immediately: Bullies often want a reaction. If you stay calm, they lose interest.',
      'Speak Up Confidently: You can say firmly "I don\'t like that" or "Please stop." Simple and confident words show strength.',
      'Avoid Being Alone in Risky Situations: Stay with supportive friends in places where bullying usually happens.',
      'Tell a Trusted Adult: If bullying continues, inform a teacher, school counselor, or parents. Asking for help is courage, not weakness.',
      'Don\'t Respond With More Negativity: Fighting back with insults makes the situation worse. Stay respectful and mature.',
      'Block and Report Online Bullies: For cyberbullying, block the person, report the account, and avoid engaging in arguments. Protect your digital space.',
      'Build Self-Confidence: Work on your skills, hobbies, sports, or talents. Confidence makes negative comments less powerful.',
      'Choose Positive Friends: Surround yourself with people who respect and support you.',
      'Practice Self-Care: Talk about your feelings, write in a journal, and do activities that make you happy.'
    ],
    'Career Confusion': [
      'Don\'t Rush Your Decision: You don\'t have to figure out your whole life immediately. Take time to explore and think clearly.',
      'Identify Your Interests: Ask yourself what subjects you enjoy and what activities make you excited. Interest is a strong clue for career direction.',
      'Know Your Strengths: Identify if you\'re good at problem-solving, creativity, communication, or leadership. Your strengths help narrow down options.',
      'Research Different Careers: Use the internet, career websites, or talk to teachers to understand what the job involves, required qualifications, and future scope.',
      'Talk to Professionals: Speak with seniors, teachers, or working professionals. Real experiences give practical clarity.',
      'Take Career Guidance or Aptitude Tests: Aptitude tests help identify your skills, personality type, and suitable career fields. They don\'t decide your future but give direction.',
      'Try Internships or Small Projects: Experience helps more than theory. Even small internships or online projects can help you understand what you like.',
      'Avoid Peer Pressure: Don\'t choose a career just because your friend is choosing it, society says it\'s "high status," or it seems popular. Choose what suits YOU.',
      'Think Long-Term: Ask if you can see yourself doing this for many years and whether this career will match your lifestyle goals.',
      'Trust the Process: Many successful people were confused at your age. Clarity comes with exploration and experience.'
    ],
    'Poor Time Management': [
      'Create a daily timetable: Plan study time, breaks, and personal activities clearly.',
      'Set small and realistic goals: Divide big tasks into smaller steps to avoid stress.',
      'Prioritize important tasks first: Finish assignments or studying before entertainment.',
      'Avoid procrastination: Start work immediately, even if it\'s just for 10 minutes.',
      'Limit distractions: Keep your phone away or turn off unnecessary notifications while studying.',
      'Use reminders or alarms: Set alerts for study sessions, deadlines, and important tasks.',
      'Follow the Pomodoro technique: Study for 25 minutes, then take a 5-minute break.',
      'Prepare the next day in advance: Plan books, tasks, and goals the night before.',
      'Track how you spend time: Notice where time is wasted and improve gradually.',
      'Maintain balance: Include sleep, exercise, and relaxation so you don\'t feel tired or overwhelmed.'
    ],
    'Lack of Emotional Expression': [
      'Start by identifying your feelings – Try to name what you feel (happy, sad, stressed, confused, etc.).',
      'Write a daily journal – Writing thoughts helps express emotions safely and clearly.',
      'Talk to a trusted person – Share feelings with a friend, parent, teacher, or mentor.',
      'Use creative expression – Drawing, music, dance, or writing can help release emotions.',
      'Practice speaking slowly about feelings – Start with simple sentences like “I feel worried today.”',
      'Avoid bottling up emotions – Keeping everything inside can increase stress over time.',
      'Learn emotional vocabulary – Knowing more feeling words makes expression easier.',
      'Practice active listening – When you listen to others openly, you also become more comfortable sharing.',
      'Use mood-tracking apps or notes – Tracking emotions daily builds awareness.',
      'Be patient with yourself – Emotional expression is a skill that improves step by step.'
    ],
    'Overuse of Mobile Phones & Gaming': [
      'Set Daily Time Limits: Decide a fixed time for gaming or social media (for example, 1 hour per day). Stick to it strictly.',
      'Keep the Phone Away While Studying: Keep your phone in another room or on silent mode during study time. Out of sight = out of mind.',
      'Use Apps to Track Screen Time: Check how many hours you spend daily. Awareness itself reduces overuse.',
      'Avoid Using Mobile Before Sleep: Using your phone late at night affects sleep and concentration the next day.',
      'Replace Gaming With Productive Activities: Try sports, reading, drawing, or learning a new skill. Real-world activities give long-term benefits.',
      'Turn Off Unnecessary Notifications: Constant notifications increase the urge to check your phone again and again.',
      'Don’t Use Mobile as Stress Escape: Instead of escaping problems through gaming, solve them step by step.',
      'Create a “No Phone” Zone: For example: Dining table, study desk, family time. This builds discipline.',
      'Spend More Time With Family and Friends: Face-to-face conversations improve emotional health more than online chats.',
      'Remember Your Goals: Ask yourself: “Is this helping my future?” If the answer is no, reduce it.'
    ],
    'Financial & Family Problems': [
      'Accept the Situation Calmly: Problems are temporary. Panicking won’t solve them. Accepting reality helps you think clearly.',
      'Don’t Blame Yourself: Financial or family issues are not your fault. Avoid carrying guilt for things beyond your control.',
      'Focus on Your Education: Education can be your long-term solution. Stay committed to your studies even during difficult times.',
      'Talk to Someone You Trust: Share your feelings with a parent, teacher, close friend, or counselor. Talking reduces emotional burden.',
      'Learn Basic Money Management: Understand saving habits, avoiding unnecessary expenses, and planning simple budgets. This builds responsibility and confidence.',
      'Look for Scholarships or Support: If financial stress affects studies, explore school/college scholarships, government schemes, and fee concessions. Many students don’t apply simply because they don’t ask.',
      'Avoid Comparing Your Situation: Every family has different struggles. Comparison increases stress and lowers confidence.',
      'Help at Home in Small Ways: Support your family emotionally and practically by helping with household work, being responsible, and avoiding unnecessary demands. Small support matters.',
      'Take Care of Your Mental Health: Exercise, proper sleep, and positive thinking are important during stressful times.',
      'Believe That Tough Times Don’t Last Forever: Many successful people grew up with financial or family struggles. Hard times often build strong character.'
    ],
    'Overthinking': [
      'Identify Your Triggers: Notice when you overthink—before exams, after conversations, at night. Understanding the pattern helps you manage it.',
      'Focus on What You Can Control: Ask yourself “Can I control this?” If yes → take action. If no → let it go.',
      'Set a Time Limit for Thinking: Give yourself 10–15 minutes to think about a problem. After that, shift your focus to action.',
      'Write Your Thoughts Down: Writing helps clear your mind. When thoughts are on paper, they feel less heavy.',
      'Stay Busy With Productive Activities: Exercise, studying, hobbies, or helping at home keep your brain active in a positive way.',
      'Practice Deep Breathing: Slow breathing calms the nervous system and reduces mental noise.',
      'Avoid Worst-Case Thinking: Don’t automatically assume the worst. Ask: “Is there real evidence for this fear?”',
      'Reduce Social Media Use: Too much scrolling increases comparison and unnecessary thoughts.',
      'Talk to Someone You Trust: Sharing your thoughts with a friend, parent, or teacher often makes problems feel smaller.',
      'Accept Imperfection: Not everything will be perfect — and that’s okay. Mistakes and uncertainty are part of life.'
    ]
  };

  const monthKey = getCurrentMonthKey();
  const checklistHistory = JSON.parse(localStorage.getItem(CHECKLIST_HISTORY_KEY) || '{}');
  const stressHistory = JSON.parse(localStorage.getItem(STRESS_HISTORY_KEY) || '{}');
  const checklistMonthlyAverage = getMonthlyAverage(checklistHistory, monthKey);
  const stressMonthlyAverage = getMonthlyAverage(stressHistory, monthKey);
  const combinedMonthlyAverage = Math.round((checklistMonthlyAverage + stressMonthlyAverage) / 2);
  const rewardCoins = getRewardCoins(checklistMonthlyAverage, stressMonthlyAverage);
  const hasClaimedThisMonth = wallet.lastRewardMonth === monthKey;

  const claimMonthlyReward = () => {
    if (hasClaimedThisMonth || rewardCoins === 0) {
      return;
    }

    const updatedWallet = {
      balance: wallet.balance + rewardCoins,
      lastRewardMonth: monthKey,
      transactions: [
        {
          month: monthKey,
          coins: rewardCoins,
          checklistMonthlyAverage,
          stressMonthlyAverage,
          combinedMonthlyAverage,
          rewardedOn: new Date().toISOString()
        },
        ...wallet.transactions
      ].slice(0, 6)
    };

    setWallet(updatedWallet);
    localStorage.setItem(STUDENT_WALLET_KEY, JSON.stringify(updatedWallet));
  };


  return (
    <div className="db-container">
      <header className="db-header">
        <div className="db-brand-block">
          <h1>MindMate</h1>
          <div className="db-tools-row">
            <button
              className="db-tool-btn"
              onClick={() => setShowChecklist(true)}
              aria-label="Open daily checklist"
              title="Daily Checklist"
            >
              <span className="db-tool-icon">📝</span>
              <span className="db-tool-text">Checklist</span>
            </button>
            <button
              className="db-tool-btn"
              onClick={() => setShowStressAnalysis(true)}
              aria-label="Open stress analysis"
              title="Stress Analysis"
            >
              <span className="db-tool-icon">🌡️</span>
              <span className="db-tool-text">Stress Meter</span>
            </button>
          </div>
        </div>
        <div className="db-actions">
          <button className="db-logout" onClick={onLogout}>Logout</button>
          <button
            className="db-wallet-btn"
            onClick={() => setShowWallet(true)}
            aria-label="Open student wallet"
            title="Student Wallet"
          >
            🪙 Wallet: {wallet.balance}
          </button>
        </div>
      </header>
      <p className="db-welcome">Welcome, <strong>{userName}</strong>!</p>
      <div className="db-question">How are you feeling today?</div>
      <div className="db-moods">
        {moods.map(m => (
          <button
            key={m.key}
            className={`db-mood ${selectedMood === m.key ? 'selected' : ''}`}
            onClick={() => setSelectedMood(m.key)}
          >
            <span className="emoji">{m.emoji}</span>
            <span className="label">{m.label}</span>
          </button>
        ))}
      </div>
      {selectedMood && (
        <div className="db-selected">You selected <strong>{selectedMood}</strong></div>
      )}

      {(selectedMood === 'fantastic' || selectedMood === 'good') && suggestions[selectedMood] && (
        <div className="db-suggestions">
          <h4>Here are some helpful tips:</h4>
          <ul className="db-suggestions-list">
            {suggestions[selectedMood].map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {(selectedMood === 'bad' || selectedMood === 'depressed') && (
        <div className="db-issues-section">
          <h3>What's bothering you?</h3>
          <div className="db-issues-grid">
            {issues.map((issue, idx) => (
              <button
                key={idx}
                className={`db-issue ${selectedIssue === issue ? 'selected' : ''}`}
                onClick={() => setSelectedIssue(issue)}
              >
                {issue}
              </button>
            ))}
          </div>
          {selectedIssue && (
            <div className="db-issue-selected">
              You mentioned: <strong>{selectedIssue}</strong>
            </div>
          )}

          {selectedIssue && suggestions[selectedIssue] && (
            <div className="db-suggestions">
              <h4>Here are some helpful tips:</h4>
              <ul className="db-suggestions-list">
                {suggestions[selectedIssue].map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {showWallet && (
        <div className="db-wallet-overlay">
          <div className="db-wallet-modal">
            <div className="db-wallet-header">
              <h3>Digital Student Wallet</h3>
              <button className="db-wallet-close" onClick={() => setShowWallet(false)}>✕</button>
            </div>

            <div className="db-wallet-body">
              <div className="db-wallet-balance">Total Coins: <strong>{wallet.balance}</strong></div>

              <div className="db-monthly-report">
                <p><strong>Monthly Report ({monthKey})</strong></p>
                <p>Checklist Score: {checklistMonthlyAverage}%</p>
                <p>Stress Score: {stressMonthlyAverage}%</p>
                <p>Combined Score: {combinedMonthlyAverage}%</p>
              </div>

              <div className="db-reward-status">
                {rewardCoins > 0 ? (
                  <p>You are eligible for <strong>{rewardCoins} coins</strong> this month.</p>
                ) : (
                  <p>Reach at least 60% in both checklist and stress score to unlock monthly coins.</p>
                )}

                <button
                  className="db-claim-btn"
                  onClick={claimMonthlyReward}
                  disabled={hasClaimedThisMonth || rewardCoins === 0}
                >
                  {hasClaimedThisMonth ? 'Reward Claimed for This Month' : 'Claim Monthly Reward'}
                </button>
              </div>

              <div className="db-wallet-history">
                <h4>Recent Rewards</h4>
                {wallet.transactions.length === 0 ? (
                  <p>No rewards yet. Keep tracking daily!</p>
                ) : (
                  <ul>
                    {wallet.transactions.map((item, index) => (
                      <li key={`${item.month}-${index}`}>
                        {item.month}: +{item.coins} coins (Checklist {item.checklistMonthlyAverage}%, Stress {item.stressMonthlyAverage}%)
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showChecklist && <Checklist onClose={() => setShowChecklist(false)} />}
      {showStressAnalysis && <StressAnalysis onClose={() => setShowStressAnalysis(false)} />}
    </div>
  );
}

export default Dashboard;