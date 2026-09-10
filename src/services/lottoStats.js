/**
 * 로또 6/45 역대 데이터 통계 분석 엔진
 */

// 로또 공 색상 규격 반환
export function getBallColorClass(num) {
  if (num <= 10) return 'ball-yellow';
  if (num <= 20) return 'ball-blue';
  if (num <= 30) return 'ball-red';
  if (num <= 40) return 'ball-gray';
  return 'ball-green';
}

export function getBallHexColor(num) {
  if (num <= 10) return '#f59e0b'; // Amber/Gold
  if (num <= 20) return '#3b82f6'; // Blue
  if (num <= 30) return '#ef4444'; // Red
  if (num <= 40) return '#6b7280'; // Slate Gray
  return '#10b981'; // Emerald Green
}

/**
 * AC값(Arithmetic Complexity, 산술적 복잡도) 계산
 * 6개 번호의 15개 차이값(d = |a - b|) 중 고유한 값의 개수 - 5
 * AC값 범위: 0 ~ 10 (로또 1등 당첨의 85% 이상이 7~10 사이에 분포)
 */
export function calculateAC(numbers) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const diffs = new Set();
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      diffs.add(Math.abs(sorted[i] - sorted[j]));
    }
  }
  return diffs.size - (numbers.length - 1);
}

/**
 * 연속 번호(연번) 쌍 개수 계산 (예: [3, 4, 15, 16, 28, 30] -> 2쌍)
 */
export function countConsecutivePairs(numbers) {
  const sorted = [...numbers].sort((a, b) => a - b);
  let pairs = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] === 1) {
      pairs++;
    }
  }
  return pairs;
}

/**
 * 끝자리 동일 번호(동끝수) 분석
 */
export function analyzeLastDigits(numbers) {
  const counts = {};
  numbers.forEach(n => {
    const last = n % 10;
    counts[last] = (counts[last] || 0) + 1;
  });
  const maxSame = Math.max(...Object.values(counts));
  return { counts, maxSame };
}

/**
 * 전체 회차 통계 집계 계산기
 */
export function computeLottoStats(draws) {
  if (!draws || draws.length === 0) return null;

  const totalDraws = draws.length;
  const latestDraw = draws[draws.length - 1];

  // 1~45 각 번호별 통계 초기화
  const numberStats = {};
  for (let i = 1; i <= 45; i++) {
    numberStats[i] = {
      number: i,
      totalCount: 0,
      bonusCount: 0,
      lastDrawNo: 0,
      omissionCount: 0, // 미출현 기간
      recent5Count: 0,  // 최근 5회 출현수
      recent10Count: 0, // 최근 10회 출현수
      frequencyRate: 0  // 백분율
    };
  }

  // 역대 분포 집계용
  const oddEvenDist = { '0:6': 0, '1:5': 0, '2:4': 0, '3:3': 0, '4:2': 0, '5:1': 0, '6:0': 0 };
  const highLowDist = { '0:6': 0, '1:5': 0, '2:4': 0, '3:3': 0, '4:2': 0, '5:1': 0, '6:0': 0 };
  const sumDist = { 'under100': 0, '100to130': 0, '131to160': 0, '161to180': 0, 'over180': 0 };
  const acDist = {};

  const recent10DrawNos = draws.slice(-10).map(d => d.drwNo);
  const recent5DrawNos = draws.slice(-5).map(d => d.drwNo);

  draws.forEach((draw) => {
    const nums = draw.numbers;
    const bonus = draw.bonus;

    // 번호별 출현 집계
    nums.forEach(num => {
      if (numberStats[num]) {
        numberStats[num].totalCount++;
        numberStats[num].lastDrawNo = Math.max(numberStats[num].lastDrawNo, draw.drwNo);

        if (recent10DrawNos.includes(draw.drwNo)) {
          numberStats[num].recent10Count++;
        }
        if (recent5DrawNos.includes(draw.drwNo)) {
          numberStats[num].recent5Count++;
        }
      }
    });

    if (numberStats[bonus]) {
      numberStats[bonus].bonusCount++;
    }

    // 홀짝 비율
    const oddCount = nums.filter(n => n % 2 !== 0).length;
    const evenCount = 6 - oddCount;
    const oeKey = `${oddCount}:${evenCount}`;
    if (oddEvenDist[oeKey] !== undefined) oddEvenDist[oeKey]++;

    // 고저 비율 (1~22 저, 23~45 고)
    const lowCount = nums.filter(n => n <= 22).length;
    const highCount = 6 - lowCount;
    const hlKey = `${highCount}:${lowCount}`;
    if (highLowDist[hlKey] !== undefined) highLowDist[hlKey]++;

    // 총합 구간
    const sum = nums.reduce((acc, cur) => acc + cur, 0);
    if (sum < 100) sumDist.under100++;
    else if (sum <= 130) sumDist['100to130']++;
    else if (sum <= 160) sumDist['131to160']++;
    else if (sum <= 180) sumDist['161to180']++;
    else sumDist.over180++;

    // AC값
    const ac = calculateAC(nums);
    acDist[ac] = (acDist[ac] || 0) + 1;
  });

  // 미출현 기간 및 출현율 계산
  const latestNo = latestDraw.drwNo;
  for (let i = 1; i <= 45; i++) {
    const item = numberStats[i];
    item.omissionCount = latestNo - item.lastDrawNo;
    item.frequencyRate = ((item.totalCount / totalDraws) * 100).toFixed(1);
  }

  // 랭킹별 정렬
  const rankedByTotal = Object.values(numberStats).sort((a, b) => b.totalCount - a.totalCount);
  const hotNumbers = Object.values(numberStats).sort((a, b) => b.recent10Count - a.recent10Count || b.recent5Count - a.recent5Count).slice(0, 12);
  const coldNumbers = Object.values(numberStats).sort((a, b) => b.omissionCount - a.omissionCount).slice(0, 12);

  return {
    totalDraws,
    latestDraw,
    numberStats,
    rankedByTotal,
    hotNumbers,
    coldNumbers,
    oddEvenDist,
    highLowDist,
    sumDist,
    acDist
  };
}
