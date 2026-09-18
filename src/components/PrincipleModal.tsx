import React from 'react';
import { X, Sparkles, Lightbulb, CheckCircle2, Bookmark } from 'lucide-react';
import { StagePrinciple } from '../types';
import { soundManager } from '../utils/audio';

interface PrincipleModalProps {
  isOpen: boolean;
  onClose: () => void;
  principle: StagePrinciple;
  stageTitle: string;
  badge: string;
  specificExplanation?: string; // 오답 시 팝업에 나타나는 직관적인 설명
  isWrongAnswerPopup?: boolean;
}

export const PrincipleModal: React.FC<PrincipleModalProps> = ({
  isOpen,
  onClose,
  principle,
  stageTitle,
  badge,
  specificExplanation,
  isWrongAnswerPopup = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="principle-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="principle-modal-content"
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 text-white relative ${isWrongAnswerPopup ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-amber-500 to-orange-400'}`}>
          <button
            id="close-principle-btn"
            onClick={() => {
              soundManager.playTap();
              onClose();
            }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white active:scale-95 transition-all"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{badge}</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
                {stageTitle} 원리 쏙쏙!
              </span>
              <h3 className="font-fun text-lg font-bold leading-tight">
                {isWrongAnswerPopup ? '앗, 괜찮아요! 원리를 쏙쏙 배워봐요' : principle.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-800 text-sm">
          {/* Specific explanation if triggered by a wrong answer */}
          {isWrongAnswerPopup && specificExplanation && (
            <div className="p-3.5 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-start gap-3 animate-bounce-short">
              <Lightbulb className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-900 text-xs mb-1">💡 이번 문제의 핵심 원리</p>
                <p className="text-rose-800 text-sm leading-relaxed">{specificExplanation}</p>
              </div>
            </div>
          )}

          {/* Core Catchphrase */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="font-bold text-amber-900 text-sm">{principle.coreCatchphrase}</p>
          </div>

          <p className="text-slate-600 text-xs leading-relaxed">{principle.description}</p>

          {/* Flashcard Rules List */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Bookmark className="w-3.5 h-3.5" />
              <span>핵심 규칙 플래시카드</span>
            </div>
            {principle.rules.map((rule, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-amber-50/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${rule.badgeColor || 'bg-amber-100 text-amber-800'}`}>
                    {rule.keyword}
                  </span>
                </div>
                <p className="text-slate-700 font-medium text-xs mb-1">{rule.explanation}</p>
                {rule.example && (
                  <div className="bg-white p-2 rounded-xl border border-slate-100 text-xs font-mono text-slate-600 flex items-center gap-1.5">
                    <span className="text-amber-500 font-bold">예:</span>
                    <span>{rule.example}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Remember Tip */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">{principle.rememberTip}</p>
          </div>
        </div>

        {/* Footer Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button
            id="principle-got-it-btn"
            onClick={() => {
              soundManager.playTap();
              onClose();
            }}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-fun font-bold text-base rounded-2xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>알겠어요! 문제 풀러 가기</span>
            <span>👉</span>
          </button>
        </div>
      </div>
    </div>
  );
};
