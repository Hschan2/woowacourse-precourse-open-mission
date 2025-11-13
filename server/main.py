from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# server 폴더 내 .env 파일 찾기
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=dotenv_path)

app = FastAPI()

# CORS 설정
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecommendationRequest(BaseModel):
    prompt: str

# server 실행 시 출력되는 메시지
@app.get("/")
def read_root():
    return {"message": "음식 추천 AI 서버"}

import json
import httpx

async def call_ai(api_key: str, system_prompt: str, user_prompt: str) -> str:
    """AI API를 호출하고 응답 텍스트를 반환하는 헬퍼 함수"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": "google/gemma-3-27b-it:free",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                },
                timeout=45,
            )
            response.raise_for_status()
            data = response.json()
            if not data.get('choices'):
                return ""
            return data['choices'][0]['message']['content'].strip()
    except httpx.HTTPStatusError as e:
        print(f"AI 호출 중 HTTP 오류 발생: {e}")
        return ""
    except Exception as e:
        print(f"AI 호출 중 알 수 없는 오류 발생: {e}")
        return ""

def parse_key_value_response(text_response: str) -> dict:
    """'키: 값' 형식의 텍스트를 파싱하여 딕셔너리로 반환하는 헬퍼 함수"""
    data = {}
    lines = text_response.strip().split('\n')
    for line in lines:
        if ':' in line:
            key, value = line.split(':', 1)
            data[key.strip()] = value.strip()
    return data

@app.post("/api/recommend-food")
async def recommend_food(request: RecommendationRequest):
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return {"error": "API 키가 설정되지 않았습니다."}

    # AI에게 원하는 출력 형식을 JSON으로 명확하게 지시하는 시스템 프롬프트
    system_prompt = """
You are a helpful food recommendation assistant.
You MUST answer in Korean.
Based on the user's context (location, weather, mood), recommend a single food item.
Provide the reason for the recommendation, its typical price, and calorie count.
Also, suggest three restaurants near the user's location that serve the recommended food.
IMPORTANT: You MUST format the entire output as a single valid JSON object. Do not add any text before or after the JSON.

The JSON schema should be:
{
  "foodName": "음식 이름",
  "reason": "추천 이유",
  "averagePrice": 숫자,
  "calories": 숫자,
  "restaurants": [
    { "name": "맛집 이름 1", "address": "맛집 주소 1" },
    { "name": "맛집 이름 2", "address": "맛집 주소 2" },
    { "name": "맛집 이름 3", "address": "맛집 주소 3" }
  ]
}

Example for the numbers: for 12,000 won, use 12000. For 800 kcal, use 800.
The restaurant information can be fictional if real data is not available, but make it sound plausible.
"""

    try:
        ai_response_text = await call_ai(api_key, system_prompt, request.prompt)

        if not ai_response_text:
            return {"error": "AI로부터 응답을 받지 못했습니다."}

        try:
            # JSON 가져오기
            if ai_response_text.startswith("```json"):
                ai_response_text = ai_response_text[7:-3].strip()

            final_result = json.loads(ai_response_text)

            if not all(k in final_result for k in ["foodName", "reason", "restaurants"]):
                 raise ValueError("필수 키가 누락되었습니다.")

            return final_result

        except (json.JSONDecodeError, ValueError) as e:
            print(f"AI 응답 파싱 실패: {e}")
            print(f"잘못된 형식의 AI 응답: {ai_response_text}")
            return {"error": f"AI가 예상치 못한 형식으로 응답했습니다. 응답 내용: {ai_response_text}"}

    except Exception as e:
        print(f"추천 과정 중 오류 발생: {e}")
        return {"error": "AI 추천을 처리하는 중 서버에 오류가 발생했습니다."}

# uvicorn 서버 실행
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
