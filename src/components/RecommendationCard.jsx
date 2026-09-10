import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
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
  CheckCircle2,
  Camera,
  Download
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
  const [isSavingImage, setIsSavingImage] = useState(false);
  const ticketRef = useRef(null);

  const handleGenerateClick = () => {
    setIsGenerating(true);
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

  // 추천 번호 카드 영역을 고화질 PNG 이미지로 변환하여 갤러리/다운로드에 저장
  // 1. 카카오톡 채팅창에 즉시 Ctrl+V 할 수 있도록 '이미지 데이터'를 클립보드에 복사
  const handleCopyImageToClipboard = async () => {
    if (!ticketRef.current) return;
    setIsSavingImage(true);

    const modeName = mode === 'balanced' ? '황금밸런스형' : mode === 'hot' ? '상승세트렌드형' : '회귀확률형';
    const nextDrawNo = stats?.latestDraw ? stats.latestDraw.drwNo + 1 : 1241;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#090d16',
        scale: 2,
        useCORS: true,
        logging: false
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('이미지 생성에 실패했습니다.');
          setIsSavingImage(false);
          return;
        }

        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          alert(`✅ [${modeName}] 번호표 이미지가 복사되었습니다!\n\n카카오톡 채팅창을 클릭하고 [Ctrl + V] (붙여넣기)를 누르시면 사진이 바로 전송됩니다.`);
        } catch (clipErr) {
          triggerFileDownload(canvas.toDataURL('image/png'), `LottoScope_제${nextDrawNo}회_[${modeName}]_추천번호.png`);
        }
        setIsSavingImage(false);
      }, 'image/png');
    } catch (err) {
      console.error('이미지 복사 오류:', err);
      alert('이미지 복사 중 오류가 발생했습니다.');
      setIsSavingImage(false);
    }
  };

  // 2. 내 컴퓨터 '다운로드' 폴더에 고화질 파일로 직접 저장
  const handleDownloadImageFile = async () => {
    if (!ticketRef.current) return;
    setIsSavingImage(true);

    try {
      const modeName = mode === 'balanced' ? '황금밸런스형' : mode === 'hot' ? '상승세트렌드형' : '회귀확률형';
      const nextDrawNo = stats?.latestDraw ? stats.latestDraw.drwNo + 1 : 1241;
      const fileName = `LottoScope_제${nextDrawNo}회_[${modeName}]_추천번호.png`;

      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#090d16',
        scale: 2,
        useCORS: true,
        logging: false
      });

      triggerFileDownload(canvas.toDataURL('image/png'), fileName);
      setIsSavingImage(false);
    } catch (err) {
      console.error('다운로드 오류:', err);
      alert('파일 다운로드 중 오류가 발생했습니다.');
      setIsSavingImage(false);
    }
  };

  const triggerFileDownload = (dataUrl, fileName) => {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert(`💾 파일이 다운로드 폴더에 저장되었습니다!\n파일명: ${fileName}`);
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

          <button
            onClick={handleCopyImageToClipboard}
            className="custom-btn-secondary"
            disabled={isSavingImage || recommendations.length === 0}
            title="클릭 후 카카오톡 채팅창에서 [Ctrl + V] 누르면 사진이 바로 전송됩니다"
            style={{ color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)', background: 'rgba(251, 191, 36, 0.08)' }}
          >
            <Camera size={16} />
            <span>{isSavingImage ? '처리 중...' : '📋 이미지 복사 (카톡 붙여넣기)'}</span>
          </button>

          <button
            onClick={handleDownloadImageFile}
            className="custom-btn-secondary"
            disabled={isSavingImage || recommendations.length === 0}
            title="내 컴퓨터 다운로드 폴더에 PNG 이미지 파일로 저장"
            style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.35)', background: 'rgba(56, 189, 248, 0.08)' }}
          >
            <Download size={16} />
            <span>파일 저장</span>
          </button>
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

      {/* 3. 추천 번호 결과 목록 (이미지 캡처 대상) */}
      <div ref={ticketRef} style={{ background: '#090d16', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {/* 캡처 이미지 상단: 크고 선명한 전략 모드 공식 인증 배너 */}
        <div style={{
          background: mode === 'balanced' 
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(15, 23, 42, 0.95))'
            : mode === 'hot'
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(15, 23, 42, 0.95))'
            : 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(15, 23, 42, 0.95))',
          border: `2px solid ${mode === 'balanced' ? '#f59e0b' : mode === 'hot' ? '#ef4444' : '#38bdf8'}`,
          borderRadius: '1rem',
          padding: '1.15rem 1.4rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.85rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.5rem' }}>
                {mode === 'balanced' ? '🌟' : mode === 'hot' ? '🔥' : '❄️'}
              </span>
              <h2 style={{
                fontSize: '1.4rem',
                fontWeight: 900,
                color: mode === 'balanced' ? '#fbbf24' : mode === 'hot' ? '#f87171' : '#38bdf8',
                letterSpacing: '-0.02em'
              }}>
                {modes.find(m => m.id === mode)?.title} 추천번호표
              </h2>
              <span style={{
                fontSize: '0.85rem',
                background: '#2563eb',
                padding: '2px 8px',
                borderRadius: '6px',
                color: '#fff',
                fontWeight: 800
              }}>
                제 {stats?.latestDraw ? stats.latestDraw.drwNo + 1 : 1241}회
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500 }}>
              📌 {modes.find(m => m.id === mode)?.subtitle} | 역대 1,240회 빅데이터 통계 AI 추천
            </p>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>
              🎰 LottoScope BigData
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              발급일: {new Date().toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>

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
      </div>
    </section>
  );
}
