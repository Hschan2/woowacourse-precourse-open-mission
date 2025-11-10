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
@app.post("/api/recommend-food")
async def recommend_food(request: RecommendationRequest):
    # 프론트엔드에서 받은 프롬프트를 터미널에 출력합니다.
    print("전달받은 프롬프트:", request.prompt)

    # TODO: 여기에 실제 AI API를 호출하는 로직이 들어갑니다.
    # 지금은 테스트를 위해 미리 정해진 답변을 반환합니다.
    ai_response = "오늘은 날씨와 기분에 딱 맞는 파전에 막걸리가 좋겠네요!"

    return {"recommendation": ai_response}

# 이 파일을 직접 실행했을 때 Uvicorn 서버가 실행되도록 합니다.
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
