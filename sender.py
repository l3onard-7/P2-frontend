import requests
import json


json_temp = {
    "conversationId": "test_conv_123",
    "question": "What are symptoms of non melanoma skin cancer?",
    "metadata": {
        "test": True,
        "purpose": "local testing"
    }
}

# Send to webhook
try:
    response = requests.post(
        'http://127.0.0.1:9020/webhooks',
        json=json_temp
    )
    response.raise_for_status()  # Raise HTTP errors if any
    print("Response (JSON):", response.json())  # Pretty-print JSON response

except requests.exceptions.RequestException as e:
    print(f"Error sending webhook: {e}")