import pandas as pd
import random

def generate_fake_data(n=50):
    data = []
    for _ in range(n):
        data.append({
            "customers": random.randint(50,200),
            "repeat_rate": round(random.uniform(0.2,0.8),2),
            "avg_age": random.randint(18,60),
            "social_engagement": round(random.uniform(0.1,0.8),2)
        })
    df = pd.DataFrame(data)
    df.to_csv("data/fake_clients.csv", index=False)
    print("Fake data generated: data/fake_clients.csv")

if __name__ == "__main__":
    generate_fake_data()
