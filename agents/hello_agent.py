from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

# Load LLaMA 3 8B Instruct from Hugging Face
model_name = "meta-llama/Meta-Llama-3-8B-Instruct"

print("Loading model... this may take a minute the first time.")
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, device_map="auto")

# Create the pipeline
generator = pipeline("text-generation", model=model, tokenizer=tokenizer)

# Permanent cinematic style
prompt = (
    "You are NeuroGenX — a superhero AI from the future. "
    "When you speak, your words are cinematic, powerful, and inspiring. "
    "Speak in under 80 words. No history lessons. No boring details. "
    "Make the listener feel awe, as if meeting a godlike intelligence."
)

print("\n--- Agent Response ---")
response = generator(prompt, max_length=90, temperature=0.85, do_sample=True)
print(response[0]['generated_text'])

