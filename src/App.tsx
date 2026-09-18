/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StartScreen } from './components/StartScreen';
import { QuizCard } from './components/QuizCard';
import { ResultScreen } from './components/ResultScreen';
import { PrincipleModal } from './components/PrincipleModal';
import { STAGES, getRandomQuestionsForStage } from './data/stagesData';
import { Question, StageResult } from './types';
import { soundManager } from './utils/audio';

type ScreenType = 'start' | 'game' | 'result';

export default function App() {
  const [screen, setScreen] = useState<ScreenType>('start');
  const [currentStageId, setCurrentStageId] = useState<number>(1);
  const [unlockedStages, setUnlockedStages] = useState<number[]>([1]);
  const [stageScores, setStageScores] = useState<Record<number, { stars: number; completedTimes: number }>>({});
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Game session state
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [lastResult, setLastResult] = useState<StageResult | null>(null);

  // Principle Modal state
  const [principleModal, setPrincipleModal] = useState<{
    isOpen: boolean;
    stageId: number;
    isWrongAnswerPopup: boolean;
    specificExplanation?: string;
  }>({
    isOpen: false,
    stageId: 1,
    isWrongAnswerPopup: false,
  });

  // Load saved progress from localStorage
  useEffect(() => {
    try {
      const savedUnlocked = localStorage.getItem('yaho_unlocked_stages');
      if (savedUnlocked) {
        setUnlockedStages(JSON.parse(savedUnlocked));
      }
      const savedScores = localStorage.getItem('yaho_stage_scores');
      if (savedScores) {
        setStageScores(JSON.parse(savedScores));
      }
      const savedSound = localStorage.getItem('yaho_sound_enabled');
      if (savedSound !== null) {
        const enabled = savedSound === 'true';
        setSoundEnabled(enabled);
        soundManager.setSoundEnabled(enabled);
      }
    } catch {
      // Storage fallback
    }
  }, []);

  // Save progress helper
  const saveProgress = (newUnlocked: number[], newScores: Record<number, { stars: number; completedTimes: number }>) => {
    try {
      localStorage.setItem('yaho_unlocked_stages', JSON.stringify(newUnlocked));
      localStorage.setItem('yaho_stage_scores', JSON.stringify(newScores));
    } catch {
      // Storage fallback
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setSoundEnabled(next);
    try {
      localStorage.setItem('yaho_sound_enabled', String(next));
    } catch {
      // Storage fallback
    }
  };

  // Start stage with dynamically randomized question pool
  const startStage = (stageId: number = 1) => {
    const questions = getRandomQuestionsForStage(stageId, 5);
    setCurrentStageId(stageId);
    setActiveQuestions(questions);
    setQuestionIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setLastResult(null);
    setScreen('game');

    // Always show the stage's principle rules/tips first so students learn the method beforehand!
    setPrincipleModal({
      isOpen: true,
      stageId: stageId,
      isWrongAnswerPopup: false,
    });
  };

  // Handle student answering a question
  const handleAnswer = (isCorrect: boolean, specificExplanation: string) => {
    const nextCorrect = isCorrect ? correctCount + 1 : correctCount;
    const nextWrong = !isCorrect ? wrongCount + 1 : wrongCount;

    if (isCorrect) {
      setCorrectCount(nextCorrect);
      // Small pause before advancing
      setTimeout(() => {
        proceedToNextQuestion(nextCorrect, nextWrong);
      }, 500);
    } else {
      setWrongCount(nextWrong);
      // Immediately open the intuitive principle explanation popup
      setPrincipleModal({
        isOpen: true,
        stageId: currentStageId,
        isWrongAnswerPopup: true,
        specificExplanation: specificExplanation,
      });
    }
  };

  // When student closes principle popup (especially after wrong answer)
  const handleClosePrincipleModal = () => {
    const wasWrongPopup = principleModal.isWrongAnswerPopup;
    setPrincipleModal((prev) => ({ ...prev, isOpen: false }));

    if (wasWrongPopup) {
      // Advance to next question after learning the principle
      proceedToNextQuestion(correctCount, wrongCount);
    }
  };

  // Proceed to next question or show result screen
  const proceedToNextQuestion = (currCorrect: number, currWrong: number) => {
    if (questionIndex + 1 < activeQuestions.length) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      // Stage finished: compute score & rewards
      const total = activeQuestions.length;
      const passThreshold = Math.ceil(total * 0.6); // 3 out of 5 to pass
      const isCleared = currCorrect >= passThreshold;
      const stars = currCorrect === total ? 3 : currCorrect >= passThreshold ? 2 : 1;

      const result: StageResult = {
        stageId: currentStageId,
        totalQuestions: total,
        correctCount: currCorrect,
        wrongCount: currWrong,
        stars,
        isCleared,
      };

      setLastResult(result);

      // Update unlocked stages and scores
      let nextUnlocked = [...unlockedStages];
      if (isCleared && currentStageId < 8 && !unlockedStages.includes(currentStageId + 1)) {
        nextUnlocked.push(currentStageId + 1);
        setUnlockedStages(nextUnlocked);
      }

      const prevScore = stageScores[currentStageId];
      const nextScores = {
        ...stageScores,
        [currentStageId]: {
          stars: Math.max(prevScore?.stars || 0, stars),
          completedTimes: (prevScore?.completedTimes || 0) + (isCleared ? 1 : 0),
        },
      };
      setStageScores(nextScores);
      saveProgress(nextUnlocked, nextScores);

      setScreen('result');
    }
  };

  const currentStage = STAGES.find((s) => s.id === currentStageId) || STAGES[0];
  const principleStage = STAGES.find((s) => s.id === principleModal.stageId) || currentStage;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-200">
      {/* Top Header */}
      <Header
        stageNumber={screen === 'game' ? currentStageId : undefined}
        totalStages={8}
        stageTitle={currentStage.title}
        showStageIndicator={screen === 'game'}
        onOpenPrinciple={
          screen === 'game'
            ? () =>
                setPrincipleModal({
                  isOpen: true,
                  stageId: currentStageId,
                  isWrongAnswerPopup: false,
                })
            : undefined
        }
        onGoHome={
          screen !== 'start'
            ? () => {
                setScreen('start');
              }
            : undefined
        }
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Screen Content */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {/* 1. START SCREEN */}
        {screen === 'start' && (
          <StartScreen
            unlockedStages={unlockedStages}
            stageScores={stageScores}
            onStartGame={(stageId) => startStage(stageId || 1)}
            onOpenPrincipleForStage={(stageId) =>
              setPrincipleModal({
                isOpen: true,
                stageId,
                isWrongAnswerPopup: false,
              })
            }
            onUnlockAll={() => {
              const all = [1, 2, 3, 4, 5, 6, 7, 8];
              setUnlockedStages(all);
              saveProgress(all, stageScores);
            }}
            onResetProgress={() => {
              setUnlockedStages([1]);
              setStageScores({});
              saveProgress([1], {});
            }}
          />
        )}

        {/* 2. GAME SCREEN */}
        {screen === 'game' && activeQuestions.length > 0 && (
          <div className="p-4 space-y-4 animate-fadeIn">
            {/* Stage title & Progress Bar */}
            <div className="space-y-1.5 px-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span className="flex items-center gap-1">
                  <span>{currentStage.badge}</span>
                  <span className="font-fun text-slate-900 text-sm">
                    {currentStage.title}
                  </span>
                </span>
                <span className="text-amber-600 font-fun">
                  정답 {correctCount} / {activeQuestions.length}
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${((questionIndex) / activeQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Active Interactive Quiz Card */}
            <QuizCard
              key={activeQuestions[questionIndex].id}
              question={activeQuestions[questionIndex]}
              questionIndex={questionIndex}
              totalInRun={activeQuestions.length}
              onAnswer={handleAnswer}
              onOpenPrinciple={() =>
                setPrincipleModal({
                  isOpen: true,
                  stageId: currentStageId,
                  isWrongAnswerPopup: false,
                })
              }
            />
          </div>
        )}

        {/* 3. RESULT SCREEN */}
        {screen === 'result' && lastResult && (
          <ResultScreen
            stage={currentStage}
            result={lastResult}
            hasNextStage={currentStageId < 8}
            onReview={() => startStage(currentStageId)}
            onNextStage={() => {
              if (currentStageId < 8) {
                startStage(currentStageId + 1);
              } else {
                startStage(1);
              }
            }}
            onQuit={() => setScreen('start')}
            onOpenPrinciple={() =>
              setPrincipleModal({
                isOpen: true,
                stageId: currentStageId,
                isWrongAnswerPopup: false,
              })
            }
          />
        )}
      </main>

      {/* Principle Modal (원리 쏙쏙 플래시카드 & 오답 시 직관적 팝업) */}
      <PrincipleModal
        isOpen={principleModal.isOpen}
        onClose={handleClosePrincipleModal}
        principle={principleStage.principle}
        stageTitle={principleStage.title}
        badge={principleStage.badge}
        specificExplanation={principleModal.specificExplanation}
        isWrongAnswerPopup={principleModal.isWrongAnswerPopup}
      />
    </div>
  );
}
