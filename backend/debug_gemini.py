import google.generativeai as genai
from decouple import config
import traceback

def test_gemini():
    api_key = config('GEMINI_API_KEY')
    print(f"Key: {api_key}")
    genai.configure(api_key=api_key)
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        res = model.generate_content("Hi")
        print(f"Response: {res.text}")
    except Exception as e:
        print("--- ERROR ---")
        print(f"Type: {type(e)}")
        print(f"Message: {e}")
        # traceback.print_exc()

if __name__ == "__main__":
    test_gemini()
