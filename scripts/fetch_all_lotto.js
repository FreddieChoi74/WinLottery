/**
 * 동행복권 전회차(1회 ~ 1240회) 고속 수집기 (Node.js 비동기)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'lotto_history.json');
const BASE_URL = 'https://www.dhlottery.co.kr/lt645/selectPstLt645Info.do?srchLtEpsd=';

function parseDate(str) {
  const s = String(str);
  if (s.length === 8) {
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  }
  return s;
}

async function fetchDraw(drwNo) {
  for (let retry = 0; retry < 3; retry++) {
    try {
      const res = await fetch(`${BASE_URL}${drwNo}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': 'https://www.dhlottery.co.kr/'
        },
        signal: AbortSignal.timeout(6000)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list = json?.data?.list;
      if (list && list.length > 0) {
        const item = list[0];
        return {
          drwNo: item.ltEpsd,
          date: parseDate(item.ltRflYmd),
          numbers: [
            item.tm1WnNo,
            item.tm2WnNo,
            item.tm3WnNo,
            item.tm4WnNo,
            item.tm5WnNo,
            item.tm6WnNo
          ],
          bonus: item.bnsWnNo,
          firstWinamnt: item.rnk1WnAmt || 0,
          firstPrzwnerCo: item.rnk1WnNope || 0,
          totSellamnt: item.wholEpsdSumNtslAmt || 0
        };
      }
      return null;
    } catch (e) {
      await new Promise(r => setTimeout(r, 400));
    }
  }
  return null;
}

async function main() {
  console.log('최신 회차 확인 중...');
  let latestDrw = 1240;
  // 1241 확인
  const nextCheck = await fetchDraw(1241);
  if (nextCheck) latestDrw = 1241;
  console.log(`확인된 최신 회차: ${latestDrw}회`);

  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const existingMap = new Map();
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      const prev = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
      for (const d of prev.draws || []) {
        existingMap.set(d.drwNo, d);
      }
      console.log(`기존 파일에서 ${existingMap.size}건 로드됨.`);
    } catch (e) {}
  }

  const targets = [];
  for (let i = 1; i <= latestDrw; i++) {
    if (!existingMap.has(i)) targets.push(i);
  }

  console.log(`신규 수집 대상: ${targets.length}건`);

  // 동시 10개씩 배치 처리
  const BATCH_SIZE = 10;
  let finished = 0;

  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const chunk = targets.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(chunk.map(no => fetchDraw(no)));
    for (const item of results) {
      if (item) existingMap.set(item.drwNo, item);
    }
    finished += chunk.length;
    if (finished % 100 === 0 || finished === targets.length) {
      console.log(`진행률: ${finished}/${targets.length} (${((finished / targets.length) * 100).toFixed(1)}%)`);
    }
    await new Promise(r => setTimeout(r, 100)); // 서버 배려
  }

  const sortedDraws = Array.from(existingMap.values()).sort((a, b) => a.drwNo - b.drwNo);
  const payload = {
    lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 19),
    latestDrawNo: latestDrw,
    totalCount: sortedDraws.length,
    draws: sortedDraws
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`✅ 완료! 총 ${sortedDraws.length}건 저장 완료: ${OUTPUT_PATH}`);
}

main().catch(console.error);
