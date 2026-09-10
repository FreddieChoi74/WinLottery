import React from 'react';

/**
 * 6대 통계 지표를 시각화하는 커스텀 SVG 레이더 차트
 */
export default function RadarChart({ metrics }) {
  // metrics: { sumScore, oddEvenScore, highLowScore, acScore, consecScore, frequencyScore }
  const labels = [
    { key: 'sumScore', label: '총합 밸런스' },
    { key: 'oddEvenScore', label: '홀짝 비율' },
    { key: 'highLowScore', label: '고저 비율' },
    { key: 'acScore', label: 'AC 복잡도' },
    { key: 'consecScore', label: '연번 통제' },
    { key: 'frequencyScore', label: '누적 빈도' }
  ];

  const size = 180;
  const center = size / 2;
  const radius = 60;
  const total = labels.length;

  // 꼭짓점 좌표 계산 헬퍼
  const getCoordinates = (value, index) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // 배경 격자 레벨 (25%, 50%, 75%, 100%)
  const gridLevels = [25, 50, 75, 100];

  // 데이터 폴리곤 점 생성
  const points = labels
    .map((item, idx) => {
      const val = metrics ? metrics[item.key] || 50 : 50;
      const { x, y } = getCoordinates(val, idx);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* 배경 격자선 */}
        {gridLevels.map((lvl) => {
          const gridPoints = labels
            .map((_, idx) => {
              const { x, y } = getCoordinates(lvl, idx);
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <polygon
              key={lvl}
              points={gridPoints}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* 방사형 축 선 */}
        {labels.map((_, idx) => {
          const { x, y } = getCoordinates(100, idx);
          return (
            <line
              key={idx}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />
          );
        })}

        {/* 데이터 영역 */}
        <polygon
          points={points}
          fill="url(#radarFill)"
          stroke="#38bdf8"
          strokeWidth="2"
        />

        {/* 꼭짓점 포인트 */}
        {labels.map((item, idx) => {
          const val = metrics ? metrics[item.key] || 50 : 50;
          const { x, y } = getCoordinates(val, idx);
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="3.5"
              fill="#ffffff"
              stroke="#0284c7"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px 12px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', textAlign: 'center' }}>
        {labels.map((l, i) => (
          <span key={i}>
            {l.label}: <strong style={{ color: '#38bdf8' }}>{metrics ? metrics[l.key] : 0}점</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
