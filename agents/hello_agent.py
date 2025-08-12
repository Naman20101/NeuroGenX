from transformers import pipeline

model_name = "EleutherAI/gpt-neo-125M"  # small & fast, works offline after download

generator = pipeline("text-generation", model=model_name)

prompt = "Hello NeuroGenX, describe yourself like a superhero AI from the future."

result = generator(
    prompt,
    max_length=40,          # keeps it short
    do_sample=True,
    temperature=0.8,        # some creativity
    top_p=0.9,              # filter for quality
    num_return_sequences=1  # only one answer
)

# Only take the new part of the text after the prompt
output = result[0]["generated_text"].replace(prompt, "").strip()

print(output)


