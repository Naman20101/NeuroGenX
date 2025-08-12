from transformers import pipeline

class HelloAgent:
    def __init__(self):
        print("🚀 Initializing HelloAgent with upgraded GPT-2...")
        self.generator = pipeline(
            "text-generation",
            model="gpt2-medium"  # Bigger & smarter free model
        )

    def run(self, prompt: str):
        print(f"🤖 NeuroGenX Agent received: {prompt}")
        output = self.generator(
            prompt,
            max_length=80,       # Limit length so it’s snappy
            num_return_sequences=1,
            temperature=0.9,     # Adds creativity
            top_p=0.95,          # Focus on most probable words
            do_sample=True       # Ensures randomness
        )
        return output[0]['generated_text']

if __name__ == "__main__":
    agent = HelloAgent()
    response = agent.run("Hello NeuroGenX, describe yourself like a superhero AI from the future.")
    print("\n--- Agent Response ---")
    print(response)

