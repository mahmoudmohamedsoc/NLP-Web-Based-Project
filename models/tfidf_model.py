import re
import nltk
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
import os
import sys
# 1. الحصول على مسار الـ Virtual Environment المفتوح حالياً (مثلاً cv_env)
venv_path = sys.prefix

# 2. تحديد مسار التحميل ليكون داخل فولدر lib الخاص بالبيئة الوهمية
nltk_data_path = os.path.join(venv_path, 'lib', 'nltk_data')

# 3. إنشاء المجلد لو لم يكن موجوداً
os.makedirs(nltk_data_path, exist_ok=True)

# 4. إضافة المسار لـ NLTK
nltk.data.path.append(nltk_data_path)

# 5. تحميل الملفات مباشرة داخل الـ Virtual Environment
nltk.download('punkt', download_dir=nltk_data_path)
nltk.download('punkt_tab', download_dir=nltk_data_path)
nltk.download('stopwords', download_dir=nltk_data_path)

def preprocess(text):
    text = text.lower()
    text = re.sub(r'<.*?>', ' ', text)
    text = re.sub(r'[()\[\]{}]', ' ', text)
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def summarize(text, num_sentences=1):
    from nltk.tokenize import sent_tokenize

    sentences = sent_tokenize(text)

    if len(sentences) <= num_sentences:
        return text

    cleaned = [preprocess(s) for s in sentences]

    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf = vectorizer.fit_transform(cleaned)

    scores = np.sum(tfidf.toarray(), axis=1)

    ranked = np.argsort(scores)[-num_sentences:]
    ranked = sorted(ranked)

    return " ".join([sentences[i] for i in ranked])