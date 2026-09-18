import React from 'react';
import { Volume2, VolumeX, BookOpen, ArrowLeft } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  stageNumber?: number; // 1 ~ 8
  totalStages?: number; // 8
  stageTitle?: string;
  onOpenPrinciple?: () => void;
  onGoHome?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  showStageIndicator?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  stageNumber,
  totalStages = 8,
  stageTitle,
  onOpenPrinciple,
  onGoHome,
  soundEnabled,
  onToggleSound,
  showStageIndicator = true,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-amber-100 shadow-xs px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Left: Home/Back button & App Title */}
        <div className="flex items-center gap-2">
          {onGoHome && (
            <button
              id="header-home-btn"
              onClick={() => {
                soundManager.playTap();
                onGoHome();
              }}
              className="p-1.5 rounded-full hover:bg-amber-100 active:scale-95 transition-all text-amber-800"
              aria-label="홈으로 이동"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={onGoHome}>
            <span className="text-xl" role="img" aria-label="victory">✌️</span>
            <span className="font-fun text-lg font-bold text-amber-700 tracking-tight">
              영어 야호~!
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Principle (원리 쏙쏙) quick peek button */}
          {onOpenPrinciple && (
            <button
              id="header-principle-btn"
              onClick={() => {
                soundManager.playTap();
                onOpenPrinciple();
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 active:scale-95 rounded-full transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>원리보기</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            id="header-sound-btn"
            onClick={() => {
              onToggleSound();
            }}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 active:scale-95 transition-all"
            aria-label="소리 켜기/끄기"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-amber-600" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
          </button>

          {/* Stage Counter "1/8" at top right corner */}
          {showStageIndicator && stageNumber !== undefined && (
            <div
              id="stage-indicator-badge"
              className="flex items-center justify-center bg-amber-500 text-white font-fun font-black text-sm px-2.5 py-1 rounded-full shadow-xs border border-amber-600 tracking-wider"
              title={stageTitle || `단계 ${stageNumber}/${totalStages}`}
            >
              {stageNumber}/{totalStages}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
