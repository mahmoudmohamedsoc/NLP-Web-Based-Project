from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import time
import os

# Import models
from models.baseline_model import baseline_manager
from models.bart_model import bart_manager
from models.t5_model import t5_manager

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
    summary_mode: str = "both"  # "tfidf", "transformer", "both"
    transformer_model: str = "bart" # "bart", "t5"

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
    from pathlib import Path
    base_dir = Path(__file__).resolve().parent
    models_dir = base_dir / "models"
    
    # 1. Load Baseline weights
    try:
        baseline_path = models_dir / "baseline_weights"
        if baseline_path.exists():
            baseline_manager.load_model(str(baseline_path))
    except Exception as e:
        print(f"Warning: Could not load Baseline model: {e}")

    # 2. Load BART weights
    try:
        bart_path = models_dir / "bart_weights"
        if bart_path.exists():
            bart_manager.load_model(str(bart_path))
    except Exception as e:
        print(f"Warning: Could not load BART model: {e}")

    # 3. Load T5 weights
    try:
        t5_path = models_dir / "t5_weights"
        if t5_path.exists():
            t5_manager.load_model(str(t5_path))
    except Exception as e:
        print(f"Warning: Could not load T5 model: {e}")

# ================= Endpoints =================

@app.get("/")
def read_root():
    return {
        "status": "NLP Summarizer API is running", 
        "models_loaded": {
            "baseline": baseline_manager.nb_model is not None,
            "bart": bart_manager.model is not None,
            "t5": t5_manager.model is not None
        }
    }

@app.post("/summarize", response_model=SummarizeResponse)
async def summarize_text(request: SummarizeRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    try:
        start_time = time.time()
        tfidf_summary = None
        transformer_summary = None
        
        # 1. Extractive (Baseline) Summarization
        if request.summary_mode in ["tfidf", "both"]:
            tfidf_summary = baseline_manager.summarize(request.text, num_sentences=request.num_sentences)
        
        # 2. Neural (Transformer) Summarization
        if request.summary_mode in ["transformer", "both"]:
            try:
                # Map sentences to tokens roughly (1 sentence ~ 30-40 tokens)
                max_tokens = 150 # Default from engineer's code
                
                if request.transformer_model == "t5":
                    transformer_summary = t5_manager.summarize(request.text, max_length=max_tokens)
                else: # Default to BART
                    transformer_summary = bart_manager.summarize(request.text, max_length=max_tokens)
            except Exception as e:
                transformer_summary = f"Error in Transformer ({request.transformer_model}): {str(e)}"
        
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