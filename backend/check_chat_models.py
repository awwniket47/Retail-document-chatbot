# api/check_chat_models.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get("GOOGLE_API_KEY")

if not api_key:
    print("❌ GOOGLE_API_KEY not found in .env file")
else:
    genai.configure(api_key=api_key)
    
    print("\n🔍 Checking available CHAT models...")
    try:
        count = 0
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"   - {m.name}")
                count += 1
        
        if count == 0:
            print("⚠️ No chat models found. Check your API key permissions.")
        else:
            print(f"\n✅ Found {count} chat models. Use one of these in index.py!")
            
    except Exception as e:
        print(f"❌ Error listing models: {e}")