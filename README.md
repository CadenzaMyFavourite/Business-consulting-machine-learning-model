# AI Consulting Startup

## Overview
This project is an AI consulting system using Qwen to analyze customer data and suggest business growth strategies.

## Folder Structure
- ai_core/: Model loading, prompts, inference
- training/: LoRA fine-tuning
- backend/: FastAPI API
- frontend/: Streamlit UI
- data/: Demo and fake data
- reports/: Generated reports

## How to Run
1. Pull Qwen model:
ollama pull qwen2.5-coder:7b
2. Start backend:
uvicorn backend.main:app --reload
3. Start frontend:
streamlit run frontend/app.py
