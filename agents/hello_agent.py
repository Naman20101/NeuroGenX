%%writefile agents/hello_agent.py
from transformers import pipeline

class HelloAgent:
    def __init__(self):
        print("🚀 Initializing NeuroGenX with GPT-Neo 1.3B (Smart & Safe Mode)...")
        self.generator = pipeline(
            "text-generation",
            model="EleutherAI/gpt-neo-1.3B"
        )

    def safe_output(self, text):
        # Basic bad word filter — can be expanded later
        banned = ["fuck", "shit", "kill", "die", "violent", "murder"]
        for word in banned:
            text = text.replace(word, "[censored]")
        return text

    def run(self, user_prompt: str):
        # Inject a friendly personality into the prompt
        safe_prompt = (
            "You are NeuroGenX, a kind, inspiring, futuristic AI superhero. "
            "You always speak positively, encourage people, and never use bad or unsafe language. "
            f"{user_prompt}"
        )

        print(f"🤖 NeuroGenX received: {user_prompt}")
        output = self.generator(
            safe_prompt,
            max_length=100,
            num_return_sequences=1,
            temperature=0.8,
            top_p=0.92,
            do_sample=True
        )
        return self.safe_output(output[0]['generated_text'])

if __name__ == "__main__":
    agent = HelloAgent()
    response = agent.run(
        "Hello NeuroGenX, describe yourself like a superhero AI from the future."
    )
    print("\n--- Agent Response ---")
    print(response)


