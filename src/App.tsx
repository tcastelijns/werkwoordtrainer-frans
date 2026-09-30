/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  XCircle, RefreshCcw, ChevronDown, ChevronRight, Check,
  ArrowLeft, BookOpen, Info, Search, Sun, Moon
} from 'lucide-react';

import verbData from './data/verbs.json';

// --- Data & Logic ---

const { 
  verbGroups: VERB_GROUPS, 
  verbsList: VERBS_LIST, 
  tenses: TENSES, 
  subjects: SUBJECTS
} = verbData;

// --- Components ---

type GameState = 'start' | 'playing' | 'result';
type Verb = typeof VERBS_LIST[0];
const REGULAR_CATEGORY_IDS = new Set(['reg-er', 'reg-ir', 'reg-re']);

interface Question {
  verb: Verb;
  subject: typeof SUBJECTS[0];
  tense: typeof TENSES[0];
  correctAnswer: string;
  dutchQuestion: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

function getRegularInfinitiveTranslation(verb: Verb) {
  if (!REGULAR_CATEGORY_IDS.has(verb.categoryId)) return null;
  if (!('infinitiveTranslation' in verb) || typeof verb.infinitiveTranslation !== 'string') {
    return null;
  }
  return verb.infinitiveTranslation;
}

function InfinitiveInfoButton({ infinitive }: { infinitive: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchOpen, setIsTouchOpen] = useState(false);
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);
  const tooltipId = useId();
  const isOpen = isHovered || isTouchOpen || isKeyboardFocused;

  const stopInfoInteraction = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        aria-label="Toon het Franse werkwoord"
        aria-describedby={isOpen ? tooltipId : undefined}
        aria-expanded={isOpen}
        onClick={stopInfoInteraction}
        onPointerUp={(event) => {
          stopInfoInteraction(event);
          if (event.pointerType !== 'mouse') {
            setIsTouchOpen((isCurrentlyOpen) => !isCurrentlyOpen);
          }
        }}
        onFocus={(event) => {
          if (event.currentTarget.matches(':focus-visible')) {
            setIsKeyboardFocused(true);
          }
        }}
        onBlur={() => {
          setIsKeyboardFocused(false);
          setIsTouchOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            setIsKeyboardFocused(false);
            setIsTouchOpen(false);
          }
        }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-theme-border-strong bg-theme-surface text-theme-text-muted transition-colors hover:border-brand-300 hover:text-brand-500 focus-visible:border-brand-400 focus-visible:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
      >
        <Info className="h-4 w-4" aria-hidden="true" />
      </button>
      {isOpen && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-theme-border bg-theme-surface px-3 py-2 font-sans text-xs font-bold not-italic text-theme-text shadow-lg"
        >
          {infinitive}
        </span>
      )}
    </span>
  );
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [selectedRegularIds, setSelectedRegularIds] = useState<string[]>([]);
  const [selectedIrregularIds, setSelectedIrregularIds] = useState<string[]>([]);
  const [selectedTenses, setSelectedTenses] = useState<string[]>([]);
  const [expandedRegularGroupId, setExpandedRegularGroupId] = useState<string | null>(null);
  const [regularErSearch, setRegularErSearch] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [initialQuestionCount, setInitialQuestionCount] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string; canTryAgain?: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const [missedVerbIds, setMissedVerbIds] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
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

  const missedVerbs = useMemo(
    () => missedVerbIds
      .map(id => VERBS_LIST.find(v => v.id === id))
      .filter((verb): verb is Verb => Boolean(verb)),
    [missedVerbIds]
  );

  const toggleRegular = (id: string) => {
    setSelectedRegularIds(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const toggleIrregular = (id: string) => {
    setSelectedIrregularIds(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const toggleTense = (id: string) => {
    setSelectedTenses(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const selectAllRegulars = () => setSelectedRegularIds(VERBS_LIST.filter(v => v.categoryId !== 'irregular').map(v => v.id));
  const deselectAllRegulars = () => setSelectedRegularIds([]);
  const selectAllIrregulars = () => setSelectedIrregularIds(VERBS_LIST.filter(v => v.categoryId === 'irregular').map(v => v.id));
  const deselectAllIrregulars = () => setSelectedIrregularIds([]);
  const selectAllTenses = () => setSelectedTenses(TENSES.map(t => t.id));
  const deselectAllTenses = () => setSelectedTenses([]);

  const generateQuiz = () => {
    if ((selectedRegularIds.length === 0 && selectedIrregularIds.length === 0) || selectedTenses.length === 0) return;

    const availableVerbs = [
      ...VERBS_LIST.filter(v => selectedRegularIds.includes(v.id)),
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
    setMissedVerbIds([]);
    setAttempts(0);
    setGameState('playing');
    setFeedback(null);
    setUserAnswer('');
  };

  const generateMistakeQuiz = () => {
    if (missedVerbIds.length === 0 || selectedTenses.length === 0) return;

    const availableVerbs = VERBS_LIST.filter(v => missedVerbIds.includes(v.id));
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
    setMissedVerbIds([]);
    setAttempts(0);
    setGameState('playing');
    setFeedback(null);
    setUserAnswer('');
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
    } else {
      setMissedVerbIds(prev => prev.includes(currentQuestion.verb.id) ? prev : [...prev, currentQuestion.verb.id]);
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
      setAttempts(0);
    } else {
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

                <button
                  onClick={() => {
                    setShowReference(true);
                    if (!selectedVerbId && VERBS_LIST.length > 0) {
                      setSelectedVerbId(VERBS_LIST[0].id);
                    }
                  }}
                  className="inline-flex items-center gap-2 bg-theme-surface px-4 py-2 rounded-full border border-theme-border shadow-sm hover:border-brand-400 hover:text-brand-500 transition-all group"
                >
                  <BookOpen className="w-5 h-5 text-brand-500" />
                  <span className="text-sm font-bold text-theme-text-secondary group-hover:text-theme-text transition-colors">Naslagwerk</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Regular Verbs Column */}
                <div className="glass-card p-8 rounded-[2.5rem] space-y-8 lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="flex justify-between items-end border-b border-brand-100 pb-4">
                        <h3 className="font-serif text-2xl font-medium text-theme-text">Réguliers</h3>
                        <div className="flex gap-3">
                          <button onClick={selectAllRegulars} className="text-[10px] uppercase tracking-wider text-accent-600 font-bold hover:text-accent-700 transition-colors">Tout</button>
                          <button onClick={deselectAllRegulars} className="text-[10px] uppercase tracking-wider text-theme-text-muted font-bold hover:text-theme-text-secondary transition-colors">Aucun</button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {VERB_GROUPS.filter(g => g.id !== 'irregular').map(group => {
                          const groupVerbs = VERBS_LIST.filter(v => v.categoryId === group.id);
                          const selectedInGroup = groupVerbs.filter(v => selectedRegularIds.includes(v.id)).length;
                          const isExpanded = expandedRegularGroupId === group.id;
                          const panelId = `regular-group-${group.id}`;
                          const searchTerm = group.id === 'reg-er' ? regularErSearch.trim().toLocaleLowerCase('fr') : '';
                          const visibleGroupVerbs = searchTerm
                            ? groupVerbs.filter(verb =>
                                verb.infinitive.toLocaleLowerCase('fr').includes(searchTerm)
                                || verb.translation.toLocaleLowerCase('nl').includes(searchTerm)
                              )
                            : groupVerbs;

                          return (
                            <div key={group.id} className="overflow-hidden rounded-xl border border-theme-border bg-theme-surface">
                              <button
                                type="button"
                                aria-expanded={isExpanded}
                                aria-controls={panelId}
                                onClick={() => setExpandedRegularGroupId(isExpanded ? null : group.id)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-theme-text-secondary transition-colors hover:bg-theme-subtle/50 hover:text-theme-text"
                              >
                                <ChevronDown className={`h-4 w-4 shrink-0 text-brand-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                <span className="min-w-0 flex-1 truncate text-sm font-bold">{group.label}</span>
                                <span className="shrink-0 text-xs font-medium text-theme-text-muted">
                                  {selectedInGroup > 0 ? `${selectedInGroup} / ` : ''}{groupVerbs.length}
                                </span>
                              </button>

                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    id={panelId}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    {group.id === 'reg-er' && (
                                      <div className="flex justify-end border-t border-theme-border px-3 pt-3">
                                        <label className="relative block w-full sm:max-w-56">
                                          <span className="sr-only">Zoek een werkwoord op -er</span>
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-text-muted" />
                                          <input
                                            type="search"
                                            value={regularErSearch}
                                            onChange={(event) => setRegularErSearch(event.target.value)}
                                            placeholder="Zoek werkwoord..."
                                            className="h-9 w-full rounded-lg border border-theme-border bg-theme-subtle/50 pl-9 pr-3 text-sm text-theme-text outline-none transition-colors placeholder:text-theme-text-muted focus:border-brand-400 focus:bg-theme-surface"
                                          />
                                        </label>
                                      </div>
                                    )}
                                    <div className={`${group.id === 'reg-er' ? '' : 'border-t'} grid max-h-[300px] grid-cols-2 gap-2 overflow-y-auto border-theme-border p-3 custom-scrollbar`}>
                                      {visibleGroupVerbs.map(verb => (
                                        <button
                                          key={verb.id}
                                          onClick={() => toggleRegular(verb.id)}
                                          className={`flex min-w-0 items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
                                            selectedRegularIds.includes(verb.id)
                                              ? 'border-transparent bg-brand-500 text-white shadow-md shadow-brand-200'
                                              : 'border-theme-border bg-theme-surface text-theme-text-secondary hover:border-brand-100 hover:bg-theme-subtle/30'
                                          }`}
                                        >
                                          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors ${selectedRegularIds.includes(verb.id) ? 'bg-white/20' : 'bg-theme-subtle'}`}>
                                            {selectedRegularIds.includes(verb.id) ? <Check className="h-3 w-3" /> : null}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-bold">{verb.infinitive}</div>
                                            <div className={`truncate text-[10px] italic ${selectedRegularIds.includes(verb.id) ? 'text-brand-100' : 'text-theme-text-muted'}`}>
                                              {verb.translation}
                                            </div>
                                          </div>
                                        </button>
                                      ))}
                                      {visibleGroupVerbs.length === 0 && (
                                        <p className="col-span-2 py-6 text-center text-sm text-theme-text-muted">
                                          Geen werkwoorden gevonden.
                                        </p>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
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
                    disabled={(selectedRegularIds.length === 0 && selectedIrregularIds.length === 0) || selectedTenses.length === 0}
                    className="neo-button group relative inline-flex items-center gap-4 px-16 py-6 bg-accent-600 text-white rounded-full font-bold text-lg shadow-2xl shadow-accent-200 hover:bg-accent-700 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                  >
                    Commencer le quiz
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                  {((selectedRegularIds.length === 0 && selectedIrregularIds.length === 0) || selectedTenses.length === 0) && (
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

                  {getRegularInfinitiveTranslation(questions[currentIndex].verb) ? (
                    <InfinitiveInfoButton infinitive={questions[currentIndex].verb.infinitive} />
                  ) : null}
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

                  {feedback?.canTryAgain && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-5 py-3 rounded-2xl text-center text-sm font-bold bg-accent-50 text-accent-700 border border-accent-100"
                    >
                      {feedback.message}
                    </motion.div>
                  )}

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
                <div className="space-y-3">
                  <h2 className="text-5xl font-serif font-semibold text-theme-text">Resultaten</h2>
                  <p className="text-theme-text-muted font-medium uppercase tracking-widest text-xs">Overzicht van deze oefenronde</p>
                </div>

                <div className="inline-flex items-baseline gap-4 bg-theme-surface px-10 py-6 rounded-[2rem] shadow-sm border border-theme-border">
                  <span className="text-7xl font-serif font-bold text-accent-600">{score}</span>
                  <span className="text-2xl text-theme-text-muted font-medium">/ {initialQuestionCount}</span>
                </div>
              </div>

              {missedVerbs.length > 0 && (
                <div className="glass-card rounded-[2.5rem] p-8 text-left space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h3 className="font-serif text-2xl font-medium text-theme-text">Nog even oefenen</h3>
                      <p className="text-sm text-theme-text-muted font-medium mt-1">
                        Deze werkwoorden gingen fout tijdens deze ronde.
                      </p>
                    </div>
                    <button
                      onClick={generateMistakeQuiz}
                      className="neo-button inline-flex items-center justify-center gap-3 px-8 py-4 bg-accent-600 text-white rounded-full font-bold shadow-xl shadow-accent-200 hover:bg-accent-700 active:scale-95 transition-all"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Oefen deze opnieuw
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {missedVerbs.map(verb => (
                      <div
                        key={verb.id}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-subtle border border-theme-border text-sm font-bold text-theme-text"
                      >
                        <span className="text-brand-600">{verb.infinitive}</span>
                        <span className="text-theme-text-muted font-medium">({verb.translation})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
