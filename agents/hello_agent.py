from transformers import pipeline

# Pick one model from the list:
# "EleutherAI/gpt-neo-125M"  (fastest, smallest)
# "EleutherAI/gpt-neo-1.3B"  (bigger, better)
# "EleutherAI/gpt-j-6B"      (big, more coherent, needs more RAM)
# "facebook/opt-1.3b"        (good alternative)
# "tiiuae/falcon-7b-instruct" (very good, but large)

model_name = "EleutherAI/gpt-neo-125M"

generator = pipeline("text-generation", model=model_name)

prompt = "Hello NeuroGenX, describe yourself like a superhero AI from the future."
result = generator(prompt, max_length=100, do_sample=True, temperature=0.7)

print(result[0]["generated_text"])



