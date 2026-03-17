"""Train a small PyTorch model for KPI forecasting."""

import os

import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim

from backend.predictor import MODEL_PATH


class ForecastNet(nn.Module):
    def __init__(self, input_dim: int = 4):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 16),
            nn.ReLU(),
            nn.Linear(16, 8),
            nn.ReLU(),
            nn.Linear(8, 1),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


def load_training_data(path: str = "data/demo_clients.csv") -> torch.Tensor:
    df = pd.read_csv(path)
    df = df.dropna(subset=["customers", "repeat_rate", "avg_age", "social_engagement"])
    df["customers"] = df["customers"].astype(float) / 1000.0
    df["avg_age"] = df["avg_age"].astype(float) / 100.0
    x = torch.tensor(
        df[["customers", "repeat_rate", "avg_age", "social_engagement"]].values,
        dtype=torch.float32,
    )
    # target: synthetic KPI
    y = (x[:, 0] * 0.4 + x[:, 1] * 0.2 + x[:, 2] * 0.2 + x[:, 3] * 0.2).unsqueeze(1)
    return x, y


def train(output_path: str = MODEL_PATH, epochs: int = 100):
    x, y = load_training_data()
    model = ForecastNet()
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=1e-3)

    for epoch in range(1, epochs + 1):
        model.train()
        optimizer.zero_grad()
        pred = model(x)
        loss = criterion(pred, y)
        loss.backward()
        optimizer.step()
        if epoch % 20 == 0 or epoch == 1:
            print(f"Epoch {epoch}/{epochs} loss={loss.item():.4f}")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    torch.save(model.state_dict(), output_path)
    print(f"Saved model to {output_path}")


if __name__ == "__main__":
    train()
