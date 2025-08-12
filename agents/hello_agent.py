from transformers import pipeline

class HelloAgent:
    def __init__(self):
        print("Initializing HelloAgent... 🚀")
        self.generator = pipeline("text-generation", model="gpt2")

    def run(self, prompt: str):
        print(f"🤖 NeuroGenX Agent received: {prompt}")
        output = self.generator(prompt, max_length=50, num_return_sequences=1)
        return output[0]['generated_text']

if __name__ == "__main__":
    agent = HelloAgent()
    response = agent.run("Hello NeuroGenX, introduce yourself.")
    print("\n--- Agent Response ---")
    print(response)
