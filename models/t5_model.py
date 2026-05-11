from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import re
from pathlib import Path

class T5Summarizer:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(T5Summarizer, cls).__new__(cls)
            cls._instance.model = None
            cls._instance.tokenizer = None
            cls._instance.device = "cuda" if torch.cuda.is_available() else "cpu"
        return cls._instance

    def load_model(self, model_dir: str):
        """
        Loads the T5 model and tokenizer.
        """
        print(f"Loading T5 model from {model_dir}...")
        self.tokenizer = AutoTokenizer.from_pretrained(model_dir)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_dir)
        self.model.to(self.device)
        self.model.eval()
        print(f"T5 model loaded successfully on {self.device}.")

    def clean_text(self, text: str) -> str:
        text = text.lower()
        text = re.sub(r"[^a-zA-Z0-9\s\.,!?]", "", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def summarize(self, text: str, max_length: int = 150, min_length: int = 30) -> str:
        if self.model is None:
            # Fallback path discovery
            current_dir = Path(__file__).resolve().parent
            potential_path = current_dir / "t5_weights"
            if potential_path.exists():
                self.load_model(str(potential_path))
            else:
                return "Error: T5 model not initialized. weights not found."

        cleaned_text = "summarize: " + self.clean_text(text)
        inputs = self.tokenizer(
            cleaned_text,
            return_tensors="pt",
            max_length=1024,
            truncation=True
        ).to(self.device)

        with torch.no_grad():
            summary_ids = self.model.generate(
                **inputs,
                num_beams=4,
                max_length=max_length,
                min_length=min_length,
                early_stopping=True
            )

        summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary

t5_manager = T5Summarizer()
