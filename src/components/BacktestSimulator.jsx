import React, { useState } from 'react';
import { History, Play, Check, Award, AlertCircle } from 'lucide-react';
import LottoBall from './LottoBall';

export default function BacktestSimulator({ draws }) {
  const [selectedNums, setSelectedNums] = useState([]);
  const [results, setResults] = useState(null);

  const toggleNumber = (num) => {
    if (selectedNums.includes(num)) {
      setSelectedNums(selectedNums.filter(n => n !== num));
    } else {
      if (selectedNums.length >= 6) return;
      setSelectedNums([...selectedNums, num].sort((a, b) => a - b));
    }
  };

  const runBacktest = () => {
    if (selectedNums.length !== 6 || !draws) return;

    let rnk1 = 0;
    let rnk2 = 0;
    let rnk3 = 0;
    let rnk4 = 0;
    let rnk5 = 0;
    const historyMatches = [];

    const mySet = new Set(selectedNums);

    draws.forEach((draw) => {
      const matchCount = draw.numbers.filter(n => mySet.has(n)).length;
      const matchBonus = mySet.has(draw.bonus);

      if (matchCount === 6) {
        rnk1++;
        historyMatches.push({ draw, rank: '1등', prize: draw.firstWinamnt });
      } else if (matchCount === 5 && matchBonus) {
        rnk2++;
        historyMatches.push({ draw, rank: '2등', prize: 50000000 });
      } else if (matchCount === 5) {
        rnk3++;
        historyMatches.push({ draw, rank: '3등', prize: 1500000 });
      } else if (matchCount === 4) {
        rnk4++;
      } else if (matchCount === 3) {
        rnk5++;
      }
    });

    setResults({
      totalTested: draws.length,
      rnk1,
      rnk2,
      rnk3,
      rnk4,
      rnk5,
      historyMatches: historyMatches.reverse().slice(0, 10)
    });
  };

  return (
    <section className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={20} color="#a855f7" />
          나의 번호 역대 당첨 이력 백테스터
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          선택한 6개 번호가 1회부터 {draws?.length || 1240}회까지 과거에 1~5등에 당첨된 적이 있는지 역대 전수 검증합니다.
        </p>
      </div>

      {/* 선택된 번호 디스플레이 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '0.85rem 1.25rem',
        borderRadius: '0.85rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>선택된 번호:</span>
          {selectedNums.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>아래에서 6개를 선택하세요</span>}
          {selectedNums.map((num) => (
            <LottoBall key={num} number={num} size="md" />
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setSelectedNums([])}
            className="custom-btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
          >
            초기화
          </button>
          <button
            onClick={runBacktest}
            className="generate-hero-btn"
            style={{
              padding: '0.55rem 1.25rem',
              fontSize: '0.9rem',
              background: selectedNums.length === 6 ? 'linear-gradient(135deg, #9333ea, #4f46e5)' : 'rgba(255,255,255,0.1)',
              cursor: selectedNums.length === 6 ? 'pointer' : 'not-allowed'
            }}
            disabled={selectedNums.length !== 6}
          >
            <Play size={15} /> 과거 당첨 검증 실행
          </button>
        </div>
      </div>

      {/* 번호 선택판 */}
      <div className="num-picker-grid">
        {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => {
          const isSelected = selectedNums.includes(num);
          return (
            <button
              key={num}
              onClick={() => toggleNumber(num)}
              className={`picker-btn ${isSelected ? 'selected' : ''}`}
              style={isSelected ? {
                background: '#7c3aed',
                borderColor: '#c084fc',
                color: '#ffffff'
              } : {}}
            >
              {num}
            </button>
          );
        })}
      </div>

      {/* 백테스트 결과 리포트 */}
      {results && (
        <div style={{
          background: 'rgba(11, 17, 29, 0.7)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '1rem',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc', fontWeight: 800 }}>
            <Award size={20} />
            <span>역대 전수 검증 결과 (총 {results.totalTested}회차 시뮬레이션)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '0.6rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#f87171' }}>1등 당첨 (6개)</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: results.rnk1 > 0 ? '#f87171' : 'var(--text-muted)' }}>
                {results.rnk1}회
              </div>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '0.6rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>2등 당첨 (5+보너스)</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: results.rnk2 > 0 ? '#fbbf24' : 'var(--text-muted)' }}>
                {results.rnk2}회
              </div>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '0.6rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>3등 당첨 (5개)</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: results.rnk3 > 0 ? '#38bdf8' : 'var(--text-muted)' }}>
                {results.rnk3}회
              </div>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '0.6rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#34d399' }}>4등 당첨 (4개, 5만원)</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                {results.rnk4}회
              </div>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '0.6rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>5등 당첨 (3개, 5천원)</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                {results.rnk5}회
              </div>
            </div>
          </div>

          {results.historyMatches.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                상위 등수(1~3등) 매칭 회차:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.35rem' }}>
                {results.historyMatches.map((m, idx) => (
                  <div key={idx} style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.6rem', borderRadius: '0.4rem' }}>
                    <span>제 {m.draw.drwNo}회 ({m.draw.date}) - <strong style={{ color: '#c084fc' }}>{m.rank}</strong></span>
                    <span>1등 당첨번호: {m.draw.numbers.join(', ')} + {m.draw.bonus}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
