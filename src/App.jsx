import React, { useState, useMemo, useEffect } from 'react';
import historyData from './data/lotto_history.json';
import { computeLottoStats } from './services/lottoStats';
import { generateSmartRecommendations } from './services/recommender';

import Header from './components/Header';
import RecommendationCard from './components/RecommendationCard';
import StatisticsLab from './components/StatisticsLab';
import BacktestSimulator from './components/BacktestSimulator';
import FilterModal from './components/FilterModal';
import { Sparkles, BarChart2, History, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('recommend'); // 'recommend' | 'stats' | 'backtest'
  
  // 추천기 설정 상태
  const [mode, setMode] = useState('balanced'); // 'balanced' | 'hot' | 'cold'
  const [count, setCount] = useState(5); // 1 or 5
  const [includeNumbers, setIncludeNumbers] = useState([]);
  const [excludeNumbers, setExcludeNumbers] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [recommendations, setRecommendations] = useState([]);

  // 1. 역대 통계 데이터 메모이제이션 (0ms 즉시 계산)
  const stats = useMemo(() => {
    return computeLottoStats(historyData.draws || []);
  }, []);

  // 2. 추천 생성 핸들러
  const handleGenerate = (targetMode = mode, targetCount = count, inc = includeNumbers, exc = excludeNumbers) => {
    if (!stats) return;
    const generated = generateSmartRecommendations(stats, {
      mode: targetMode,
      count: targetCount,
      includeNumbers: inc,
      excludeNumbers: exc
    });
    setRecommendations(generated);
  };

  // 3. 초기 로드 시 1회 자동 생성
  useEffect(() => {
    if (stats) {
      handleGenerate('balanced', 5, [], []);
    }
  }, [stats]);

  // 모드나 개수 변경 시 재생성
  const handleModeChange = (newMode) => {
    setMode(newMode);
    handleGenerate(newMode, count, includeNumbers, excludeNumbers);
  };

  const handleCountChange = (newCount) => {
    setCount(newCount);
    handleGenerate(mode, newCount, includeNumbers, excludeNumbers);
  };

  const handleCloseFilter = () => {
    setIsFilterOpen(false);
    handleGenerate(mode, count, includeNumbers, excludeNumbers);
  };

  return (
    <div className="app-container">
      {/* 1. 상단 히어로 헤더 */}
      <Header
        latestDraw={stats?.latestDraw}
        totalDraws={stats?.totalDraws}
      />

      {/* 2. 메인 네비게이션 탭 */}
      <nav className="main-nav-tabs">
        <button
          className={`nav-tab-item ${activeTab === 'recommend' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommend')}
        >
          <Sparkles size={18} />
          <span>AI 확률 번호 제안</span>
        </button>
        <button
          className={`nav-tab-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <BarChart2 size={18} />
          <span>빅데이터 분석 랩</span>
        </button>
        <button
          className={`nav-tab-item ${activeTab === 'backtest' ? 'active' : ''}`}
          onClick={() => setActiveTab('backtest')}
        >
          <History size={18} />
          <span>역대 당첨 백테스터</span>
        </button>
      </nav>

      {/* 3. 탭별 컨텐츠 렌더링 */}
      <main>
        {activeTab === 'recommend' && (
          <RecommendationCard
            stats={stats}
            recommendations={recommendations}
            onGenerate={() => handleGenerate(mode, count, includeNumbers, excludeNumbers)}
            mode={mode}
            setMode={handleModeChange}
            count={count}
            setCount={handleCountChange}
            onOpenFilter={() => setIsFilterOpen(true)}
            includeCount={includeNumbers.length}
            excludeCount={excludeNumbers.length}
          />
        )}

        {activeTab === 'stats' && (
          <StatisticsLab stats={stats} />
        )}

        {activeTab === 'backtest' && (
          <BacktestSimulator draws={historyData.draws} />
        )}
      </main>

      {/* 4. 맞춤 필터 모달 */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={handleCloseFilter}
        includeNumbers={includeNumbers}
        setIncludeNumbers={setIncludeNumbers}
        excludeNumbers={excludeNumbers}
        setExcludeNumbers={setExcludeNumbers}
      />

      {/* 5. 푸터 */}
      <footer className="app-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#94a3b8' }}>
          <ShieldCheck size={16} color="#34d399" />
          <span>대한민국 동행복권 6/45 공식 1등 당첨 데이터 전수(1회 ~ {stats?.totalDraws}회) 동기화 완료</span>
        </div>
        <p>
          매주 토요일 21:15 KST 신규 회차 자동 업데이트 파이프라인 가동 중 | No-DB 인메모리 초고속 엔진
        </p>
        <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>
          * 본 서비스의 추천 번호는 통계적 정규분포 및 과거 출현 패턴에 기반한 분석 참고용이며, 당첨을 보장하지 않습니다. 복권은 건전한 소액으로 즐기시기 바랍니다.
        </p>
      </footer>
    </div>
  );
}
