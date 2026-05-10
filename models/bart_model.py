import torch
from transformers import BartForConditionalGeneration, BartTokenizer
from peft import PeftModel
import os

class BartSummarizer:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(BartSummarizer, cls).__new__(cls)
            cls._instance.model = None
            cls._instance.tokenizer = None
            cls._instance.device = "cuda" if torch.cuda.is_available() else "cpu"
            print(f"BART Summarizer initialized on device: {cls._instance.device}")
        return cls._instance

    def load_model(self, model_dir):
        """
        Loads the BART base model and its LoRA adapters.
        """
        if self.model is None:
            print(f"Loading BART model and adapters from {model_dir}...")
            base_model_name = "facebook/bart-base"
            
            try:
                if model_dir is None:
                    raise ValueError("model_dir cannot be None")
                
                # Load tokenizer
                print(f"Loading tokenizer from {model_dir}")
                self.tokenizer = BartTokenizer.from_pretrained(model_dir)
                
                # Load base model
                print(f"Loading base model: {base_model_name}")
                base_model = BartForConditionalGeneration.from_pretrained(base_model_name)
                
                # Load adapters (LoRA)
                print(f"Attaching LoRA adapters from: {model_dir}")
                self.model = PeftModel.from_pretrained(base_model, model_dir)
                
                self.model.to(self.device)
                self.model.eval()
                print("BART model loaded successfully.")
            except Exception as e:
                print(f"Error loading BART model: {e}")
                raise e

    def summarize(self, text, max_length=128, min_length=30):
        """
        Generates an abstractive summary of the input text.
        """
        if self.model is None:
            # Attempt to load from multiple potential paths
            current_dir = os.path.dirname(__file__) or "."
            potential_paths = [
                os.path.join(current_dir, "bart_weights"),
                os.path.join(os.getcwd(), "models", "bart_weights"),
                os.path.join(os.getcwd(), "bart_weights")
            ]
            
            loaded = False
            for path in potential_paths:
                if os.path.exists(path):
                    print(f"Discovered weights at: {path}")
                    self.load_model(path)
                    loaded = True
                    break
            
            if not loaded:
                raise Exception(f"BART model not loaded. Tried searching in: {potential_paths}")
        
        inputs = self.tokenizer(text, return_tensors="pt", max_length=1024, truncation=True).to(self.device)
        
        with torch.no_grad():
            summary_ids = self.model.generate(
                inputs["input_ids"],
                max_length=max_length,
                min_length=min_length,
                length_penalty=2.0,
                num_beams=4,
                early_stopping=True
            )
            
        return self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)

# Singleton instance export
bart_manager = BartSummarizer()
