import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, ArrowRight, Home, Star, Award, Sparkles, BookOpen } from 'lucide-react';
import { StageInfo, StageResult } from '../types';
import { soundManager } from '../utils/audio';

interface ResultScreenProps {
  stage: StageInfo;
  result: StageResult;
  hasNextStage: boolean;
  onReview: () => void;
  onNextStage: () => void;
  onQuit: () => void;
  onOpenPrinciple: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  stage,
  result,
  hasNextStage,
  onReview,
  onNextStage,
  onQuit,
  onOpenPrinciple,
}) => {
  // Fire confetti and play clear sound if passed
  useEffect(() => {
    if (result.isCleared) {
      soundManager.playStageClear();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
        });
      } catch {
        // Confetti fallback
      }
    } else {
      soundManager.playWrong();
    }
  }, [result.isCleared]);

  return (
    <div id="result-screen-container" className="max-w-md mx-auto min-h-[85vh] p-4 flex flex-col justify-between animate-fadeIn">
      {/* Upper Card: Celebration & Rewards */}
      <div className="bg-white rounded-3xl p-6 border-4 border-amber-300 shadow-xl text-center space-y-4">
        {/* Stage & Title */}
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
            {stage.title} 완료!
          </span>
          <h2 className="font-fun text-2xl font-black text-slate-900 mt-2">
            {result.isCleared ? '야호! 스테이지 클리어! 🎉' : '아쉬워요! 다시 도전해볼까요? 💪'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {result.isCleared
              ? `${stage.categoryName} 원리를 멋지게 익혔어요!`
              : '원리를 다시 읽어보고 새 문제로 복습해봐요!'}
          </p>
        </div>

        {/* Stars Display */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`p-2.5 rounded-2xl transition-all duration-500 ${
                starIdx <= result.stars
                  ? 'bg-amber-100 text-amber-500 scale-110 shadow-sm'
                  : 'bg-slate-100 text-slate-300'
              }`}
            >
              <Star
                className={`w-8 h-8 ${
                  starIdx <= result.stars ? 'fill-amber-400 text-amber-500' : ''
                }`}
              />
            </div>
          ))}
        </div>

        {/* Reward Badge (스테이지 클리어 보상 화면) */}
        {result.isCleared && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-2xl shadow-sm">
              {stage.badge}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-700">
                <Award className="w-3.5 h-3.5" />
                <span>성공 보상 배지 획득!</span>
              </div>
              <div className="font-fun font-bold text-slate-900 text-sm">
                "{stage.categoryName} 마스터"
              </div>
            </div>
          </div>
        )}

        {/* Score Summary Box */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
          <div className="p-2 bg-white rounded-xl">
            <span className="text-slate-500 block">맞힌 문제</span>
            <span className="font-fun font-bold text-emerald-600 text-base">
              {result.correctCount} / {result.totalQuestions}
            </span>
          </div>
          <div className="p-2 bg-white rounded-xl">
            <span className="text-slate-500 block">정답률</span>
            <span className="font-fun font-bold text-amber-600 text-base">
              {Math.round((result.correctCount / result.totalQuestions) * 100)}%
            </span>
          </div>
        </div>

        {/* Quick Principle Review Button */}
        <button
          onClick={() => {
            soundManager.playTap();
            onOpenPrinciple();
          }}
          className="w-full py-2.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
        >
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span>💡 이번 단계 핵심 원리 다시 확인하기</span>
        </button>
      </div>

      {/* Action Buttons: Strictly in requested order from top to bottom:
          1) [복습하기]
          2) [다음 단계]
          3) [그만하기] */}
      <div className="space-y-3 pt-4 pb-2">
        {/* 1. 복습하기 */}
        <button
          id="result-review-btn"
          onClick={() => {
            soundManager.playTap();
            onReview();
          }}
          className="w-full py-4 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-fun font-bold text-base shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 border-2 border-amber-600"
        >
          <RotateCcw className="w-5 h-5" />
          <span>[복습하기] (새로운 문제로 다시 풀기)</span>
        </button>

        {/* 2. 다음 단계 */}
        <button
          id="result-next-btn"
          onClick={() => {
            soundManager.playTap();
            onNextStage();
          }}
          className={`w-full py-4 px-5 rounded-2xl font-fun font-bold text-base shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 ${
            result.isCleared
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-emerald-600'
              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-2 border-emerald-300'
          }`}
        >
          <span>[다음 단계]</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* 3. 그만하기 */}
        <button
          id="result-quit-btn"
          onClick={() => {
            soundManager.playTap();
            onQuit();
          }}
          className="w-full py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-fun font-bold text-sm active:scale-98 transition-all flex items-center justify-center gap-2 border border-slate-300"
        >
          <Home className="w-4 h-4 text-slate-500" />
          <span>[그만하기]</span>
        </button>
      </div>
    </div>
  );
};
