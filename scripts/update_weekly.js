/**
 * 매주 토요일 GitHub Actions에서 실행되는 주간 자동 갱신 스크립트 (Node.js)
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
      await new Promise(r => setTimeout(r, 500));
    }
  }
  return null;
}

async function main() {
  if (!fs.existsSync(OUTPUT_PATH)) {
    console.error('lotto_history.json 파일이 존재하지 않습니다.');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
  const currentLatest = raw.latestDrawNo || 0;
  const targetDrw = currentLatest + 1;

  console.log(`현재 저장된 최신 회차: ${currentLatest}회. 신규 ${targetDrw}회 조회 중...`);
  const newDraw = await fetchDraw(targetDrw);

  if (newDraw) {
    raw.draws.push(newDraw);
    raw.latestDrawNo = newDraw.drwNo;
    raw.totalCount = raw.draws.length;
    raw.lastUpdated = new Date().toISOString().replace('T', ' ').slice(0, 19);

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(raw, null, 2), 'utf-8');
    console.log(`🎉 성공: 제 ${newDraw.drwNo}회 당첨 정보가 자동으로 추가되었습니다!`);

    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `updated=true\nnew_draw=${newDraw.drwNo}\n`);
    }
  } else {
    console.log(`아직 제 ${targetDrw}회차 당첨 정보가 등록되지 않았습니다.`);
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `updated=false\n`);
    }
  }
}

main().catch(console.error);
