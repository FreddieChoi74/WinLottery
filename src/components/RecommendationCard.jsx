import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Flame, 
  Snowflake, 
  SlidersHorizontal, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Layers,
  CheckCircle2
} from 'lucide-react';
import LottoBall from './LottoBall';
import RadarChart from './RadarChart';

export default function RecommendationCard({
  stats,
  recommendations,
  onGenerate,
  mode,
  setMode,
  count,
  setCount,
  onOpenFilter,
  includeCount,
  excludeCount
}) {
  const [expandedGameId, setExpandedGameId] = useState('game-A');
  const [copiedId, setCopiedId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateClick = () => {
    setIsGenerating(true);
    // 화려한 컨페티 효과
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#3b82f6', '#ef4444', '#10b981', '#a855f7']
      });
    } catch (e) {}

    setTimeout(() => {
      onGenerate();
      setIsGenerating(false);
    }, 450);
  };

  const handleCopy = (item) => {
    const text = `${item.label}: ${item.numbers.join(', ')} (총합: ${item.sum}, 점수: ${item.totalScore}점)`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const modes = [
    {
      id: 'balanced',
      title: '황금 밸런스형',
      subtitle: '역대 정규분포 AI 표준 최적합',
      icon: <Sparkles className="mode-icon" color="#fbbf24" />
    },
    {
      id: 'hot',
      title: '상승세 트렌드형',
      subtitle: '최근 10주간 연속 기세 Hot',
      icon: <Flame className="mode-icon" color="#ef4444" />
    },
    {
      id: 'cold',
      title: '회귀 확률형',
      subtitle: '장기 미출현 반등 Cold',
      icon: <Snowflake className="mode-icon" color="#38bdf8" />
    }
  ];

  return (
    <section className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. 추천 알고리즘 모드 선택 */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={20} color="#38bdf8" />
            통계 추천 알고리즘 선택
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            1,240회 1등 빅데이터 분석 가중치
          </span>
        </div>

        <div className="modes-bar">
          {modes.map((m) => (
            <button
              key={m.id}
              className={`mode-tab-btn ${mode === m.id ? 'active' : ''}`}
              onClick={() => setMode(m.id)}
            >
              {m.icon}
              <span className="mode-title">{m.title}</span>
              <span className="mode-subtitle">{m.subtitle}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. 제어 옵션 및 생성 버튼 */}
      <div className="action-banner">
        <div className="action-options">
          <button onClick={onOpenFilter} className="custom-btn-secondary">
            <SlidersHorizontal size={16} />
            <span>맞춤 필터</span>
            {(includeCount > 0 || excludeCount > 0) && (
              <span style={{
                background: '#2563eb',
                color: '#fff',
                fontSize: '0.75rem',
                padding: '1px 6px',
                borderRadius: '999px',
                fontWeight: 700
              }}>
                +{includeCount}/-{excludeCount}
              </span>
            )}
          </button>

          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', padding: '3px' }}>
            <button
              onClick={() => setCount(1)}
              style={{
                background: count === 1 ? 'rgba(59,130,246,0.3)' : 'transparent',
                border: 'none',
                color: count === 1 ? '#60a5fa' : 'var(--text-secondary)',
                padding: '0.45rem 0.85rem',
                borderRadius: '0.6rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              1개 조합
            </button>
            <button
              onClick={() => setCount(5)}
              style={{
                background: count === 5 ? 'rgba(59,130,246,0.3)' : 'transparent',
                border: 'none',
                color: count === 5 ? '#60a5fa' : 'var(--text-secondary)',
                padding: '0.45rem 0.85rem',
                borderRadius: '0.6rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              5개 (1장 세트)
            </button>
          </div>
        </div>

        <button
          onClick={handleGenerateClick}
          className="generate-hero-btn"
          disabled={isGenerating}
        >
          <Sparkles size={20} />
          <span>{isGenerating ? '통계 최적 조합 산출 중...' : '다음주 1등 번호 제안 생성'}</span>
        </button>
      </div>

      {/* 3. 추천 번호 결과 목록 */}
      <div className="recommend-game-list">
        {recommendations.map((item) => {
          const isExpanded = expandedGameId === item.id;
          const { reasoning, radarMetrics } = item;

          return (
            <div key={item.id} className="game-card">
              {/* 상단 헤더 */}
              <div className="game-card-header">
                <div className="game-label-box">
                  <span className="game-tag">{item.label}</span>
                  <div className="score-badge">
                    <CheckCircle2 size={14} />
                    <span>통계 적합도 {item.totalScore}점</span>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    총합: <strong>{item.sum}</strong> | 홀짝 {item.oddCount}:{item.evenCount} | AC {item.ac}
                  </span>
                </div>

                <div className="game-actions">
                  <button
                    onClick={() => handleCopy(item)}
                    className="icon-btn-ghost"
                    title="조합 복사하기"
                  >
                    {copiedId === item.id ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
                  </button>

                  <button
                    onClick={() => setExpandedGameId(isExpanded ? null : item.id)}
                    className="custom-btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
                  >
                    <span>추천 이유 보기</span>
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>

              {/* 6개 로또 볼 */}
              <div className="game-balls-container">
                {item.numbers.map((num, i) => (
                  <LottoBall key={i} number={num} size="lg" animate={true} />
                ))}
              </div>

              {/* 추천 사유 & 통계 인포그래픽 아코디언 */}
              {isExpanded && reasoning && (
                <div className="reasoning-box">
                  <div className="reasoning-header">
                    <Info size={18} />
                    <span>왜 이 조합이 추천되었는가? (통계적 근거 리포트)</span>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: '#93c5fd', fontWeight: 500 }}>
                    💡 <strong>{reasoning.modeTitle}:</strong> {reasoning.modeDesc}
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.25rem',
                    alignItems: 'center'
                  }}>
                    {/* 통계 사유 불릿 포인트 */}
                    <div className="reason-bullets">
                      {reasoning.reasons.map((r, rIdx) => (
                        <div key={rIdx} className="reason-bullet-item">
                          <span className="bullet-icon">▸</span>
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>

                    {/* 6각형 레이더 차트 */}
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.4)',
                      padding: '1rem',
                      borderRadius: '0.85rem',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '0.5rem' }}>
                        역대 1등 당첨 데이터 대비 6대 통계 밸런스
                      </div>
                      <RadarChart metrics={radarMetrics} />
                    </div>
                  </div>

                  {/* 개별 번호별 스토리 뱃지 */}
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      개별 번호별 통계 프로파일 & 전략적 배치 이유:
                    </div>
                    <div className="number-stories-grid">
                      {reasoning.numberBadges.map((b) => (
                        <div key={b.number} className="number-story-chip">
                          <LottoBall number={b.number} size="sm" />
                          <div className="story-chip-desc">
                            <span className="story-num">{b.number}번 ({b.totalCount}회)</span>
                            <span className="story-tag" title={b.primaryTag}>{b.primaryTag}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
