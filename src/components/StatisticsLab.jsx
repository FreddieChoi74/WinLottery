import React, { useState } from 'react';
import { BarChart3, TrendingUp, AlertCircle, History } from 'lucide-react';
import LottoBall from './LottoBall';
import { getBallHexColor } from '../services/lottoStats';

export default function StatisticsLab({ stats }) {
  const [activeSubTab, setActiveSubTab] = useState('frequency'); // frequency, trends, distribution
  const [selectedNum, setSelectedNum] = useState(null);

  if (!stats) return null;

  const maxTotal = stats.rankedByTotal[0]?.totalCount || 200;

  return (
    <section className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} color="#38bdf8" />
            빅데이터 통계 분석 랩 (1회 ~ {stats.totalDraws}회)
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            역대 1등 당첨 전수 데이터를 기반으로 수학적 분포와 출현 주기를 시각화합니다.
          </p>
        </div>

        {/* 서브 탭 */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', padding: '3px' }}>
          <button
            onClick={() => setActiveSubTab('frequency')}
            style={{
              background: activeSubTab === 'frequency' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
              border: 'none',
              color: activeSubTab === 'frequency' ? '#38bdf8' : 'var(--text-secondary)',
              padding: '0.45rem 0.85rem',
              borderRadius: '0.6rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            출현 빈도 차트
          </button>
          <button
            onClick={() => setActiveSubTab('trends')}
            style={{
              background: activeSubTab === 'trends' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
              border: 'none',
              color: activeSubTab === 'trends' ? '#38bdf8' : 'var(--text-secondary)',
              padding: '0.45rem 0.85rem',
              borderRadius: '0.6rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Hot & Cold 트렌드
          </button>
          <button
            onClick={() => setActiveSubTab('distribution')}
            style={{
              background: activeSubTab === 'distribution' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
              border: 'none',
              color: activeSubTab === 'distribution' ? '#38bdf8' : 'var(--text-secondary)',
              padding: '0.45rem 0.85rem',
              borderRadius: '0.6rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            역대 통계 법칙
          </button>
        </div>
      </div>

      {/* 탭 1: 1~45번 전체 출현 빈도 차트 */}
      {activeSubTab === 'frequency' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>번호를 클릭하면 상세 통계를 확인할 수 있습니다 (가로 스크롤 가능).</span>
            {selectedNum && (
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                {selectedNum}번: 총 {stats.numberStats[selectedNum]?.totalCount}회 출현 (최근 {stats.numberStats[selectedNum]?.omissionCount}회 미출현)
              </span>
            )}
          </div>

          <div className="frequency-scroll-container">
            <div className="frequency-bars-flex">
              {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => {
                const s = stats.numberStats[num];
                const heightPct = Math.max(10, (s.totalCount / maxTotal) * 100);
                const color = getBallHexColor(num);
                const isSelected = selectedNum === num;

                return (
                  <div
                    key={num}
                    className="bar-column"
                    onClick={() => setSelectedNum(isSelected ? null : num)}
                    title={`${num}번: ${s.totalCount}회 출현`}
                  >
                    <span className="bar-count-label">{s.totalCount}</span>
                    <div
                      className="bar-fill"
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: color,
                        boxShadow: isSelected ? `0 0 12px ${color}` : 'none',
                        border: isSelected ? '2px solid #ffffff' : 'none'
                      }}
                    />
                    <LottoBall number={num} size="sm" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 탭 2: Hot & Cold 트렌드 */}
      {activeSubTab === 'trends' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {/* 최근 10회 최다 출현 (Hot) */}
          <div className="stat-metric-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: 700 }}>
              <TrendingUp size={18} />
              <span>최근 10주간 최고 기세 (Hot Top 5)</span>
            </div>
            <p className="metric-desc">최근 10회차 이내에 3회 이상 등장하며 강한 에너지를 보이는 번호들입니다.</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              {stats.hotNumbers.slice(0, 5).map((n) => (
                <div key={n.number} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <LottoBall number={n.number} size="md" />
                  <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700 }}>
                    10주 중 {n.recent10Count}회
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 장기 미출현 (Cold) */}
          <div className="stat-metric-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 700 }}>
              <AlertCircle size={18} />
              <span>장기 미출현 반등 후보 (Cold Top 5)</span>
            </div>
            <p className="metric-desc">평균 회귀 법칙에 따라 장기간 미출현하여 확률적으로 출현 주기에 진입한 번호입니다.</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              {stats.coldNumbers.slice(0, 5).map((n) => (
                <div key={n.number} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <LottoBall number={n.number} size="md" />
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>
                    {n.omissionCount}주 미출현
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 탭 3: 역대 통계 법칙 (분포 요약) */}
      {activeSubTab === 'distribution' && (
        <div className="stats-summary-grid">
          <div className="stat-metric-card">
            <span className="metric-title">총합 골든 구간 (100 ~ 175)</span>
            <div className="metric-value" style={{ color: '#38bdf8' }}>
              {(((stats.sumDist['100to130'] + stats.sumDist['131to160'] + stats.sumDist['161to180']) / stats.totalDraws) * 100).toFixed(1)}%
            </div>
            <span className="metric-desc">
              역대 1등 조합의 10건 중 8건 이상이 100~175 사이에 집중됩니다.
            </span>
          </div>

          <div className="stat-metric-card">
            <span className="metric-title">홀짝 황금 밸런스 (3:3, 4:2, 2:4)</span>
            <div className="metric-value" style={{ color: '#34d399' }}>
              {(((stats.oddEvenDist['3:3'] + stats.oddEvenDist['4:2'] + stats.oddEvenDist['2:4']) / stats.totalDraws) * 100).toFixed(1)}%
            </div>
            <span className="metric-desc">
              완전 몰림(6:0, 0:6)은 1% 미만으로 극히 드물며 균형을 유지합니다.
            </span>
          </div>

          <div className="stat-metric-card">
            <span className="metric-title">AC 산술 복잡도 (7점 이상)</span>
            <div className="metric-value" style={{ color: '#fbbf24' }}>
              {(
                ((Object.entries(stats.acDist)
                  .filter(([ac]) => Number(ac) >= 7)
                  .reduce((acc, [, v]) => acc + v, 0) / stats.totalDraws) * 100
                ).toFixed(1)
              )}%
            </div>
            <span className="metric-desc">
              번호 간 간격이 복잡하고 규칙성 없이 분산된 구조를 띱니다.
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
