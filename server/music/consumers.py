import json
from channels.generic.websocket import AsyncWebsocketConsumer
from transformers import pipeline

chatbot = pipeline("text-generation", model="gpt2")

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get("message", "")

        # Xử lý bằng AI
        response = chatbot(message, max_length=100, do_sample=True)[0]['generated_text']

        # Gửi phản hồi lại client
        await self.send(text_data=json.dumps({
            "response": response
        }))
