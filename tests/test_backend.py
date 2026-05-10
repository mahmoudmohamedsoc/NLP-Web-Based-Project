import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    response = requests.get(f"{BASE_URL}/")
    print(f"Health Check: {response.json()}")
    assert response.status_code == 200

def test_summarize_tfidf():
    payload = {
        "text": "The solar system consists of the Sun and the objects that orbit it. It formed 4.6 billion years ago from the gravitational collapse of a giant interstellar molecular cloud. The vast majority of the system's mass is in the Sun.",
        "num_sentences": 1,
        "model_type": "tfidf"
    }
    response = requests.post(f"{BASE_URL}/summarize", json=payload)
    data = response.json()
    print(f"TF-IDF Summary: {data['tfidf_summary']}")
    assert response.status_code == 200
    assert data["tfidf_summary"] is not None

def test_summarize_transformer():
    payload = {
        "text": "The solar system consists of the Sun and the objects that orbit it. It formed 4.6 billion years ago from the gravitational collapse of a giant interstellar molecular cloud. The vast majority of the system's mass is in the Sun.",
        "num_sentences": 1,
        "model_type": "transformer"
    }
    response = requests.post(f"{BASE_URL}/summarize", json=payload)
    data = response.json()
    print(f"Transformer Summary: {data['transformer_summary']}")
    assert response.status_code == 200
    assert data["transformer_summary"] is not None

if __name__ == "__main__":
    print("Waiting for server to be ready...")
    for i in range(10):
        try:
            test_health()
            break
        except:
            time.sleep(10)
    
    print("\nRunning Tests...")
    try:
        test_summarize_tfidf()
        test_summarize_transformer()
        print("\nAll backend tests passed!")
    except Exception as e:
        print(f"\nTests failed: {e}")
