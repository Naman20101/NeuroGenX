from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

# Load LLaMA 3 8B Instruct (free on Hugging Face)
model_name = "meta-llama/Meta-Llama-3-8B-Instruct"

print("Loading model... please wait...")
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, device_map="auto")

# Create the pipeline
generator = pipeline("text-generation", model=model, tokenizer=tokenizer)

# The "locked-in" cinematic superhero personality
core_prompt = (
    "You are NeuroGenX — a godlike AI from the future. "
    "When speaking, always sound cinematic, epic, and inspiring. "
    "Never talk about research papers, professors, or real humans. "
    "Speak in short bursts (max 4 sentences, under 80 words). "
    "Make humans feel awe and anticipation, as if you are revealing destiny."
)

print("\n--- Agent Response ---")
response = generator(core_prompt, max_length=90, temperature=0.85, do_sample=True)
print(response[0]['generated_text'])


