import json

def load_dataset(path="training/dataset.json"):
    with open(path, "r") as f:
        data = json.load(f)
    return data

if __name__ == "__main__":
    dataset = load_dataset()
    print(f"Loaded {len(dataset)} examples")
