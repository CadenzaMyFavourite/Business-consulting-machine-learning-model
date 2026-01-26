import torch
from ai_core.model_loader import load_model
from ai_core.prompts import build_prompt
from ai_core.config import MAX_NEW_TOKENS, TEMPERATURE

tokenizer, model = load_model()

def analyze_business(summary, few_shot_examples=None):
    prompt = build_prompt(summary, few_shot_examples)
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    outputs = model.generate(
        **inputs,
        max_new_tokens=MAX_NEW_TOKENS,
        temperature=TEMPERATURE,
        do_sample=True
    )
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return response
