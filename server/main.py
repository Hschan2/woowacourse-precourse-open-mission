from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# .env 파일에서 환경 변수 로드 (AI API 키 등을 위해)
load_dotenv()

app = FastAPI()

# CORS 설정: Vue 개발 서버(보통 5173 포트)에서의 요청을 허용합니다.
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

# 프론트엔드에서 보낼 요청 데이터의 형식을 정의합니다.
class RecommendationRequest(BaseModel):
    prompt: str

# 서버 루트 주소로 접속했을 때 간단한 메시지를 보여줍니다.
@app.get("/")
def read_root():
    return {"message": "음식 추천 AI 서버"}

# AI 음식 추천 요청을 처리하는 API 엔드포인트입니다.
import json
import httpx

# ... (기존 코드 생략) ...

# AI 음식 추천 요청을 처리하는 API 엔드포인트입니다.
@app.post("/api/recommend-food")
async def recommend_food(request: RecommendationRequest):
    # 프론트엔드에서 받은 프롬프트를 터미널에 출력합니다.
    print("전달받은 프롬프트:", request.prompt)

    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return {"error": "API 키가 설정되지 않았습니다."}

    # AI에게 JSON 형식으로 답변을 요청하는 시스템 프롬프트
    system_prompt = """
    당신은 사용자의 기분과 날씨에 맞춰 음식을 추천하는 AI입니다.
    사용자의 요청에 대해 다음 JSON 형식에 맞춰 반드시 한국어로 답변해야 합니다.
    
    {
      "foodName": "음식 이름",
      "reason": "이 음식을 추천하는 이유 (1-2문장)",
      "averagePrice": "평균 가격 (숫자만, 예: 15000)",
      "calories": "평균 칼로리 (숫자만, 예: 500)"
    }
    
    JSON 형식 외의 다른 설명은 절대 추가하지 마세요.
    """

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                },
                json={
                    "model": "mistralai/mistral-7b-instruct:free",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": request.prompt},
                    ],
                },
                timeout=30,
            )
            response.raise_for_status()
            
            data = response.json()
            ai_message_str = data['choices'][0]['message']['content']
            
            # AI가 반환한 문자열을 JSON으로 파싱
            ai_response_json = json.loads(ai_message_str)
            return ai_response_json

    except httpx.HTTPStatusError as e:
        print(f"HTTP 오류 발생: {e}")
        return {"error": f"AI 서비스에서 오류가 발생했습니다: {e.response.status_code}"}
    except json.JSONDecodeError:
        print(f"JSON 파싱 오류 발생. AI 응답: {ai_message_str}")
        return {"error": "AI가 유효하지 않은 형식의 응답을 보냈습니다."}
    except Exception as e:
        print(f"알 수 없는 오류 발생: {e}")
        return {"error": "AI 응답을 처리하는 중 알 수 없는 오류가 발생했습니다."}

# ... (기존 코드 생략) ...


# 이 파일을 직접 실행했을 때 Uvicorn 서버가 실행되도록 합니다.
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
