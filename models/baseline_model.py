import pickle
import re
from pathlib import Path
from typing import Optional, Tuple
import nltk
import numpy as np
from gensim.models import Word2Vec
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize
from scipy.sparse import csr_matrix, hstack
import os

class BaselineSummarizer:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(BaselineSummarizer, cls).__new__(cls)
            cls._instance.nb_model = None
            cls._instance.tfidf_vectorizer = None
            cls._instance.w2v_model = None
        return cls._instance

    def load_model(self, model_dir: str):
        """
        Loads the NB, TF-IDF, and Word2Vec models from the specified directory.
        """
        model_dir = Path(model_dir)
        model_path = model_dir / "summarization_model.pkl"
        vectorizer_path = model_dir / "tfidf_vectorizer.pkl"
        w2v_path = model_dir / "word2vec.model"

        # Ensure NLTK resources are available
        self._download_nltk_resources()
        
        self.nb_model = self._load_pickle(model_path)
        self.tfidf_vectorizer = self._load_pickle(vectorizer_path)
        self.w2v_model = self._load_word2vec(w2v_path)
        
        self.stop_words = set(stopwords.words("english"))
        print("✓ Loaded Baseline (NB + TF-IDF + Word2Vec) models.")

    def _download_nltk_resources(self):
        resources = {
            "punkt": "tokenizers/punkt",
            "stopwords": "corpora/stopwords",
        }
        for name, lookup_path in resources.items():
            try:
                nltk.data.find(lookup_path)
            except LookupError:
                nltk.download(name, quiet=True)

    def _load_pickle(self, path: Path):
        with path.open("rb") as handle:
            return pickle.load(handle)

    def _load_word2vec(self, path: Path) -> Optional[Word2Vec]:
        if not path.exists():
            return None
        try:
            return Word2Vec.load(str(path))
        except:
            return None

    def clean_text(self, text: str) -> str:
        text = text.lower()
        text = re.sub(r"[^a-zA-Z\s]", "", text)
        tokens = word_tokenize(text)
        tokens = [token for token in tokens if token not in self.stop_words]
        return " ".join(tokens)

    def sentence_embedding(self, sentence: str) -> np.ndarray:
        if self.w2v_model is None:
            return np.array([])
        words = word_tokenize(sentence)
        vectors = [self.w2v_model.wv[word] for word in words if word in self.w2v_model.wv]
        if not vectors:
            return np.zeros(self.w2v_model.vector_size)
        return np.mean(vectors, axis=0)

    def build_features(self, cleaned_sentences: list[str]):
        tfidf_features = self.tfidf_vectorizer.transform(cleaned_sentences)
        
        if self.w2v_model is None:
            expected_feature_count = getattr(self.nb_model, "n_features_in_", None)
            if expected_feature_count is None:
                return tfidf_features
            extra_dims = expected_feature_count - tfidf_features.shape[1]
            if extra_dims <= 0:
                return tfidf_features
            padding = csr_matrix((tfidf_features.shape[0], extra_dims))
            return hstack([tfidf_features, padding])

        embeddings = np.array([self.sentence_embedding(s) for s in cleaned_sentences])
        embeddings_sparse = csr_matrix(embeddings)
        return hstack([tfidf_features, embeddings_sparse])

    def summarize(self, text: str, num_sentences: int = 3) -> str:
        if self.nb_model is None:
            # Fallback path discovery if not loaded
            current_dir = Path(__file__).resolve().parent
            potential_path = current_dir / "baseline_weights"
            if potential_path.exists():
                self.load_model(str(potential_path))
            else:
                return "Error: Baseline model not initialized."

        sentences = sent_tokenize(text)
        if not sentences:
            return ""

        cleaned_sentences = [self.clean_text(s) for s in sentences]
        filtered = [(orig, clean) for orig, clean in zip(sentences, cleaned_sentences) if clean.strip()]
        
        if not filtered:
            return ""

        orig_sentences, cleaned_for_model = zip(*filtered)
        features = self.build_features(list(cleaned_for_model))
        predictions = self.nb_model.predict(features)

        important_sentences = [s for s, p in zip(orig_sentences, predictions) if p == 1]
        
        if not important_sentences:
            important_sentences = list(orig_sentences)

        return " ".join(important_sentences[:num_sentences])

baseline_manager = BaselineSummarizer()
