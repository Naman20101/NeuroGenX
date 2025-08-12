from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

# Load LLaMA 3 8B Instruct from Hugging Face
model_name = "meta-llama/Meta-Llama-3-8B-Instruct"

print("Loading model... this may take a minute the first time.")
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, device_map="auto")

# Create the pipeline
generator = pipeline("text-generation", model=model, tokenizer=tokenizer)

# Superhero AI introduction
prompt = (
    "You are NeuroGenX — a superhero AI from the future. "
    "Introduce yourself in less than 80 words, making it cinematic, powerful, and inspiring."
)

print("\n--- Agent Response ---")
response = generator(prompt, max_length=100, temperature=0.8, do_sample=True)
print(response[0]['generated_text'])
