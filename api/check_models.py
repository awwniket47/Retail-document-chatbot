# api/check_models.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get("GOOGLE_API_KEY")

if not api_key:
    print("❌ GOOGLE_API_KEY not found in .env file")
else:
    print(f"✅ Found API Key: {api_key[:5]}...")
    genai.configure(api_key=api_key)
    
    print("\n🔍 Checking available Embedding models...")
    try:
        count = 0
        for m in genai.list_models():
            if 'embed' in m.name.lower():
                print(f"   - {m.name}")
                count += 1
        
        if count == 0:
            print("⚠️ No embedding models found. Ensure your API Key has 'Generative Language API' enabled in Google Cloud Console.")
        else:
            print(f"\n✅ Found {count} embedding models. Use one of these in index.py!")
            
    except Exception as e:
        print(f"❌ Error listing models: {e}")