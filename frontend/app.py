import streamlit as st
import requests

st.title("AI Business Consultant")

customers = st.number_input("Customers", 1, 10000, 90)
repeat_rate = st.slider("Repeat Rate", 0.0, 1.0, 0.45)
avg_age = st.number_input("Average Age", 15, 80, 25)
social = st.slider("Social Engagement", 0.0, 1.0, 0.2)

if st.button("Analyze"):
    payload = {
        "customers": customers,
        "repeat_rate": repeat_rate,
        "avg_age": avg_age,
        "social_engagement": social
    }
    try:
        res = requests.post("http://127.0.0.1:8000/analyze", json=payload)
        st.write(res.json()["strategy"])
    except Exception as e:
        st.error(f"Error: {e}")
