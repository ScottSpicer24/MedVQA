import requests

API_URL = "https://cmph5tojatzmzxtw.us-east-1.aws.endpoints.huggingface.cloud"
headers = {
	"Accept" : "application/json",
	"Authorization": "Bearer HF_TOKEN",
	"Content-Type": "application/json" 
}

def query(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.json()

output = query({
	"inputs": "![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/transformers/rabbit.png)caption en",
	"parameters": {
		"max_new_tokens": 150
	}
})