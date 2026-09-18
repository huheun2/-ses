import React, { useState, useEffect } from 'react';
import { Check, RotateCcw, HelpCircle } from 'lucide-react';
import { Question } from '../types';
import { soundManager } from '../utils/audio';

interface QuizCardProps {
  question: Question;
  questionIndex: number;
  totalInRun: number;
  onAnswer: (isCorrect: boolean, specificExplanation: string) => void;
  onOpenPrinciple: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  questionIndex,
  totalInRun,
  onAnswer,
  onOpenPrinciple,
}) => {
  // Classification state
  const [assignedItems, setAssignedItems] = useState<Record<string, string>>({}); // word -> categoryId
  // Build sentence state
  const [assembledTokens, setAssembledTokens] = useState<string[]>([]);
  // Fill blank selected
  const [selectedFillBlank, setSelectedFillBlank] = useState<string | null>(null);
  // Slot selection state (Stage 8: 동사와 명사 직접 선택하기)
  const [selectedVerb, setSelectedVerb] = useState<string | null>(null);
  const [selectedNoun, setSelectedNoun] = useState<string | null>(null);

  // Reset local state when question changes
  useEffect(() => {
    setAssignedItems({});
    setAssembledTokens([]);
    setSelectedFillBlank(null);
    setSelectedVerb(null);
    setSelectedNoun(null);
  }, [question.id]);

  // Handle Choice Selection
  const handleChoiceSelect = (index: number) => {
    if (question.type !== 'choice') return;
    soundManager.playTap();
    const isCorrect = index === question.correctIndex;
    if (isCorrect) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }
    onAnswer(isCorrect, question.principleExplanation);
  };

  // Handle Fill in the blank
  const handleFillBlankSelect = (option: string) => {
    if (question.type !== 'fill_blank') return;
    soundManager.playTap();
    setSelectedFillBlank(option);
    const isCorrect = option === question.correctAnswer;
    if (isCorrect) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }
    setTimeout(() => {
      onAnswer(isCorrect, question.principleExplanation);
    }, 250);
  };

  // Handle Classification assignment
  const handleAssignItem = (word: string, categoryId: string) => {
    soundManager.playTap();
    const next = { ...assignedItems, [word]: categoryId };
    setAssignedItems(next);

    // If all items assigned, evaluate
    if (question.type === 'classify' && Object.keys(next).length === question.items.length) {
      const allCorrect = question.items.every(
        (item) => next[item.word] === item.categoryId
      );
      setTimeout(() => {
        if (allCorrect) {
          soundManager.playCorrect();
        } else {
          soundManager.playWrong();
        }
        onAnswer(allCorrect, question.principleExplanation);
      }, 300);
    }
  };

  // Handle Build Sentence token tap
  const handleAddToken = (token: string) => {
    soundManager.playTap();
    setAssembledTokens((prev) => [...prev, token]);
  };

  const handleRemoveToken = (index: number) => {
    soundManager.playTap();
    setAssembledTokens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckSentence = () => {
    if (question.type !== 'build_sentence') return;
    const isCorrect =
      assembledTokens.length === question.correctSentence.length &&
      assembledTokens.every((token, idx) => token === question.correctSentence[idx]);

    if (isCorrect) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }
    onAnswer(isCorrect, question.principleExplanation);
  };

  const handleCheckSlotSentence = () => {
    if (question.type !== 'slot_select') return;
    if (!selectedVerb || !selectedNoun) return;
    soundManager.playTap();
    const isVerbCorrect = selectedVerb === question.correctVerb;
    const isNounCorrect = selectedNoun === question.correctNoun;
    const isCorrect = isVerbCorrect && isNounCorrect;

    if (isCorrect) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }
    onAnswer(isCorrect, question.principleExplanation);
  };

  return (
    <div id="quiz-card-container" className="bg-white rounded-3xl p-5 shadow-md border-2 border-amber-100 flex flex-col space-y-4">
      {/* Progress & Help bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
          문제 {questionIndex + 1} / {totalInRun}
        </span>
        <button
          onClick={() => {
            soundManager.playTap();
            onOpenPrinciple();
          }}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-amber-600 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>힌트 / 원리</span>
        </button>
      </div>

      {/* Question Prompt */}
      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-slate-900 leading-snug">
          {question.prompt}
        </h3>
        {question.contextSentence && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <p className="text-base font-fun tracking-wide text-slate-800">
              {question.highlightWord ? (
                question.contextSentence.split(question.highlightWord).map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="text-amber-600 font-extrabold underline decoration-amber-400 decoration-3 underline-offset-4">
                        {question.highlightWord}
                      </span>
                    )}
                  </React.Fragment>
                ))
              ) : (
                question.contextSentence
              )}
            </p>
          </div>
        )}
      </div>

      {/* Render based on Question Format */}
      {/* 1. Multiple Choice */}
      {question.type === 'choice' && (
        <div className="space-y-2.5 pt-1">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              id={`choice-btn-${idx}`}
              onClick={() => handleChoiceSelect(idx)}
              className="w-full text-left p-3.5 rounded-2xl border-2 border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/50 active:scale-98 transition-all flex items-center justify-between group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-white border border-slate-300 group-hover:border-amber-500 flex items-center justify-center font-bold text-xs text-slate-600 group-hover:text-amber-600">
                  {String.fromCharCode(65 + idx)}
                </span>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{opt.text}</div>
                  {opt.subtext && (
                    <div className="text-xs text-slate-500">{opt.subtext}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 2. Fill in the Blank */}
      {question.type === 'fill_blank' && (
        <div className="space-y-4 pt-2">
          {/* Sentence Display with blank slot */}
          <div className="p-4 bg-amber-50/80 border-2 border-amber-200 rounded-2xl text-center space-y-2">
            <div className="text-lg font-fun text-slate-900 flex items-center justify-center flex-wrap gap-2">
              <span>{question.beforeText}</span>
              <span className="min-w-16 px-3 py-1 bg-white border-2 border-dashed border-amber-500 rounded-xl text-amber-700 font-bold shadow-2xs">
                {selectedFillBlank || ' ? '}
              </span>
              <span>{question.afterText}</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              뜻: {question.koreanMeaning}
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2.5">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                id={`fillblank-opt-${idx}`}
                onClick={() => handleFillBlankSelect(opt)}
                className={`py-3.5 px-4 rounded-2xl border-2 font-fun text-base font-bold active:scale-95 transition-all shadow-2xs ${
                  selectedFillBlank === opt
                    ? 'border-amber-500 bg-amber-500 text-white'
                    : 'border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-800'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Classify (Category Baskets) */}
      {question.type === 'classify' && (
        <div className="space-y-4 pt-1">
          <p className="text-xs text-slate-500 font-medium">
            💡 단어 아래의 알맞은 바구니 버튼을 콕 눌러주세요!
          </p>
          <div className="space-y-3">
            {question.items.map((item, idx) => {
              const currentCategory = assignedItems[item.word];
              return (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="font-bold text-sm text-slate-800">
                    {item.word}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {question.categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleAssignItem(item.word, cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          currentCategory === cat.id
                            ? `${cat.color} text-white shadow-xs scale-102`
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Build Sentence */}
      {question.type === 'build_sentence' && (
        <div className="space-y-4 pt-1">
          {/* Meaning Banner */}
          <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-xs font-bold text-sky-900 text-center">
            완성할 뜻: "{question.koreanMeaning}"
          </div>

          {/* Assembled Sentence Dropzone */}
          <div className="min-h-16 p-3 bg-slate-100/90 border-2 border-dashed border-slate-300 rounded-2xl flex flex-wrap items-center gap-2">
            {assembledTokens.length === 0 ? (
              <span className="text-xs text-slate-400 italic mx-auto">
                아래 단어 블록을 순서대로 눌러 문장을 만들어보세요!
              </span>
            ) : (
              assembledTokens.map((token, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRemoveToken(idx)}
                  className="px-3 py-1.5 bg-amber-500 text-white font-fun text-sm font-bold rounded-xl shadow-xs hover:bg-amber-600 active:scale-95 transition-all flex items-center gap-1"
                >
                  <span>{token}</span>
                  <span className="text-xs opacity-75">✕</span>
                </button>
              ))
            )}
          </div>

          {/* Available Word Blocks */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500">단어 블록:</div>
            <div className="flex flex-wrap gap-2">
              {question.availableWords.map((word, idx) => {
                // Count how many times this word has been used
                const usedCount = assembledTokens.filter((t) => t === word).length;
                const totalInAvailable = question.availableWords.filter((w) => w === word).length;
                const isExhausted = usedCount >= totalInAvailable;

                return (
                  <button
                    key={idx}
                    disabled={isExhausted}
                    onClick={() => handleAddToken(word)}
                    className={`px-3.5 py-2 rounded-xl font-fun text-sm font-bold transition-all shadow-2xs ${
                      isExhausted
                        ? 'bg-slate-200 text-slate-400 border border-transparent cursor-not-allowed opacity-50'
                        : 'bg-white border-2 border-amber-300 text-amber-900 hover:bg-amber-50 active:scale-95'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                soundManager.playTap();
                setAssembledTokens([]);
              }}
              className="p-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
              title="다시 놓기"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              id="check-sentence-btn"
              disabled={assembledTokens.length === 0}
              onClick={handleCheckSentence}
              className={`flex-1 py-3 rounded-2xl font-fun font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                assembledTokens.length > 0
                  ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-98 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>문장 완성 확인!</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Slot Select: 동사 / 명사 선택지를 주고 직접 골라 문장 완성하기 */}
      {question.type === 'slot_select' && (
        <div className="space-y-4 pt-1">
          {/* Meaning Banner */}
          <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-2xl text-xs font-bold text-amber-900 flex items-center justify-between">
            <span className="text-amber-700">🎯 완성할 뜻:</span>
            <span className="text-sm font-extrabold text-amber-950">"{question.koreanMeaning}"</span>
          </div>

          {/* Live Sentence Preview Container */}
          <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-2 text-center">
            <div className="text-[11px] font-bold text-slate-400">
              💡 아래에서 고른 [동사]와 [명사]가 문장에 쏙 들어가요!
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-base sm:text-lg font-fun font-bold text-slate-800 py-1">
              <span className="px-3 py-1.5 bg-slate-200/90 rounded-xl text-slate-700 shadow-2xs">
                {question.subjectText}
              </span>

              {/* Verb Slot */}
              <span
                className={`px-3 py-1.5 rounded-xl border-2 transition-all flex flex-col items-center shadow-2xs ${
                  selectedVerb
                    ? 'border-blue-500 bg-blue-500 text-white scale-102'
                    : 'border-dashed border-blue-400 bg-blue-50 text-blue-600'
                }`}
              >
                <span className="text-[10px] font-medium leading-none opacity-80 mb-0.5">동사</span>
                <span>{selectedVerb || '? 동사 선택'}</span>
              </span>

              {/* Noun Slot */}
              <span
                className={`px-3 py-1.5 rounded-xl border-2 transition-all flex flex-col items-center shadow-2xs ${
                  selectedNoun
                    ? 'border-emerald-500 bg-emerald-500 text-white scale-102'
                    : 'border-dashed border-emerald-400 bg-emerald-50 text-emerald-600'
                }`}
              >
                <span className="text-[10px] font-medium leading-none opacity-80 mb-0.5">명사(목적어)</span>
                <span>{selectedNoun || '? 명사 선택'}</span>
              </span>

              {question.endText && (
                <span className="px-2 py-1 text-slate-600">
                  {question.endText}
                </span>
              )}
            </div>
          </div>

          {/* Slot 1: Verb Choices */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                <span>알맞은 <b>[동사]</b>를 골라주세요:</span>
              </span>
              {selectedVerb && (
                <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                  선택: {selectedVerb}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {question.verbOptions.map((vOpt, idx) => (
                <button
                  key={idx}
                  id={`slot-verb-opt-${idx}`}
                  onClick={() => {
                    soundManager.playTap();
                    setSelectedVerb(vOpt);
                  }}
                  className={`py-2.5 px-3 rounded-xl border-2 font-fun text-sm font-bold active:scale-95 transition-all shadow-2xs ${
                    selectedVerb === vOpt
                      ? 'border-blue-500 bg-blue-500 text-white shadow-xs'
                      : 'border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900'
                  }`}
                >
                  {vOpt}
                </button>
              ))}
            </div>
          </div>

          {/* Slot 2: Noun Choices */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                <span>알맞은 <b>[명사]</b>를 골라주세요:</span>
              </span>
              {selectedNoun && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  선택: {selectedNoun}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {question.nounOptions.map((nOpt, idx) => (
                <button
                  key={idx}
                  id={`slot-noun-opt-${idx}`}
                  onClick={() => {
                    soundManager.playTap();
                    setSelectedNoun(nOpt);
                  }}
                  className={`py-2.5 px-3 rounded-xl border-2 font-fun text-sm font-bold active:scale-95 transition-all shadow-2xs ${
                    selectedNoun === nOpt
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs'
                      : 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {nOpt}
                </button>
              ))}
            </div>
          </div>

          {/* Check Button */}
          <button
            id="check-slot-sentence-btn"
            disabled={!selectedVerb || !selectedNoun}
            onClick={handleCheckSlotSentence}
            className={`w-full py-3.5 rounded-2xl font-fun font-bold text-base flex items-center justify-center gap-2 shadow-md transition-all ${
              selectedVerb && selectedNoun
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white active:scale-98 cursor-pointer ring-2 ring-amber-300 ring-offset-1'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-5 h-5" />
            <span>
              {selectedVerb && selectedNoun ? '문장 완성 확인하기 ✨' : '동사와 명사를 모두 골라주세요!'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
