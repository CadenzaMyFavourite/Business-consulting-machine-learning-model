from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[int, list[WebSocket]] = defaultdict(list)
        self.connection_users: dict[WebSocket, int] = {}

    async def connect(self, websocket: WebSocket, user_id: int) -> None:
        await websocket.accept()
        self.connection_users[websocket] = user_id
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        user_id = self.connection_users.pop(websocket, None)
        if user_id is None:
            return

        connections = self.active_connections.get(user_id, [])
        if websocket in connections:
            connections.remove(websocket)
        if not connections:
            self.active_connections.pop(user_id, None)

    async def send_personal_message(self, message: dict, websocket: WebSocket) -> None:
        await websocket.send_json(message)

    async def broadcast_to_user(self, user_id: int, message: dict) -> None:
        for connection in list(self.active_connections.get(user_id, [])):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)


manager = ConnectionManager()
