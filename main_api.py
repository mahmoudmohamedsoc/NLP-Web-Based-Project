from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models import tfidf_model
import time

app = FastAPI()

# ================= CORS (مهم جداً للربط مع React) =================
# هذا الجزء يسمح لـ React (الذي يعمل على port 5173 غالباً) بالاتصال بالـ API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # يمكنك استبدال "*" بـ ["http://localhost:5173"] للأمان
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# تعريف شكل البيانات المستلمة من React
class SummarizeRequest(BaseModel):
    text: str
    num_sentences: int = 3

# ================= Endpoints =================

@app.get("/")
def read_root():
    return {"status": "FastAPI is running"}

@app.post("/summarize")
async def summarize_text(request: SummarizeRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    try:
        start_time = time.time()
        
        # تشغيل الموديل الخاص بك
        summary = tfidf_model.summarize(request.text, num_sentences=request.num_sentences)
        
        generation_time = round(time.time() - start_time, 4)
        
        # يمكنك إضافة Transformer Placeholder هنا أيضاً
        transformer_placeholder = "Abstractive summary will be generated here once the model is connected."

        return {
            "tfidf_summary": summary,
            "transformer_summary": transformer_placeholder,
            "metrics": {
                "gen_time": f"{generation_time} sec",
                "original_len": len(request.text),
                "summary_len": len(summary)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)