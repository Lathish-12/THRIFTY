import requests
import json
from decouple import config

class AIService:
    @staticmethod
    def get_ollama_response(prompt, system_prompt="You are Thrifty Advisor, a helpful financial assistant."):
        ollama_url = config('OLLAMA_BASE_URL', default='http://localhost:11434/api/generate')
        model = config('OLLAMA_MODEL', default='deepseek-r1:1.5b')
        
        payload = {
            "model": model,
            "prompt": f"{system_prompt}\n\nUser Question: {prompt}",
            "stream": False
        }
        
        try:
            response = requests.post(ollama_url, json=payload, timeout=30)
            if response.status_code == 200:
                result = response.json()
                return result.get('response', 'No response from Ollama.')
            else:
                return f"Error from Ollama: {response.status_code}"
        except Exception as e:
            return f"Ollama connection error: {str(e)}"

    @staticmethod
    def get_advisor_advice(user_message, financial_data):
        # Construct a detailed prompt with financial data
        data_str = json.dumps(financial_data, indent=2)
        prompt = f"""
        User Message: {user_message}
        
        User Financial Data:
        {data_str}
        
        Please provide personalized financial advice based on the above data. 
        Be concise, encouraging, and use currency in ₹ (INR).
        If the user is over budget or has low savings, give practical tips.
        """
        
        # Try Ollama first
        advisor_response = AIService.get_ollama_response(prompt)
        
        # If Ollama is not available (returns error message start with 'Ollama connection error')
        if "Ollama connection error" in advisor_response:
            return None # Signal to use rule-based fallback
            
        return advisor_response
