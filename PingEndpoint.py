import requests
import json

API_URL = "https://y3y4q9sxi6y80ss0.us-east-1.aws.endpoints.huggingface.cloud"
headers = {
	"Accept" : "application/json",
	"Content-Type": "application/json" 
}

def query(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	out = response.json()['response']
	ans = out.split('ASSISTANT:')[-1].strip()
	print(ans)
	return ans

path = "MedLlavaInputExample.json"
with open(path, "r") as f:   # always use a context‑manager
	data = json.load(f)  

output = query(data)