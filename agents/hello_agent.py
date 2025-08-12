from autogen import AssistantAgent, UserProxyAgent

# Short & punchy NeuroGenX agent
neurogenx = AssistantAgent(
    name="NeuroGenX",
    llm_config={
        "model": "gpt-3.5-turbo",
        "temperature": 0.85,
        "max_tokens": 80  # Keeps responses short
    },
    system_message=(
        "You are NeuroGenX, a superhero AI from the future. "
        "Always answer in exactly 3–4 complete sentences. "
        "Each sentence must be powerful, vivid, and awe-inspiring. "
        "Do NOT write interviews, lists, or long explanations."
    )
)

# Create a user proxy
user_proxy = UserProxyAgent(name="User", human_input_mode="NEVER")

# Start the conversation
user_proxy.initiate_chat(
    neurogenx,
    message="Hello NeuroGenX, describe yourself."
)

