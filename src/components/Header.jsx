import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Trophy, Award } from 'lucide-react';
import LottoBall from './LottoBall';

export default function Header({ latestDraw, totalDraws }) {
  const [timeLeft, setTimeLeft] = useState('');

  // 매주 토요일 오후 8시 45분 카운트다운 계산
  useEffect(() => {
    function calculateCountdown() {
      const now = new Date();
      // 한국 시간 기준
      const target = new Date(now);
      const day = now.getDay(); // 0: 일, 6: 토
      
      let daysUntilSaturday = (6 - day + 7) % 7;
      // 토요일인데 이미 20:45를 넘겼으면 다음 주 토요일로
      if (day === 6) {
        const drawTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 45, 0);
        if (now.getTime() > drawTime.getTime()) {
          daysUntilSaturday = 7;
        }
      }

      target.setDate(now.getDate() + daysUntilSaturday);
      target.setHours(20, 45, 0, 0);

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft('추첨 진행 중');
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(`D-${d} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const nextDrawNo = latestDraw ? latestDraw.drwNo + 1 : 1241;
  const formattedPrize = latestDraw?.firstWinamnt 
    ? (latestDraw.firstWinamnt / 100000000).toFixed(1) + '억원'
    : '17.9억원';

  return (
    <header className="glass-panel header-hero">
      <div className="header-top">
        <div className="brand-badge">
          <div className="brand-logo-icon">
            <Sparkles size={24} color="#ffffff" />
          </div>
          <div>
            <h1 className="brand-title">
              LottoScope
              <span className="brand-tag">BigData AI</span>
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              1회부터 {totalDraws || '1,240'}회 전수 데이터 기반 통계·확률 제안
            </p>
          </div>
        </div>

        <div className="d-day-badge">
          <div className="pulse-dot"></div>
          <Clock size={16} />
          <span>제 {nextDrawNo}회 추첨까지 <strong>{timeLeft}</strong></span>
        </div>
      </div>

      {latestDraw && (
        <div className="latest-draw-banner">
          <div className="latest-info-left">
            <div className="latest-drw-title">
              <Trophy size={18} color="#fbbf24" />
              <span>직전 제 {latestDraw.drwNo}회 1등 당첨 결과</span>
            </div>
            <span className="latest-drw-date">{latestDraw.date} 추첨</span>
          </div>

          <div className="latest-numbers-row">
            {latestDraw.numbers.map((num, i) => (
              <LottoBall key={i} number={num} size="md" />
            ))}
            <span className="plus-sign">+</span>
            <LottoBall number={latestDraw.bonus} size="md" isBonus={true} />
          </div>

          <div className="latest-prize-tag">
            <div className="prize-amount">
              1등 {formattedPrize}
            </div>
            <div className="prize-sub">
              총 {latestDraw.firstPrzwnerCo}명 당첨
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
