# hello_agent.py
from transformers import pipeline

def create_agent():
    print("Loading AI Agent...")
    generator = pipeline("text-generation", model="EleutherAI/gpt-neo-125M")
    return generator

def run_agent(agent, prompt):
    response = agent(prompt, max_length=50, do_sample=True, temperature=0.7)
    return response[0]["generated_text"]

if __name__ == "__main__":
    agent = create_agent()
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Agent: Goodbye!")
            break
        print("Agent:", run_agent(agent, user_input))
=
