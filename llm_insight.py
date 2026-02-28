from transformers import pipeline

generator = pipeline("text-generation", model="gpt2")

def generate_insight(summary_text):
    prompt = f"Explain the following business data:\n{summary_text}"
    result = generator(prompt, max_length=150, num_return_sequences=1)
    return result[0]["generated_text"]
