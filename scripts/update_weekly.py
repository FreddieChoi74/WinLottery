"""
매주 토요일 추첨 후 자동 갱신 스크립트 (GitHub Actions용)
신규 API(selectPstLt645Info.do)를 통해 최신 회차 다음 회차를 조회하여 추가합니다.
"""
import os
import json
import time
import urllib.request
import sys

BASE_URL = "https://www.dhlottery.co.kr/lt645/selectPstLt645Info.do?srchLtEpsd={}"
OUTPUT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "src", "data", "lotto_history.json")

def parse_date(date_str):
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
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
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
    except Exception as e:
        print(f"Error fetching draw {drw_no}: {e}")
    return None

def main():
    if not os.path.exists(OUTPUT_PATH):
        print("기존 데이터 파일이 없습니다.")
        sys.exit(1)

    with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    latest_no = data.get("latestDrawNo", 0)
    existing_draws = {d["drwNo"]: d for d in data.get("draws", [])}
    target_no = latest_no + 1

    print(f"현재 최신 회차: {latest_no}회. 신규 회차 {target_no}회 확인 중...")
    
    new_draw = fetch_draw(target_no)
    if new_draw:
        existing_draws[new_draw["drwNo"]] = new_draw
        sorted_draws = [existing_draws[k] for k in sorted(existing_draws.keys())]
        data["latestDrawNo"] = new_draw["drwNo"]
        data["totalCount"] = len(sorted_draws)
        data["lastUpdated"] = time.strftime("%Y-%m-%d %H:%M:%S")
        data["draws"] = sorted_draws

        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"성공: {new_draw['drwNo']}회차가 추가되었습니다!")
        if "GITHUB_OUTPUT" in os.environ:
            with open(os.environ["GITHUB_OUTPUT"], "a") as env_f:
                env_f.write(f"updated=true\nnew_draw={new_draw['drwNo']}\n")
    else:
        print(f"아직 {target_no}회차 당첨 정보가 동행복권에 등록되지 않았거나 추첨 전입니다.")
        if "GITHUB_OUTPUT" in os.environ:
            with open(os.environ["GITHUB_OUTPUT"], "a") as env_f:
                env_f.write("updated=false\n")

if __name__ == "__main__":
    main()
