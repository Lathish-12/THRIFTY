import requests
import json
from decouple import config

def test_ai():
    gemini_key = config('GEMINI_API_KEY', default=None)
    claude_key = config('ANTHROPIC_API_KEY', default=None)
    
    if gemini_key:
        print(f"Testing Gemini with key starting with: {gemini_key[:10]}...")
        import google.generativeai as genai
        try:
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            res = model.generate_content("Say 'Gemini is working!'")
            print(f"SUCCESS: Gemini working! Response: {res.text}")
        except Exception as e:
            print(f"FAILED: Gemini error: {e}")

    if claude_key:
        print(f"\nTesting Claude/OpenRouter with key starting with: {claude_key[:10]}...")
        if claude_key.startswith('sk-or-'):
            url = "https://openrouter.ai/api/v1/chat/completions"
            headers = {"Authorization": f"Bearer {claude_key}", "Content-Type": "application/json"}
            data = {"model": "anthropic/claude-3.5-sonnet", "messages": [{"role": "user", "content": "hi"}]}
            try:
                response = requests.post(url, headers=headers, data=json.dumps(data))
                if response.status_code == 200:
                    print("SUCCESS: OpenRouter working!")
                else:
                    print(f"FAILED: OpenRouter error {response.status_code}")
            except Exception as e:
                print(f"FAILED: OpenRouter request error: {e}")
        else:
            import anthropic
            try:
                client = anthropic.Anthropic(api_key=claude_key)
                res = client.messages.create(model="claude-3-5-sonnet-20241022", max_tokens=10, messages=[{"role": "user", "content": "hi"}])
                print("SUCCESS: Anthropic working!")
            except Exception as e:
                print(f"FAILED: Anthropic error: {e}")

if __name__ == "__main__":
    test_ai()
