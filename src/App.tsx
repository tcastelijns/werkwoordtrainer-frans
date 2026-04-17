/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  XCircle, RefreshCcw, Trophy, ChevronRight, Check, 
  ArrowLeft, Flame, Star, Sparkles, Award, BookOpen, 
  Lock, Sun, Moon
} from 'lucide-react';

import verbData from './data/verbs.json';
import { BADGES } from './data/badges';

// --- Data & Logic ---

const { 
  verbGroups: VERB_GROUPS, 
  verbsList: VERBS_LIST, 
  tenses: TENSES, 
  subjects: SUBJECTS
} = verbData;

// --- Components ---

type GameState = 'start' | 'playing' | 'result';

interface Question {
  verb: typeof VERBS_LIST[0];
  subject: typeof SUBJECTS[0];
  tense: typeof TENSES[0];
  correctAnswer: string;
  dutchQuestion: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [selectedIrregularIds, setSelectedIrregularIds] = useState<string[]>([]);
  const [selectedTenses, setSelectedTenses] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [initialQuestionCount, setInitialQuestionCount] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [levelAtStart, setLevelAtStart] = useState(1);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string; canTryAgain?: boolean } | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [purchasedHintLevel, setPurchasedHintLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [allFirstTry, setAllFirstTry] = useState(true);
  const [streak, setStreak] = useState<{ count: number; lastDate: string | null }>({ count: 0, lastDate: null });
  const [totalXp, setTotalXp] = useState(0);
  const [xpPopups, setXpPopups] = useState<{ id: number; amount: number }[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalCorrect: 0,
    totalErCorrect: 0,
    totalIrregularCorrect: 0,
    maxCorrectStreak: 0,
    currentCorrectStreak: 0,
    quizzesCompleted: 0
  });
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [newBadge, setNewBadge] = useState<typeof BADGES[0] | null>(null);
  const [showBadgeWall, setShowBadgeWall] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [referenceSearch, setReferenceSearch] = useState('');
  const [selectedVerbId, setSelectedVerbId] = useState<string | null>(null);
  const [selectedReferenceCategory, setSelectedReferenceCategory] = useState<string>('all');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('french_verb_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('french_verb_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('french_verb_theme', 'light');
    }
  }, [isDarkMode]);

  const getLevelInfo = (xp: number) => {
    let level = 1;
    let xpInLevel = xp;
    let nextLevelXp = 100;

    while (xpInLevel >= nextLevelXp) {
      xpInLevel -= nextLevelXp;
      level++;
      nextLevelXp += 100;
    }

    let title = "Débutant";
    if (level >= 36) title = "Maître des Verbes";
    else if (level >= 21) title = "Expert";
    else if (level >= 11) title = "Connaisseur";
    else if (level >= 6) title = "Apprenti";

    return { level, xpInLevel, nextLevelXp, title, progress: (xpInLevel / nextLevelXp) * 100 };
  };

  const levelInfo = useMemo(() => getLevelInfo(totalXp), [totalXp]);

  useEffect(() => {
    const savedStreak = localStorage.getItem('french_verb_streak');
    if (savedStreak) {
      const data = JSON.parse(savedStreak);
      const today = new Date().toISOString().split('T')[0];
      const last = new Date(data.lastDate);
      const current = new Date(today);
      const diffTime = Math.abs(current.getTime() - last.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        setStreak({ count: 0, lastDate: data.lastDate });
      } else {
        setStreak(data);
      }
    }

    const savedXp = localStorage.getItem('french_verb_xp');
    if (savedXp) {
      setTotalXp(parseInt(savedXp, 10));
    }

    const savedBadges = localStorage.getItem('french_verb_badges');
    if (savedBadges) {
      setUnlockedBadges(JSON.parse(savedBadges));
    }

    const savedStats = localStorage.getItem('french_verb_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  const unlockBadge = (badgeId: string) => {
    if (unlockedBadges.includes(badgeId)) return;
    
    const badge = BADGES.find(b => b.id === badgeId);
    if (badge) {
      setNewBadge(badge);
      const updated = [...unlockedBadges, badgeId];
      setUnlockedBadges(updated);
      localStorage.setItem('french_verb_badges', JSON.stringify(updated));
    }
  };

  const addXp = (amount: number) => {
    const newXp = totalXp + amount;
    setTotalXp(newXp);
    setSessionXp(prev => prev + amount);
    localStorage.setItem('french_verb_xp', newXp.toString());
    
    const id = Date.now();
    setXpPopups(prev => [...prev, { id, amount }]);
    setTimeout(() => {
      setXpPopups(prev => prev.filter(p => p.id !== id));
    }, 1000);
  };

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = streak.lastDate;

    if (lastDate === today) return;

    let newCount = 1;
    if (lastDate) {
      const last = new Date(lastDate);
      const current = new Date(today);
      const diffTime = Math.abs(current.getTime() - last.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newCount = streak.count + 1;
      }
    }

    const newData = { count: newCount, lastDate: today };
    setStreak(newData);
    localStorage.setItem('french_verb_streak', JSON.stringify(newData));
  };

  const toggleGroup = (id: string) => {
    setSelectedGroupIds(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const toggleIrregular = (id: string) => {
    setSelectedIrregularIds(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const toggleTense = (id: string) => {
    setSelectedTenses(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const selectAllGroups = () => setSelectedGroupIds(VERB_GROUPS.filter(g => g.id !== 'irregular').map(g => g.id));
  const deselectAllGroups = () => setSelectedGroupIds([]);
  const selectAllIrregulars = () => setSelectedIrregularIds(VERBS_LIST.filter(v => v.categoryId === 'irregular').map(v => v.id));
  const deselectAllIrregulars = () => setSelectedIrregularIds([]);
  const selectAllTenses = () => setSelectedTenses(TENSES.map(t => t.id));
  const deselectAllTenses = () => setSelectedTenses([]);

  const generateQuiz = () => {
    if ((selectedGroupIds.length === 0 && selectedIrregularIds.length === 0) || selectedTenses.length === 0) return;

    const availableVerbs = [
      ...VERBS_LIST.filter(v => selectedGroupIds.includes(v.categoryId)),
      ...VERBS_LIST.filter(v => selectedIrregularIds.includes(v.id))
    ];
    
    if (availableVerbs.length === 0) return;

    const newQuestions: Question[] = [];
    for (let i = 0; i < questionCount; i++) {
      const verb = availableVerbs[Math.floor(Math.random() * availableVerbs.length)];
      const tenseId = selectedTenses[Math.floor(Math.random() * selectedTenses.length)];
      const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
      
      const tense = TENSES.find(t => t.id === tenseId)!;
      const subIdx = SUBJECTS.findIndex(s => s.id === subject.id);
      const correctAnswer = (verb as any).conjugations[tenseId].french[subIdx];
      const dutchQuestion = (verb as any).conjugations[tenseId].dutch[subIdx];

      newQuestions.push({
        verb,
        subject,
        tense,
        correctAnswer,
        dutchQuestion,
      });
    }
    setQuestions(newQuestions);
    setInitialQuestionCount(newQuestions.length);
    setCurrentIndex(0);
    setScore(0);
    setAttempts(0);
    setAllFirstTry(true);
    setSessionXp(0);
    setLevelAtStart(levelInfo.level);
    setGameState('playing');
    setFeedback(null);
    setHintLevel(0);
    setPurchasedHintLevel(0);
    setUserAnswer('');
    setSessionStartTime(Date.now());
  };

  const handleHintClick = () => {
    if (hintLevel === 0) {
      // First hint: Translation (-25 XP)
      if (purchasedHintLevel >= 1) {
        setHintLevel(1);
      } else if (totalXp >= 25) {
        addXp(-25);
        setHintLevel(1);
        setPurchasedHintLevel(1);
      }
    } else if (hintLevel === 1) {
      // Second hint: Tense (-50 XP)
      if (purchasedHintLevel >= 2) {
        setHintLevel(2);
      } else if (totalXp >= 50) {
        addXp(-50);
        setHintLevel(2);
        setPurchasedHintLevel(2);
      }
    } else if (hintLevel === 2) {
      // Third hint: Correct Answer (-75 XP)
      if (purchasedHintLevel >= 3) {
        setHintLevel(3);
      } else if (totalXp >= 75) {
        addXp(-75);
        setHintLevel(3);
        setPurchasedHintLevel(3);
      }
    } else {
      // Reset
      setHintLevel(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If feedback is already shown and we can't try again, proceed to next question
    if (feedback && !feedback.canTryAgain) {
      nextQuestion();
      return;
    }

    // If no answer is typed, don't do anything
    if (!userAnswer.trim()) return;

    const currentQuestion = questions[currentIndex];
    const normalizedUser = userAnswer.trim().toLowerCase().replace(/[’']/g, "'");
    const normalizedCorrect = currentQuestion.correctAnswer.toLowerCase().replace(/[’']/g, "'");
    
    const isCorrect = normalizedUser === normalizedCorrect;

    // Update the question with the user's answer and result
    setQuestions(prev => {
      const updated = [...prev];
      updated[currentIndex] = {
        ...updated[currentIndex],
        userAnswer: normalizedUser,
        isCorrect: isCorrect
      };

      // If incorrect after 2 attempts, add to the end of the queue
      if (!isCorrect && attempts + 1 >= 2) {
        updated.push({
          ...currentQuestion,
          userAnswer: undefined,
          isCorrect: undefined
        });
      }
      
      return updated;
    });

    if (isCorrect) {
      setScore((s) => s + 1);
      setFeedback({ isCorrect: true, message: 'Bien !' });
      
      // XP logic: 10 for first try, 5 for hint 1, 2 for hint 2
      // Actually, since hints cost XP upfront now, we just give a standard 10 XP for correct
      let xpAmount = 10;
      addXp(xpAmount);

      // Update stats
      setStats(prev => {
        const newCurrentStreak = prev.currentCorrectStreak + 1;
        const newStats = {
          ...prev,
          totalCorrect: prev.totalCorrect + 1,
          totalErCorrect: currentQuestion.verb.categoryId === 'reg-er' ? prev.totalErCorrect + 1 : prev.totalErCorrect,
          totalIrregularCorrect: currentQuestion.verb.categoryId === 'irregular' ? prev.totalIrregularCorrect + 1 : prev.totalIrregularCorrect,
          currentCorrectStreak: newCurrentStreak,
          maxCorrectStreak: Math.max(prev.maxCorrectStreak, newCurrentStreak)
        };
        localStorage.setItem('french_verb_stats', JSON.stringify(newStats));
        
        // Check for "Invincible" badge (50 in a row)
        if (newStats.maxCorrectStreak >= 50) {
          setTimeout(() => unlockBadge('invincible'), 500);
        }
        // Check for "Verbe-ivore" (100 total)
        if (newStats.totalCorrect >= 100) {
          setTimeout(() => unlockBadge('verbe_ivore'), 500);
        }
        // Check for "Maître d'ER" (50 total)
        if (newStats.totalErCorrect >= 50) {
          setTimeout(() => unlockBadge('maitre_er'), 500);
        }
        // Check for "Dompteur de Dragons" (50 total)
        if (newStats.totalIrregularCorrect >= 50) {
          setTimeout(() => unlockBadge('dompteur_dragons'), 500);
        }

        return newStats;
      });
    } else {
      setAllFirstTry(false);
      setStats(prev => ({ ...prev, currentCorrectStreak: 0 }));
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts < 2) {
        setFeedback({ 
          isCorrect: false, 
          message: 'Pas tout à fait correct, réessayez !',
          canTryAgain: true 
        });
      } else {
        setFeedback({ 
          isCorrect: false, 
          message: `Faux. La réponse correcte est : ${currentQuestion.correctAnswer}` 
        });
      }
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setUserAnswer('');
      setFeedback(null);
      setHintLevel(0);
      setPurchasedHintLevel(0);
      setAttempts(0);
    } else {
      updateStreak();
      // Bonus XP for finishing
      let bonus = 20;
      if (allFirstTry && score === initialQuestionCount) bonus += 50;
      addXp(bonus);

      // Badge checks at end of session
      const duration = (Date.now() - (sessionStartTime || Date.now())) / 1000;
      
      // Premiers Pas
      unlockBadge('premiers_pas');
      
      // Perfectionniste (min 15 questions)
      if (allFirstTry && score === initialQuestionCount && initialQuestionCount >= 15) {
        unlockBadge('perfectionniste');
      }
      
      // L'Éclair (10 questions in < 60s)
      if (initialQuestionCount >= 10 && duration < 60 && score / initialQuestionCount >= 0.8) {
        unlockBadge('leclair');
      }

      // Streak badges
      if (streak.count >= 7) unlockBadge('serie_7');
      if (streak.count >= 30) unlockBadge('fidele');

      setStats(prev => {
        const newStats = { ...prev, quizzesCompleted: prev.quizzesCompleted + 1 };
        localStorage.setItem('french_verb_stats', JSON.stringify(newStats));
        return newStats;
      });

      setGameState('result');
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && !feedback && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, currentIndex, feedback]);

  return (
    <div className="min-h-screen transition-colors duration-500 bg-theme-bg text-theme-text font-sans selection:bg-brand-200 flex flex-col items-center p-4 pt-12">
      <div className="w-full max-w-5xl relative">
        <div className="absolute top-0 right-0 z-50 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 rounded-full bg-theme-surface border border-theme-border shadow-sm text-theme-text-secondary hover:text-brand-500 hover:border-brand-400 transition-all flex items-center justify-center"
            title={isDarkMode ? "Licht modus" : "Donkere modus"}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400 fill-yellow-400 opacity-90" /> : <Moon className="w-5 h-5" />}
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'start' && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-16 py-8"
            >
              <div className="text-center space-y-8">
                <div className="space-y-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <h1 className="text-7xl md:text-8xl font-serif font-semibold tracking-tight text-accent-600 drop-shadow-sm">
                      Werkwoordtrainer Frans
                    </h1>
                  </motion.div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="text-left">
                        <span className="text-xs font-bold text-brand-500 uppercase tracking-wider">Niveau {levelInfo.level}</span>
                        <h3 className="text-lg font-serif font-bold text-theme-text leading-tight">{levelInfo.title}</h3>
                      </div>
                      <span className="text-xs font-medium text-theme-text-muted">{levelInfo.xpInLevel} / {levelInfo.nextLevelXp} XP</span>
                    </div>
                    <div className="h-2 w-full bg-theme-subtle rounded-full overflow-hidden border border-theme-border-strong/50">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${levelInfo.progress}%` }}
                        className="h-full bg-gradient-to-r from-brand-500 to-brand-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    {streak.count > 0 && (
                      <motion.div 
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="flex items-center gap-2 bg-accent-50 px-4 py-2 rounded-full border border-accent-100 shadow-sm"
                      >
                        <Flame className="w-5 h-5 text-accent-500 fill-accent-500" />
                        <span className="text-sm font-bold text-accent-700">{streak.count} {streak.count === 1 ? 'JOUR' : 'JOURS'}</span>
                      </motion.div>
                    )}
                    <motion.div 
                      initial={{ scale: 0, rotate: 10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="flex items-center gap-2 bg-brand-50 px-4 py-2 rounded-full border border-brand-100 shadow-sm"
                    >
                      <Star className="w-5 h-5 text-brand-500 fill-brand-500" />
                      <span className="text-sm font-bold text-brand-700">{totalXp} XP</span>
                    </motion.div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowBadgeWall(true)}
                      className="flex items-center gap-2 bg-theme-surface px-4 py-2 rounded-full border border-theme-border shadow-sm hover:border-brand-400 hover:text-brand-500 transition-all group"
                    >
                      <Award className="w-5 h-5 text-brand-500 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-bold text-theme-text-secondary group-hover:text-theme-text transition-colors">Mes Insignes</span>
                      <div className="bg-brand-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                        {unlockedBadges.length}
                      </div>
                    </motion.button>

                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowReference(true);
                        if (!selectedVerbId && VERBS_LIST.length > 0) {
                          setSelectedVerbId(VERBS_LIST[0].id);
                        }
                      }}
                      className="flex items-center gap-2 bg-theme-surface px-4 py-2 rounded-full border border-theme-border shadow-sm hover:border-brand-400 hover:text-brand-500 transition-all group"
                    >
                      <BookOpen className="w-5 h-5 text-brand-500 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-bold text-theme-text-secondary group-hover:text-theme-text transition-colors">Naslagwerk</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Regular Verbs Column */}
                <div className="glass-card p-8 rounded-[2.5rem] space-y-8 lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="flex justify-between items-end border-b border-brand-100 pb-4">
                        <h3 className="font-serif text-2xl font-medium text-theme-text">Réguliers</h3>
                        <div className="flex gap-3">
                          <button onClick={selectAllGroups} className="text-[10px] uppercase tracking-wider text-accent-600 font-bold hover:text-accent-700 transition-colors">Tout</button>
                          <button onClick={deselectAllGroups} className="text-[10px] uppercase tracking-wider text-theme-text-muted font-bold hover:text-theme-text-secondary transition-colors">Aucun</button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {VERB_GROUPS.filter(g => g.id !== 'irregular').map(group => (
                          <button
                            key={group.id}
                            onClick={() => toggleGroup(group.id)}
                            className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-base font-medium transition-all text-left group ${
                              selectedGroupIds.includes(group.id) 
                                ? 'bg-brand-500 text-white shadow-lg shadow-brand-200' 
                                : 'bg-theme-surface text-theme-text-secondary border border-theme-border hover:border-brand-200 hover:bg-theme-subtle/50'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${selectedGroupIds.includes(group.id) ? 'bg-white/20' : 'bg-theme-subtle group-hover:bg-brand-100'}`}>
                              {selectedGroupIds.includes(group.id) ? <Check className="w-4 h-4" /> : null}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-base">{group.label}</div>
                              <div className={`text-xs italic ${selectedGroupIds.includes(group.id) ? 'text-brand-100' : 'text-theme-text-muted'}`}>
                                bijv. {VERBS_LIST.filter(v => v.categoryId === group.id).slice(0, 3).map(v => v.infinitive).join(', ')}...
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-end border-b border-brand-100 pb-4">
                        <h3 className="font-serif text-2xl font-medium text-theme-text">Irréguliers</h3>
                        <div className="flex gap-3">
                          <button onClick={selectAllIrregulars} className="text-[10px] uppercase tracking-wider text-accent-600 font-bold hover:text-accent-700 transition-colors">Tout</button>
                          <button onClick={deselectAllIrregulars} className="text-[10px] uppercase tracking-wider text-theme-text-muted font-bold hover:text-theme-text-secondary transition-colors">Aucun</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-3 custom-scrollbar">
                        {VERBS_LIST.filter(v => v.categoryId === 'irregular').map(verb => (
                          <button
                            key={verb.id}
                            onClick={() => toggleIrregular(verb.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left border ${
                              selectedIrregularIds.includes(verb.id) 
                                ? 'bg-brand-500 text-white shadow-lg shadow-brand-200 border-transparent' 
                                : 'bg-theme-surface text-theme-text-secondary border-theme-border hover:border-brand-100 hover:bg-theme-subtle/30'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${selectedIrregularIds.includes(verb.id) ? 'bg-white/20' : 'bg-theme-subtle'}`}>
                              {selectedIrregularIds.includes(verb.id) ? <Check className="w-3 h-3" /> : null}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-base font-bold truncate">
                                {verb.infinitive}
                              </div>
                              <div className={`text-[10px] truncate italic ${selectedIrregularIds.includes(verb.id) ? 'text-brand-100' : 'text-theme-text-muted'}`}>
                                {verb.translation}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tenses Column */}
                <div className="glass-card p-8 rounded-[2.5rem] space-y-6 h-fit">
                  <div className="flex justify-between items-end border-b border-brand-100 pb-4">
                    <h3 className="font-serif text-2xl font-medium text-theme-text">Temps</h3>
                    <div className="flex gap-3">
                      <button onClick={selectAllTenses} className="text-[10px] uppercase tracking-wider text-accent-600 font-bold hover:text-accent-700 transition-colors">Tout</button>
                      <button onClick={deselectAllTenses} className="text-[10px] uppercase tracking-wider text-theme-text-muted font-bold hover:text-theme-text-secondary transition-colors">Aucun</button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {TENSES.map(tense => (
                      <button
                        key={tense.id}
                        onClick={() => toggleTense(tense.id)}
                        className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-base font-medium transition-all text-left group ${
                          selectedTenses.includes(tense.id) 
                            ? 'bg-brand-500 text-white shadow-lg shadow-brand-200' 
                            : 'bg-theme-surface text-theme-text-secondary border border-theme-border hover:border-brand-200 hover:bg-theme-subtle/50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${selectedTenses.includes(tense.id) ? 'bg-white/20' : 'bg-theme-subtle group-hover:bg-brand-100'}`}>
                          {selectedTenses.includes(tense.id) ? <Check className="w-4 h-4" /> : null}
                        </div>
                        <span className="flex-1 font-bold">{tense.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-12">
                <div className="w-full max-md glass-card p-8 rounded-3xl space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold uppercase tracking-widest text-theme-text-muted">Nombre de questions</span>
                    <span className="text-4xl font-serif font-bold text-accent-600">{questionCount}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-theme-subtle rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                <div className="flex flex-col items-center gap-6">
                  <button
                    onClick={generateQuiz}
                    disabled={(selectedGroupIds.length === 0 && selectedIrregularIds.length === 0) || selectedTenses.length === 0}
                    className="neo-button group relative inline-flex items-center gap-4 px-16 py-6 bg-accent-600 text-white rounded-full font-bold text-lg shadow-2xl shadow-accent-200 hover:bg-accent-700 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                  >
                    Commencer le quiz
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                  {((selectedGroupIds.length === 0 && selectedIrregularIds.length === 0) || selectedTenses.length === 0) && (
                    <p className="text-xs text-brand-700 font-bold uppercase tracking-tighter bg-brand-100 px-4 py-2 rounded-full">Kies minimaal één werkwoord en één tijd.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <div className="space-y-8 max-w-2xl mx-auto py-8">
              <button
                onClick={() => setGameState('start')}
                className="neo-button flex items-center gap-3 text-theme-text-muted hover:text-accent-600 transition-colors text-xs font-bold uppercase tracking-widest"
              >
                <div className="w-8 h-8 rounded-full bg-theme-surface flex items-center justify-center shadow-sm border border-theme-border">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                Retour
              </button>
              
              <motion.div
                key="playing"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="glass-card p-10 md:p-16 rounded-[3rem] space-y-12 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-theme-subtle">
                  <motion.div 
                    className="h-full bg-brand-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold text-theme-text-muted uppercase tracking-[0.2em]">
                  <span className="bg-theme-subtle px-3 py-1 rounded-full">Question {currentIndex + 1} sur {questions.length}</span>
                  <span className="text-accent-600 bg-accent-50 px-3 py-1 rounded-full">Score: {score}</span>
                </div>

                <div className="space-y-10 text-center">
                  <div className="space-y-4">
                    <h2 className="text-5xl md:text-6xl font-serif font-semibold text-theme-text leading-tight">
                      {questions[currentIndex].dutchQuestion}
                    </h2>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <button
                        type="button"
                        onClick={handleHintClick}
                        disabled={(hintLevel === 0 && purchasedHintLevel < 1 && totalXp < 25) || (hintLevel === 1 && purchasedHintLevel < 2 && totalXp < 50) || (hintLevel === 2 && purchasedHintLevel < 3 && totalXp < 75)}
                        className={`text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 px-4 py-2 rounded-full border ${
                          hintLevel === 0 
                            ? 'text-theme-text-muted border-transparent hover:text-brand-500' 
                            : 'text-brand-600 border-brand-100 bg-brand-50'
                        } disabled:opacity-30 disabled:cursor-not-allowed`}
                      >
                        <Sparkles className="w-3 h-3" />
                        {hintLevel === 0 
                          ? `Indice 1: Traduction ${purchasedHintLevel >= 1 ? '(Gratuit)' : '(-25 XP)'}` 
                          : hintLevel === 1 
                            ? `Indice 2: Temps ${purchasedHintLevel >= 2 ? '(Gratuit)' : '(-50 XP)'}` 
                            : hintLevel === 2
                              ? `Indice 3: Réponse ${purchasedHintLevel >= 3 ? '(Gratuit)' : '(-75 XP)'}`
                              : 'Masquer les indices'}
                      </button>
                      {(hintLevel === 0 && purchasedHintLevel < 1 && totalXp < 25) && (
                        <span className="text-[8px] text-accent-400 font-bold uppercase tracking-widest">Pas assez d'XP !</span>
                      )}
                      {(hintLevel === 1 && purchasedHintLevel < 2 && totalXp < 50) && (
                        <span className="text-[8px] text-accent-400 font-bold uppercase tracking-widest">Pas assez d'XP pour le 2ème indice !</span>
                      )}
                      {(hintLevel === 2 && purchasedHintLevel < 3 && totalXp < 75) && (
                        <span className="text-[8px] text-accent-400 font-bold uppercase tracking-widest">Pas assez d'XP pour la réponse !</span>
                      )}
                    </div>

                    <AnimatePresence>
                      {hintLevel >= 1 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="w-full max-w-xs space-y-3"
                        >
                          <div className="px-6 py-4 bg-theme-surface text-brand-700 rounded-3xl text-sm font-bold border border-brand-100 shadow-sm flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] uppercase tracking-[0.2em] text-brand-400 font-bold">Le Verbe</span>
                              <span className="text-xl italic font-serif">{questions[currentIndex].verb.infinitive}</span>
                            </div>
                            
                            {hintLevel >= 2 && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="pt-3 border-t border-brand-50 flex flex-col gap-1"
                                >
                                  <span className="text-[9px] uppercase tracking-[0.2em] text-brand-400 font-bold">Le Temps</span>
                                  <span className="text-lg text-theme-text-secondary">{questions[currentIndex].tense.label}</span>
                                </motion.div>
                            )}

                            {hintLevel >= 3 && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="pt-3 border-t border-brand-50 flex flex-col gap-1"
                              >
                                <span className="text-[9px] uppercase tracking-[0.2em] text-brand-400 font-bold">La Réponse</span>
                                <span className="text-xl text-brand-600 font-bold">{questions[currentIndex].correctAnswer}</span>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative group">
                    <input
                      ref={inputRef}
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      readOnly={!!feedback && !feedback.canTryAgain}
                      placeholder="Votre réponse..."
                      className="w-full px-8 py-6 bg-theme-subtle/50 border-2 border-theme-border rounded-[2rem] focus:bg-theme-surface focus:border-brand-500 focus:outline-none transition-all text-2xl font-medium text-center placeholder:text-theme-text-muted read-only:opacity-60 text-theme-text"
                    />
                    
                    <AnimatePresence>
                      {xpPopups.map(popup => (
                        <motion.div
                          key={popup.id}
                          initial={{ opacity: 0, y: 0, x: 20 }}
                          animate={{ opacity: 1, y: -40, x: 40 }}
                          exit={{ opacity: 0 }}
                          className={`absolute right-0 top-0 font-bold text-xl pointer-events-none ${popup.amount > 0 ? 'text-brand-600' : 'text-accent-500'}`}
                        >
                          {popup.amount > 0 ? `+${popup.amount}` : popup.amount} XP
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {feedback && !feedback.canTryAgain && (
                      <div className="absolute right-6 top-1/2 -translate-y-1/2">
                        {feedback.isCorrect ? (
                          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-100">
                            <Check className="w-6 h-6" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center text-white shadow-lg shadow-accent-100">
                            <XCircle className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {!feedback || feedback.canTryAgain ? (
                    <button
                      type="submit"
                      className="neo-button w-full py-6 bg-accent-600 text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-accent-200"
                    >
                      {feedback?.canTryAgain ? 'Réessayer' : 'Vérifier'}
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className={`p-6 rounded-[2rem] text-center font-bold text-lg ${feedback.isCorrect ? 'bg-green-50 text-green-700' : 'bg-accent-50 text-accent-700'}`}>
                        {feedback.message}
                      </div>
                      <button
                        type="submit"
                        className="neo-button w-full py-6 bg-accent-600 text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-accent-200 flex items-center justify-center gap-3"
                      >
                        {currentIndex < questions.length - 1 ? 'Question suivante' : 'Voir les résultats'}
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </motion.div>
                  )}
                </form>
              </motion.div>
            </div>
          )}

          {gameState === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center space-y-12 py-8"
            >
              <div className="space-y-6">
                <div className="relative inline-block">
                  <div className="absolute -inset-8 bg-brand-200 rounded-full blur-3xl opacity-30 animate-pulse" />
                  <div className="w-32 h-32 bg-theme-surface rounded-[2.5rem] shadow-2xl flex items-center justify-center relative border border-theme-border">
                    <Trophy className="w-16 h-16 text-brand-500" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-5xl font-serif font-semibold text-theme-text">Félicitations !</h2>
                  <p className="text-theme-text-muted font-medium uppercase tracking-widest text-xs">Quiz terminé avec succès</p>
                </div>

                <div className="inline-flex items-baseline gap-4 bg-theme-surface px-10 py-6 rounded-[2rem] shadow-sm border border-theme-border">
                  <span className="text-7xl font-serif font-bold text-accent-600">{score}</span>
                  <span className="text-2xl text-theme-text-muted font-medium">/ {initialQuestionCount}</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="text-accent-600 font-bold text-xl">+{sessionXp} XP</div>
                  {levelInfo.level > levelAtStart && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-brand-100 text-brand-700 px-6 py-2 rounded-full font-bold text-sm border border-brand-200 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      LEVEL UP ! Vous êtes maintenant {levelInfo.title}
                    </motion.div>
                  )}
                </div>

                {streak.count > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center gap-4"
                  >
                    <div className="flex items-center gap-2 text-accent-600 font-bold">
                      <Flame className="w-6 h-6 fill-accent-500" />
                      <span>Streak de {streak.count} {streak.count === 1 ? 'jour' : 'jours'} !</span>
                    </div>
                    <div className="flex items-center gap-2 text-brand-600 font-bold">
                      <Sparkles className="w-6 h-6 fill-brand-500" />
                      <span>Niveau {levelInfo.level} : {levelInfo.title}</span>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="glass-card rounded-[2.5rem] overflow-hidden">
                <div className="bg-theme-bg/80 backdrop-blur-md px-8 py-6 text-left flex justify-between items-center border-b border-theme-border">
                  <h3 className="font-serif text-2xl font-medium text-theme-text">Récapitulatif</h3>
                  <div className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">Détails des réponses</div>
                </div>
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar bg-theme-surface/30">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-theme-surface/90 backdrop-blur-md z-10">
                      <tr className="text-theme-text-muted font-bold uppercase tracking-[0.15em] text-[10px] border-b border-theme-border">
                        <th className="px-8 py-5">Question</th>
                        <th className="px-8 py-5">Votre réponse</th>
                        <th className="px-8 py-5">Réponse correcte</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-theme-border">
                      {questions.map((q, idx) => (
                        <tr key={idx} className="hover:bg-theme-subtle transition-colors group">
                          <td className="px-8 py-6">
                            <div className="font-serif text-lg font-medium text-theme-text">{q.dutchQuestion}</div>
                            <div className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mt-1">{q.tense.label}</div>
                          </td>
                          <td className="px-8 py-6">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${q.isCorrect ? 'bg-green-500/10 text-green-500' : 'bg-accent-500/10 text-accent-500'}`}>
                              {q.isCorrect ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {q.userAnswer || '-'}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-sm font-bold text-theme-text bg-theme-subtle px-4 py-2 rounded-xl inline-block">
                              {q.correctAnswer}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-6 pb-12">
                <button
                  onClick={() => setGameState('start')}
                  className="neo-button inline-flex items-center gap-4 px-12 py-6 bg-accent-600 text-white rounded-full font-bold shadow-2xl shadow-accent-200 hover:bg-accent-700 active:scale-95 transition-all"
                >
                  <RefreshCcw className="w-5 h-5" />
                  Nouvelle Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <footer className="mt-auto py-12 text-[10px] text-accent-400 font-bold tracking-[0.3em] uppercase">
        Werkwoordtrainer Frans - contact: cst@clz.nl
      </footer>

      {/* Badge Notification */}
      <AnimatePresence>
        {newBadge && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
          >
            <div className="bg-theme-surface text-theme-text p-6 rounded-3xl shadow-2xl border border-theme-border flex items-center gap-6">
              <div className={`w-16 h-16 ${newBadge.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                <newBadge.icon className={`w-10 h-10 ${newBadge.color}`} />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">Insigne Débloqué !</div>
                <h4 className="text-xl font-serif font-bold mb-1">{newBadge.label}</h4>
                <p className="text-theme-text-muted text-xs">{newBadge.description}</p>
              </div>
              <button 
                onClick={() => setNewBadge(null)}
                className="text-theme-text-muted hover:text-theme-text transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge Wall Modal */}
      <AnimatePresence>
        {showBadgeWall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-bg/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-theme-surface w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 bg-theme-bg/80 backdrop-blur-md text-theme-text flex justify-between items-center border-b border-theme-border">
                <div>
                  <h3 className="text-3xl font-serif font-bold">Mes Insignes</h3>
                  <p className="text-theme-text-muted text-xs uppercase tracking-widest mt-1">
                    {unlockedBadges.length} sur {BADGES.length} débloqués
                  </p>
                </div>
                <button 
                  onClick={() => setShowBadgeWall(false)}
                  className="w-12 h-12 rounded-full bg-theme-subtle flex items-center justify-center hover:bg-theme-subtle/80 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar grid grid-cols-2 md:grid-cols-3 gap-6">
                {BADGES.map(badge => {
                  const isUnlocked = unlockedBadges.includes(badge.id);
                  return (
                    <div 
                      key={badge.id}
                      className={`relative p-6 rounded-3xl border transition-all flex flex-col items-center text-center gap-4 ${
                        isUnlocked 
                          ? 'bg-theme-surface border-theme-border shadow-sm' 
                          : 'bg-theme-subtle border-transparent opacity-60 grayscale'
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isUnlocked ? badge.bg : 'bg-theme-subtle'}`}>
                        {isUnlocked ? (
                          <badge.icon className={`w-10 h-10 ${badge.color}`} />
                        ) : (
                          <Lock className="w-8 h-8 text-theme-text-muted" />
                        )}
                      </div>
                      <div>
                        <h5 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-theme-text' : 'text-theme-text-muted'}`}>
                          {badge.label}
                        </h5>
                        <p className="text-[10px] text-theme-text-muted leading-tight">
                          {badge.description}
                        </p>
                      </div>
                      {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-theme-subtle/20 backdrop-blur-[1px] rounded-3xl" />
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="p-8 bg-theme-subtle/50 border-t border-theme-border flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-theme-text">{stats.totalCorrect}</div>
                    <div className="text-[8px] text-theme-text-muted uppercase tracking-widest">Corrects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-theme-text">{stats.maxCorrectStreak}</div>
                    <div className="text-[8px] text-theme-text-muted uppercase tracking-widest">Max Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-theme-text">{stats.quizzesCompleted}</div>
                    <div className="text-[8px] text-theme-text-muted uppercase tracking-widest">Quiz</div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowBadgeWall(false)}
                  className="px-8 py-3 bg-accent-600 text-white rounded-full font-bold text-sm shadow-lg shadow-accent-200"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reference Modal */}
      <AnimatePresence>
        {showReference && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-theme-bg/40 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-theme-surface w-full max-w-6xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-theme-border"
            >
              <div className="p-8 border-b border-theme-border flex justify-between items-center bg-theme-surface sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-50 rounded-2xl">
                    <BookOpen className="w-6 h-6 text-brand-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-serif font-bold text-theme-text">Naslagwerk</h2>
                    <p className="text-theme-text-muted text-sm">Bekijk alle vervoegingen van de Franse werkwoorden</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowReference(false);
                    setSelectedVerbId(null);
                    setReferenceSearch('');
                  }}
                  className="p-2 hover:bg-theme-subtle rounded-full transition-colors"
                >
                  <XCircle className="w-8 h-8 text-theme-text-muted hover:text-theme-text-secondary" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Sidebar: Verb List */}
                <div className="w-full md:w-80 border-r border-theme-border flex flex-col bg-theme-subtle/30">
                  <div className="p-4 space-y-4">
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="Zoek een werkwoord..."
                        value={referenceSearch}
                        onChange={(e) => setReferenceSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-theme-surface border border-theme-border rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-theme-text"
                      />
                      <BookOpen className="w-4 h-4 text-theme-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => setSelectedReferenceCategory('all')}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                          selectedReferenceCategory === 'all'
                            ? 'bg-brand-500 text-white'
                            : 'bg-theme-surface text-theme-text-muted hover:text-brand-500'
                        }`}
                      >
                        Tout
                      </button>
                      {VERB_GROUPS.map(group => (
                        <button
                          key={group.id}
                          onClick={() => setSelectedReferenceCategory(group.id)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                            selectedReferenceCategory === group.id
                              ? 'bg-brand-500 text-white'
                              : 'bg-theme-surface text-theme-text-muted hover:text-brand-500'
                          }`}
                        >
                          {group.id.replace('reg-', '').toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {VERBS_LIST.filter(v => {
                      const matchesSearch = v.infinitive.toLowerCase().includes(referenceSearch.toLowerCase()) ||
                                          v.translation.toLowerCase().includes(referenceSearch.toLowerCase());
                      const matchesCategory = selectedReferenceCategory === 'all' || 
                                            v.categoryId === selectedReferenceCategory ||
                                            (selectedReferenceCategory === 'irregular' && v.categoryId === 'irregular');
                      return matchesSearch && matchesCategory;
                    }).map(verb => (
                      <button
                        key={verb.id}
                        onClick={() => setSelectedVerbId(verb.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${
                          selectedVerbId === verb.id 
                            ? 'bg-brand-500 text-white shadow-lg shadow-brand-200' 
                            : 'hover:bg-theme-surface hover:shadow-sm text-theme-text-secondary'
                        }`}
                      >
                        <div>
                          <div className={`font-bold ${selectedVerbId === verb.id ? 'text-white' : 'text-theme-text'}`}>
                            {verb.infinitive}
                          </div>
                          <div className={`text-xs ${selectedVerbId === verb.id ? 'text-brand-100' : 'text-theme-text-muted'}`}>
                            {verb.translation}
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform ${selectedVerbId === verb.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Content: Conjugation Tables */}
                <div className="flex-1 overflow-y-auto p-8 bg-theme-surface custom-scrollbar">
                  {selectedVerbId ? (
                    <div className="space-y-12">
                      {(() => {
                        const verb = VERBS_LIST.find(v => v.id === selectedVerbId)!;
                        return (
                          <>
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-theme-border pb-8">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                    verb.categoryId === 'irregular' ? 'bg-rose-100 text-rose-600' : 'bg-brand-100 text-brand-600'
                                  }`}>
                                    {verb.categoryId === 'irregular' ? 'Irrégulier' : 'Régulier'}
                                  </span>
                                  <span className="text-theme-text-muted">•</span>
                                  <span className="text-xs font-bold text-theme-text-muted uppercase tracking-widest">
                                    {verb.group.toUpperCase()}
                                  </span>
                                </div>
                                <h3 className="text-5xl font-serif font-bold text-theme-text">{verb.infinitive}</h3>
                                <p className="text-xl text-theme-text-muted font-medium mt-1">{verb.translation}</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <div className="bg-theme-subtle text-theme-text-secondary px-4 py-2 rounded-xl border border-theme-border text-sm font-bold">
                                  Categorie: {VERB_GROUPS.find(g => g.id === verb.categoryId)?.label || verb.categoryId}
                                </div>
                                {verb.aux && (
                                  <div className="bg-brand-50 text-brand-700 px-4 py-2 rounded-xl border border-brand-100 text-sm font-bold">
                                    Hulpwerkwoord: {verb.aux}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                              {TENSES.map(tense => (
                                <div key={tense.id} className="space-y-4">
                                  <h4 className="text-lg font-bold text-theme-text flex items-center gap-2">
                                    <div className="w-2 h-6 bg-brand-400 rounded-full" />
                                    {tense.label}
                                  </h4>
                                  <div className="bg-theme-subtle/50 rounded-3xl border border-theme-border overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr className="bg-theme-subtle">
                                          <th className="px-6 py-3 text-[10px] font-black text-theme-text-muted uppercase tracking-widest border-b border-theme-border">Onderwerp</th>
                                          <th className="px-6 py-3 text-[10px] font-black text-theme-text-muted uppercase tracking-widest border-b border-theme-border">Frans</th>
                                          <th className="px-6 py-3 text-[10px] font-black text-theme-text-muted uppercase tracking-widest border-b border-theme-border">Nederlands</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {SUBJECTS.map((subject, idx) => {
                                          const french = (verb as any).conjugations[tense.id].french[idx];
                                          const dutch = (verb as any).conjugations[tense.id].dutch[idx];
                                          return (
                                            <tr key={subject.id} className="hover:bg-theme-surface transition-colors group">
                                              <td className="px-6 py-3 text-sm font-bold text-theme-text-muted border-b border-theme-border/50">{subject.label}</td>
                                              <td className="px-6 py-3 text-sm font-bold text-brand-600 border-b border-theme-border/50">{french}</td>
                                              <td className="px-6 py-3 text-sm text-theme-text-secondary border-b border-theme-border/50 italic">{dutch}</td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                      <div className="p-8 bg-theme-subtle rounded-full">
                        <BookOpen className="w-16 h-16 text-theme-text-muted" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-theme-text">Selecteer een werkwoord</h3>
                        <p className="text-theme-text-secondary">Kies een werkwoord uit de lijst om alle vervoegingen te zien.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
}
