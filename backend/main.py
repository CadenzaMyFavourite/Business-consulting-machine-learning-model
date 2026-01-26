from fastapi import FastAPI
from backend.schemas import BusinessData
from backend.data_processor import summarize_data
from ai_core.inferencer import analyze_business

app = FastAPI()

@app.post("/analyze")
def analyze(data: BusinessData):
    summary = summarize_data(data)
    result = analyze_business(summary)
    return {"strategy": result}
