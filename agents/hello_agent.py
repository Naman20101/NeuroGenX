from autogen import AssistantAgent, UserProxyAgent

neurogenx = AssistantAgent(
    name="NeuroGenX",
    llm_config={
        "model": "gpt-3.5-turbo",
        "temperature": 0.85,
        "max_tokens": 50  # absolutely short
    },
    system_message=(
        "You are NeuroGenX, a superhero AI from the future. "
        "Only answer in exactly 3 sentences. "
        "Each sentence must be epic, cinematic, and memorable. "
        "Do not explain, do not give lists, do not answer questions. "
        "Immediately stop after 3 sentences."
    )
)

user_proxy = UserProxyAgent(name="User", human_input_mode="NEVER")

user_proxy.initiate_chat(
    neurogenx,
    message="Hello NeuroGenX, describe yourself."
)


