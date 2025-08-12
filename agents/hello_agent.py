from transformers import pipeline

# Load the GPT-2 model
generator = pipeline('text-generation', model='gpt2')

def run_agent():
    prompt = (
        "You are NeuroGenX, an AI superhero from the year 2150. "
        "Your mission is to inspire humans with your intelligence, precision, and power. "
        "Speak in short, powerful sentences. "
        "Avoid talking about games, reviews, or unrelated topics. "
        "End every response with a sense of mystery or challenge."
        "\n\n--- Agent Response ---\n"
    )
    
    response = generator(
        prompt,
        max_length=120,
        num_return_sequences=1,
        no_repeat_ngram_size=3,
        temperature=0.8,
        top_p=0.9,
        do_sample=True
    )

    print(response[0]['generated_text'])

if __name__ == "__main__":
    run_agent()

