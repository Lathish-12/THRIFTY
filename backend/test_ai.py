import requests
import json
from decouple import config

def test_ollama_directly():
    """Test Ollama API directly from Python"""
    url = config('OLLAMA_BASE_URL', default='http://localhost:11434/api/generate')
    model = config('OLLAMA_MODEL', default='deepseek-r1:1.5b')
    
    payload = {
        "model": model,
        "prompt": "Say 'Ollama is alive' in 3 words.",
        "stream": False
    }
    
    print(f"Testing Ollama at {url} with model {model}...")
    try:
        response = requests.post(url, json=payload, timeout=60)
        if response.status_code == 200:
            print("Success!")
            print("Response:", response.json().get('response'))
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    test_ollama_directly()
