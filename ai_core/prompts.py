SYSTEM_PROMPT = """
You are a professional business consultant AI.
Analyze customer and business data to propose realistic strategies to grow the customer base by 50%.
Be data-driven and specific.
"""

def build_prompt(summary, few_shot_examples=None):
    prompt = SYSTEM_PROMPT + "\n"
    if few_shot_examples:
        for ex in few_shot_examples:
            prompt += f"Input: {ex['input']}\nOutput: {ex['output']}\n\n"
    prompt += f"Input: {summary}\nOutput:"
    return prompt
