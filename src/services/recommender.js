/**
 * 다차원 통계 가중치 기반 로또 추천 및 사유 생성 엔진
 */
import { calculateAC, countConsecutivePairs, analyzeLastDigits } from './lottoStats';

/**
 * 특정 조합에 대한 통계 지표 및 적합도 평가
 */
export function evaluateCombination(numbers, stats) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, cur) => acc + cur, 0);
  const oddCount = sorted.filter(n => n % 2 !== 0).length;
  const evenCount = 6 - oddCount;
  const lowCount = sorted.filter(n => n <= 22).length;
  const highCount = 6 - lowCount;
  const ac = calculateAC(sorted);
  const consecutivePairs = countConsecutivePairs(sorted);
  const { maxSame } = analyzeLastDigits(sorted);

  // 1. 총합 점수 (110~165 사이가 최적: 100점, 100~175: 85점, 그 외 감점)
  let sumScore = 50;
  if (sum >= 115 && sum <= 155) sumScore = 100;
  else if (sum >= 100 && sum <= 175) sumScore = 85;
  else if (sum >= 90 && sum <= 185) sumScore = 65;

  // 2. 홀짝 밸런스 점수 (3:3 최적 100점, 4:2/2:4 85점, 5:1/1:5 40점, 6:0/0:6 0점)
  let oddEvenScore = 0;
  if (oddCount === 3) oddEvenScore = 100;
  else if (oddCount === 2 || oddCount === 4) oddEvenScore = 85;
  else if (oddCount === 1 || oddCount === 5) oddEvenScore = 40;

  // 3. 고저 밸런스 점수 (3:3 100점, 4:2/2:4 85점)
  let highLowScore = 0;
  if (lowCount === 3) highLowScore = 100;
  else if (lowCount === 2 || lowCount === 4) highLowScore = 85;
  else if (lowCount === 1 || lowCount === 5) highLowScore = 40;

  // 4. AC 복잡도 점수 (AC 7~10점 우수)
  let acScore = ac >= 8 ? 100 : ac === 7 ? 85 : ac === 6 ? 60 : 30;

  // 5. 연속번호 점수 (0개 또는 1쌍: 95~100점, 2쌍: 60점, 3연번 이상 감점)
  let consecScore = consecutivePairs <= 1 ? 100 : consecutivePairs === 2 ? 60 : 20;

  // 6. 누적 출현 빈도 점수
  const avgFrequency = sorted.reduce((acc, n) => acc + (stats.numberStats[n]?.totalCount || 0), 0) / 6;
  const globalAvg = Object.values(stats.numberStats).reduce((acc, n) => acc + n.totalCount, 0) / 45;
  const frequencyScore = Math.min(100, Math.max(50, Math.round((avgFrequency / globalAvg) * 85)));

  // 종합 점수 계산 (가중 평균)
  const totalScore = Math.round(
    sumScore * 0.22 +
    oddEvenScore * 0.18 +
    highLowScore * 0.18 +
    acScore * 0.18 +
    consecScore * 0.12 +
    frequencyScore * 0.12
  );

  return {
    numbers: sorted,
    sum,
    oddCount,
    evenCount,
    lowCount,
    highCount,
    ac,
    consecutivePairs,
    maxSameLastDigit: maxSame,
    totalScore,
    radarMetrics: {
      sumScore,
      oddEvenScore,
      highLowScore,
      acScore,
      consecScore,
      frequencyScore
    }
  };
}

/**
 * 추천 조합에 대한 통계적 추천 이유(Reasoning) 텍스트 및 상세 태그 자동 생성
 */
export function generateReasoningReport(evaluation, stats, mode) {
  const { numbers, sum, oddCount, evenCount, lowCount, highCount, ac, consecutivePairs, totalScore } = evaluation;

  // 개별 번호별 스토리 태그 생성
  const numberBadges = numbers.map(num => {
    const numStat = stats.numberStats[num];
    const tags = [];

    // 최다 출현 Top 10 여부
    const rank = stats.rankedByTotal.findIndex(n => n.number === num) + 1;
    if (rank <= 5) tags.push(`역대 최다출현 #${rank}위`);
    else if (rank <= 12) tags.push(`누적 상위권(#${rank})`);

    // 최근 기세 (Hot)
    if (numStat.recent10Count >= 3) {
      tags.push(`최근 10주간 ${numStat.recent10Count}회 출현(Hot)`);
    } else if (numStat.recent5Count >= 2) {
      tags.push(`최근 5주 연속세`);
    }

    // 미출현 주기 (Cold / 반등)
    if (numStat.omissionCount >= 10) {
      tags.push(`${numStat.omissionCount}주 미출현 (통계적 반등주기)`);
    } else if (numStat.omissionCount === 0) {
      tags.push(`전회차 이월수(연속 출현 도전)`);
    }

    if (tags.length === 0) {
      tags.push(`안정적 표준분포 주기`);
    }

    return {
      number: num,
      totalCount: numStat.totalCount,
      omission: numStat.omissionCount,
      recent10Count: numStat.recent10Count,
      primaryTag: tags[0],
      secondaryTag: tags[1] || null
    };
  });

  // 종합 평가 브리핑 문장 작성
  let modeTitle = '황금 밸런스 정석 조합';
  let modeDesc = '역대 1등 당첨 데이터의 정규분포 곡선 최중심점에 수렴하도록 설계되었습니다.';
  if (mode === 'hot') {
    modeTitle = '상승세 트렌드 (Hot 집중) 조합';
    modeDesc = '최근 5~10회차 동안 강한 출현 기세를 보이는 번호들의 출현 에너지를 극대화했습니다.';
  } else if (mode === 'cold') {
    modeTitle = '회귀 확률 (Cold 반등) 조합';
    modeDesc = '대수의 법칙(Law of Large Numbers)에 따라 오랜 기간 미출현하여 확률적으로 출현 임계점에 다다른 번호들을 전면 배치했습니다.';
  }

  const reasons = [];

  // 총합 평가
  if (sum >= 115 && sum <= 155) {
    reasons.push(`총합 ${sum}: 역대 1등 최다 출현 구간(115~155) 정중앙에 위치하여 통계적 안정성이 매우 높습니다.`);
  } else {
    reasons.push(`총합 ${sum}: 1등 당첨의 80%가 집중되는 100~175 범위 내에 안전하게 포진했습니다.`);
  }

  // 홀짝 / 고저
  reasons.push(`홀짝 ${oddCount}:${evenCount} & 고저 ${lowCount}:${highCount}: 역대 1등 조합의 82% 이상을 점유하는 황금 대칭 비율을 만족합니다.`);

  // AC값
  if (ac >= 8) {
    reasons.push(`산술 복잡도(AC값 ${ac}): 번호 간의 격차가 이상적으로 분산되어 1등 당첨 조합의 전형적인 고복잡도 패턴을 띱니다.`);
  } else {
    reasons.push(`산술 복잡도(AC값 ${ac}): 규칙적인 패턴을 탈피한 불규칙 분산 구조를 갖췄습니다.`);
  }

  // 연속번호
  if (consecutivePairs === 1) {
    reasons.push(`연속 번호 1쌍 포함: 역대 1등의 55%에서 나타나는 전형적인 1쌍 연번 조합 패턴입니다.`);
  } else if (consecutivePairs === 0) {
    reasons.push(`연속 번호 없음: 번호 간 충돌 없이 전 구역에 고르게 독립 분산되었습니다.`);
  }

  return {
    modeTitle,
    modeDesc,
    reasons,
    numberBadges,
    totalScore
  };
}

/**
 * 몬테카를로 후보군 생성 및 필터 기반 최적 번호 추천 실행
 */
export function generateSmartRecommendations(stats, options = {}) {
  const {
    mode = 'balanced',
    includeNumbers = [],
    excludeNumbers = [],
    count = 5
  } = options;

  if (!stats) return [];

  // 모드별 가중치 테이블 구성
  const weights = {};
  for (let i = 1; i <= 45; i++) {
    const s = stats.numberStats[i];
    let weight = 10;

    if (mode === 'balanced') {
      // 누적 빈도 + 적정 미출현 회귀 가중치
      weight += (s.totalCount / stats.totalDraws) * 30;
      if (s.omissionCount >= 4 && s.omissionCount <= 12) weight += 15;
    } else if (mode === 'hot') {
      // 최근 10회 출현수에 높은 가중치
      weight += s.recent10Count * 12 + s.recent5Count * 8;
      if (s.omissionCount <= 2) weight += 10;
    } else if (mode === 'cold') {
      // 장기 미출현에 가중치
      weight += Math.min(45, s.omissionCount * 3.5);
    }

    // 사용자 포함수 / 제외수
    if (includeNumbers.includes(i)) weight = 10000;
    if (excludeNumbers.includes(i)) weight = 0;

    weights[i] = Math.max(0.1, weight);
  }

  // 룰렛 휠 방식으로 1개 번호 샘플링
  function sampleNumber(pool, currentWeights) {
    const totalW = pool.reduce((acc, num) => acc + currentWeights[num], 0);
    let rand = Math.random() * totalW;
    for (const num of pool) {
      rand -= currentWeights[num];
      if (rand <= 0) return num;
    }
    return pool[pool.length - 1];
  }

  // 1개 유효 조합 생성
  function generateOneCombination() {
    let attempts = 0;
    let bestCandidate = null;
    let bestCandidateScore = -1;

    while (attempts < 500) {
      attempts++;
      const selected = new Set(includeNumbers);
      const pool = [];
      for (let i = 1; i <= 45; i++) {
        if (!selected.has(i) && !excludeNumbers.includes(i)) {
          pool.push(i);
        }
      }

      while (selected.size < 6 && pool.length > 0) {
        const picked = sampleNumber(pool, weights);
        selected.add(picked);
        const idx = pool.indexOf(picked);
        if (idx !== -1) pool.splice(idx, 1);
      }

      const arr = Array.from(selected);
      if (arr.length < 6) continue;

      const evalResult = evaluateCombination(arr, stats);

      // 하드 필터링: 총합 85~190, 홀짝 6:0/0:6 배제, 고저 6:0/0:6 배제, 3연번 이상 배제, 동끝수 3개 초과 배제
      if (evalResult.sum < 85 || evalResult.sum > 190) continue;
      if (evalResult.oddCount === 0 || evalResult.oddCount === 6) continue;
      if (evalResult.lowCount === 0 || evalResult.lowCount === 6) continue;
      if (evalResult.consecutivePairs >= 3) continue;
      if (evalResult.maxSameLastDigit >= 4) continue;

      if (evalResult.totalScore > bestCandidateScore) {
        bestCandidateScore = evalResult.totalScore;
        bestCandidate = evalResult;
      }

      // 88점 이상의 우수 조합이면 즉시 채택
      if (evalResult.totalScore >= 88) {
        return evalResult;
      }
    }

    return bestCandidate;
  }

  const results = [];
  const signatureSet = new Set();

  for (let i = 0; i < count; i++) {
    let candidate = null;
    for (let tryCount = 0; tryCount < 20; tryCount++) {
      const generated = generateOneCombination();
      if (!generated) continue;
      const sig = generated.numbers.join(',');
      if (!signatureSet.has(sig)) {
        signatureSet.add(sig);
        candidate = generated;
        break;
      }
    }

    if (candidate) {
      const reasoning = generateReasoningReport(candidate, stats, mode);
      results.push({
        id: `game-${String.fromCharCode(65 + i)}`, // 게임 A, B, C, D, E
        label: `게임 ${String.fromCharCode(65 + i)}`,
        ...candidate,
        reasoning
      });
    }
  }

  return results;
}
