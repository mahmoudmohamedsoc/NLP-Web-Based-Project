from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import time
import os

# Import models
from models import tfidf_model
from models.bart_model import bart_manager

app = FastAPI(title="NLP Summarizer API")

# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= Schemas =================
class SummarizeRequest(BaseModel):
    text: str
    num_sentences: int = 3
    model_type: str = "both"  # "tfidf", "transformer", "both"

class Metrics(BaseModel):
    gen_time: str
    original_len: int
    summary_len: int
    compression_ratio: str

class SummarizeResponse(BaseModel):
    tfidf_summary: Optional[str] = None
    transformer_summary: Optional[str] = None
    metrics: dict

# ================= Startup =================
@app.on_event("startup")
async def startup_event():
    # Load BART weights on startup
    weights_path = os.path.join(os.path.dirname(__file__), "models", "bart_weights")
    if os.path.exists(weights_path):
        try:
            bart_manager.load_model(weights_path)
        except Exception as e:
            print(f"Warning: Could not load BART model on startup: {e}")
    else:
        print("Warning: BART weights not found. Transformer mode will fail unless loaded later.")

# ================= Endpoints =================

@app.get("/")
def read_root():
    return {"status": "NLP Summarizer API is running", "models_loaded": ["tfidf", "transformer" if bart_manager.model else "none"]}

@app.post("/summarize", response_model=SummarizeResponse)
async def summarize_text(request: SummarizeRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    try:
        start_time = time.time()
        tfidf_summary = None
        transformer_summary = None
        
        # 1. TF-IDF Summarization
        if request.model_type in ["tfidf", "both"]:
            tfidf_summary = tfidf_model.summarize(request.text, num_sentences=request.num_sentences)
        
        # 2. Transformer Summarization
        if request.model_type in ["transformer", "both"]:
            try:
                # Map sentences to tokens roughly (1 sentence ~ 20-30 tokens)
                max_tokens = request.num_sentences * 30
                transformer_summary = bart_manager.summarize(request.text, max_length=max_tokens)
            except Exception as e:
                transformer_summary = f"Error in Transformer: {str(e)}"
        
        generation_time = round(time.time() - start_time, 4)
        
        # Calculate Metrics
        final_summary = transformer_summary or tfidf_summary or ""
        summary_len = len(final_summary)
        orig_len = len(request.text)
        compression = f"{round((1 - (summary_len / orig_len)) * 100, 2)}%" if orig_len > 0 else "0%"

        return {
            "tfidf_summary": tfidf_summary,
            "transformer_summary": transformer_summary,
            "metrics": {
                "gen_time": f"{generation_time} sec",
                "original_len": orig_len,
                "summary_len": summary_len,
                "compression_ratio": compression
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)