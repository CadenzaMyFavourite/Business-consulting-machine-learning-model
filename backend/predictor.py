import os

import torch
import torch.nn as nn
import torch.optim as optim

from backend.schemas import ModelInput

MODEL_PATH = os.path.join(os.path.dirname(__file__), "forecast_model.pt")


class SimpleForecastModel(nn.Module):
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


def _train_sample_model(model: nn.Module, epochs: int = 100) -> None:
    # Synthetic training data - replace with real historical KPI data
    x = torch.rand(500, 4)
    # Pretend KPI is correlated with a weighted sum of inputs
    y = (x[:, 0] * 0.4 + x[:, 1] * 0.2 + x[:, 2] * 0.2 + x[:, 3] * 0.2 + 0.05 * torch.randn(500)).unsqueeze(1)

    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=1e-3)

    model.train()
    for _ in range(epochs):
        optimizer.zero_grad()
        preds = model(x)
        loss = criterion(preds, y)
        loss.backward()
        optimizer.step()

    torch.save(model.state_dict(), MODEL_PATH)


_model: SimpleForecastModel | None = None


def load_model() -> SimpleForecastModel:
    global _model
    if _model is not None:
        return _model

    model = SimpleForecastModel()
    if os.path.exists(MODEL_PATH):
        model.load_state_dict(torch.load(MODEL_PATH))
    else:
        _train_sample_model(model)
    model.eval()

    _model = model
    return _model


def predict(features: ModelInput) -> float:
    model = load_model()
    x = torch.tensor(
        [
            [
                features.customers / 1000.0,
                features.repeat_rate,
                features.avg_age / 100.0,
                features.social_engagement,
            ]
        ],
        dtype=torch.float32,
    )
    with torch.no_grad():
        out = model(x)
    return float(out.squeeze().item())
