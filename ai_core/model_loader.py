from transformers import AutoTokenizer, AutoModelForCausalLM
from ai_core.config import MODEL_NAME, DEVICE

def load_model():
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, device_map="auto")
    model.to(DEVICE)
    return tokenizer, model
