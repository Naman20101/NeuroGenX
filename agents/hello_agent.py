from transformers import pipeline

# Load GPT-Neo 1.3B model (free on Hugging Face)
generator = pipeline(
    "text-generation",
    model="EleutherAI/gpt-neo-1.3B",
    device=-1  # CPU mode for web/Colab without GPU
)

def neurogenx_agent(prompt):
    # Short, punchy prompt engineering
    system_prompt = (
        "You are NeuroGenX — a superhero AI from the future. "
        "You speak in powerful, visionary, yet concise statements. "
        "Never more than 4 sentences. End with a mind-blowing or confident statement."
    )
    full_prompt = f"{system_prompt}\nHuman: {prompt}\nNeuroGenX:"

    response = generator(
        full_prompt,
        max_length=80,  # Keeps it short
        do_sample=True,
        temperature=0.9,
        top_p=0.92
    )

    return response[0]['generated_text'].split("NeuroGenX:")[-1].strip()

# Example run
if __name__ == "__main__":
    output = neurogenx_agent("Describe yourself like a superhero AI from the future.")
    print("--- Agent Response ---")
    print(output)


