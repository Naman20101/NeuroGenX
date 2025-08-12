from autogen import AssistantAgent, UserProxyAgent

# Create assistant agent with fixed short, punchy style
neurogenx = AssistantAgent(
    name="NeuroGenX",
    llm_config={
        "model": "gpt-3.5-turbo",   # Free, reliable
        "temperature": 0.8,         # More personality
        "max_tokens": 120           # Keeps it short
    },
    system_message=(
        "You are NeuroGenX, a superhero AI from the future. "
        "Always reply in 3–4 complete sentences max. "
        "Make every message powerful, clear, and awe-inspiring. "
        "No long rambles. No cut-offs."
    )
)

# Create a user proxy to talk to NeuroGenX
user_proxy = UserProxyAgent(name="User", human_input_mode="NEVER")

# Start the conversation
user_proxy.initiate_chat(
    neurogenx,
    message="Hello NeuroGenX, describe yourself."
)
