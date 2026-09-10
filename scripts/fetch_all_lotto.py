"""
동행복권 신규 API(selectPstLt645Info.do)를 활용한 역대 전회차(1회~최신회차) 수집 스크립트
"""
import os
import json
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = "https://www.dhlottery.co.kr/lt645/selectPstLt645Info.do?srchLtEpsd={}"
OUTPUT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "src", "data", "lotto_history.json")

def parse_date(date_str):
    # '20241214' -> '2024-12-14'
    if len(date_str) == 8:
        return f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:]}"
    return date_str

def fetch_draw(drw_no):
    url = BASE_URL.format(drw_no)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": "https://www.dhlottery.co.kr/"
    }
    req = urllib.request.Request(url, headers=headers)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                items = data.get("data", {}).get("list", [])
                if items and len(items) > 0:
                    row = items[0]
                    return {
                        "drwNo": row["ltEpsd"],
                        "date": parse_date(str(row["ltRflYmd"])),
                        "numbers": [
                            row["tm1WnNo"],
                            row["tm2WnNo"],
                            row["tm3WnNo"],
                            row["tm4WnNo"],
                            row["tm5WnNo"],
                            row["tm6WnNo"]
                        ],
                        "bonus": row["bnsWnNo"],
                        "firstWinamnt": row.get("rnk1WnAmt", 0),
                        "firstPrzwnerCo": row.get("rnk1WnNope", 0),
                        "totSellamnt": row.get("wholEpsdSumNtslAmt", 0)
                    }
                return None
        except Exception:
            time.sleep(0.3)
    return None

def main():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    
    # 1. 최신 회차 찾기
    print("최신 회차 확인 중...")
    curr = 1240
    while True:
        res = fetch_draw(curr + 1)
        if res:
            curr += 1
        else:
            break
    
    latest_drw = curr
    print(f"확인된 최신 회차: {latest_drw}회")

    existing_data = {}
    if os.path.exists(OUTPUT_PATH):
        try:
            with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
                saved = json.load(f)
                for item in saved.get("draws", []):
                    existing_data[item["drwNo"]] = item
            print(f"기존 저장된 데이터: {len(existing_data)}건")
        except Exception:
            pass

    targets = [i for i in range(1, latest_drw + 1) if i not in existing_data]
    print(f"신규 수집 대상 회차: {len(targets)}건")

    if targets:
        count = 0
        with ThreadPoolExecutor(max_workers=15) as executor:
            future_to_drw = {executor.submit(fetch_draw, drw): drw for drw in targets}
            for future in as_completed(future_to_drw):
                res = future.result()
                if res:
                    existing_data[res["drwNo"]] = res
                count += 1
                if count % 100 == 0 or count == len(targets):
                    print(f"수집 진행: {count}/{len(targets)} ({count/len(targets)*100:.1f}%)")

    all_draws = [existing_data[k] for k in sorted(existing_data.keys())]

    output_payload = {
        "lastUpdated": time.strftime("%Y-%m-%d %H:%M:%S"),
        "latestDrawNo": latest_drw,
        "totalCount": len(all_draws),
        "draws": all_draws
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output_payload, f, ensure_ascii=False, indent=2)

    print(f"완료: 1회부터 {latest_drw}회까지 총 {len(all_draws)}건이 {OUTPUT_PATH}에 성공적으로 저장되었습니다.")

if __name__ == "__main__":
    main()
