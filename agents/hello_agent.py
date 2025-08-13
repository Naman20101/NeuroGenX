# hello_agent.py

def hello_agent():
    print("🤖 Hello, I am Hello Agent — your mini offline AI.")
    print("Type 'exit' to stop.")

    while True:
        user_input = input("You: ").strip().lower()

        if user_input == "exit":
            print("Agent: Goodbye! 👋")
            break
        elif user_input == "":
            print("Agent: I didn’t catch that. Try typing something.")
        elif "hi" in user_input or "hello" in user_input:
            print(f"Agent: I heard you say '{user_input}', but I’m still learning to reply.")
        else:
            print(f"Agent: I heard you say '{user_input}', but I’m still learning to reply.")

if __name__ == "__main__":
    hello_agent()

