"""Quick test for both Claude AI and Ollama connectivity."""
import anthropic
from decouple import config

def test_claude():
    key = config('ANTHROPIC_API_KEY', default='')
    model = config('CLAUDE_MODEL', default='claude-3-5-haiku-20241022')

    print(f"\n{'='*50}")
    print("  CLAUDE AI TEST")
    print(f"{'='*50}")
    print(f"Model : {model}")
    print(f"Key   : {key[:25]}..." if key else "Key   : NOT SET")

    if not key or key == 'your-claude-api-key-here':
        print("RESULT: ❌ API key not configured")
        return False

    try:
        client = anthropic.Anthropic(api_key=key)
        msg = client.messages.create(
            model=model,
            max_tokens=40,
            messages=[{"role": "user", "content": "Reply with exactly: Claude AI is active and working!"}]
        )
        reply = msg.content[0].text
        print(f"Response: {reply}")
        print("RESULT: ✅ Claude AI is WORKING!")
        return True
    except anthropic.AuthenticationError:
        print("RESULT: ❌ Authentication failed — Invalid API key")
        return False
    except anthropic.RateLimitError:
        print("RESULT: ⚠️  Rate limit reached — key is valid but quota exceeded")
        return True  # key is valid
    except Exception as e:
        print(f"RESULT: ❌ Error — {e}")
        return False

def test_ollama():
    import requests
    url = config('OLLAMA_BASE_URL', default='http://localhost:11434/api/generate')
    model = config('OLLAMA_MODEL', default='deepseek-r1:1.5b')

    print(f"\n{'='*50}")
    print("  OLLAMA TEST")
    print(f"{'='*50}")
    print(f"URL   : {url}")
    print(f"Model : {model}")

    try:
        resp = requests.post(url, json={"model": model, "prompt": "Reply: Ollama active!", "stream": False}, timeout=30)
        if resp.status_code == 200:
            print(f"Response: {resp.json().get('response', '')[:60]}")
            print("RESULT: ✅ Ollama is WORKING!")
            return True
        else:
            print(f"RESULT: ❌ HTTP {resp.status_code}")
            return False
    except Exception as e:
        print(f"RESULT: ❌ {e}")
        return False

if __name__ == "__main__":
    claude_ok = test_claude()
    ollama_ok = test_ollama()

    print(f"\n{'='*50}")
    print("  FINAL STATUS")
    print(f"{'='*50}")
    print(f"  Claude AI : {'✅ ACTIVE' if claude_ok else '❌ NOT ACTIVE'}")
    print(f"  Ollama    : {'✅ ACTIVE' if ollama_ok else '❌ NOT ACTIVE'}")
    if claude_ok and ollama_ok:
        print("\n🎉 Both AI engines are active!")
        print("   Claude will be used as PRIMARY (best quality)")
        print("   Ollama is ready as SECONDARY fallback")
    elif ollama_ok:
        print("\n🦙 Ollama is active as primary AI engine.")
    elif claude_ok:
        print("\n🤖 Claude AI is active. Start Ollama for local fallback.")
    else:
        print("\n⚙️  Using Thrifty Local Engine (rule-based).")
    print(f"{'='*50}\n")
