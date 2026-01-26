from transformers import AutoTokenizer, AutoModelForCausalLM, Trainer, TrainingArguments, DataCollatorForSeq2Seq
from peft import LoraConfig, get_peft_model, TaskType
from datasets import Dataset
import torch
import json

# Load base model and tokenizer
MODEL_NAME = "qwen2.5-coder:7b"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, device_map="auto")

# Load training dataset
with open("training/dataset.json") as f:
    data = json.load(f)

# Convert to HuggingFace Dataset
hf_dataset = Dataset.from_list([{"input": ex["input"], "output": ex["output"]} for ex in data])

# Tokenization function
def tokenize_function(ex):
    enc = tokenizer(f"Instruction: Analyze and suggest\n{ex['input']}\nOutput: {ex['output']}", truncation=True)
    enc["labels"] = enc["input_ids"].copy()
    return enc

tokenized_dataset = hf_dataset.map(tokenize_function, remove_columns=["input", "output"])

# LoRA Config
lora_config = LoraConfig(
    r=8,
    lora_alpha=16,
    target_modules=["q_proj","v_proj"],  # Typical for Qwen
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.CAUSAL_LM
)

model = get_peft_model(model, lora_config)

# Training arguments
training_args = TrainingArguments(
    output_dir="./training/adapter",
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    learning_rate=1e-4,
    num_train_epochs=3,
    logging_steps=10,
    save_steps=50,
    save_total_limit=2,
    fp16=torch.cuda.is_available(),
    report_to="none"
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
    data_collator=DataCollatorForSeq2Seq(tokenizer, return_tensors="pt")
)

trainer.train()
model.save_pretrained("./training/adapter")
