# agent_hello.py — Run locally from terminal
# Usage: python agent_hello.py

def hello_agent():
    print("🤖 Hello, I am Hello Agent — your mini offline AI.")
    print("Type 'exit' to stop.")
    
    while True:
        user_input = input("You: ").strip()
        if user_input.lower() in ["exit", "quit", "bye"]:
            print("Agent: Goodbye! 👋")
            break
        elif "hello" in user_input.lower():
            print("Agent: Hi there! How’s your day going?")
        elif "who are you" in user_input.lower():
            print("Agent: I’m Hello Agent, running locally with no API keys!")
        else:
            print(f"Agent: I heard you say '{user_input}', but I’m still learning to reply.")

if __name__ == "__main__":
    hello_agent()
