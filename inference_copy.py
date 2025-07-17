import torch
from transformers import BitsAndBytesConfig, LlavaNextForConditionalGeneration, LlavaNextProcessor
import base64
from PIL import Image
import io
import json


def model_fn(model_dir):
    # Quantization Config
    bnb_cfg = BitsAndBytesConfig( # QLoRA default recipe
        load_in_4bit          = True,
        bnb_4bit_quant_type   = "nf4",
        bnb_4bit_use_double_quant = True,
        bnb_4bit_compute_dtype    = torch.float16,
    )
    model = LlavaNextForConditionalGeneration.from_pretrained(
        model_dir,
        torch_dtype=torch.float16,
        low_cpu_mem_usage=True,
        trust_remote_code=True,
        quantization_config=bnb_cfg,
        device_map="auto",
    )
    model.eval()

    processor = LlavaNextProcessor.from_pretrained(model_dir)

def input_fn(request_body, content_type="application/json"):
    """
    Parse the incoming JSON and return a Python dict.
    Expected JSON:
    {
        "image": "<base64 string>",
        "question": "...",
        "a": "A: ...",
        "b": "B: ...",
        "c": "C: ...",
        "d": "D: ..."
    }
    """
    body = json.loads(request_body)

    # Decode image
    image_bytes = base64.b64decode(body["image"])
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    return {
        "image": image,
        "question": body["question"],
        "a": body["a"],
        "b": body["b"],
        "c": body["c"],
        "d": body["d"],
    }

def predict_fn(inputs, model_data):
    processor = model_data["processor"]
    model = model_data["model"]

    prompt = format_input(inputs['question'], inputs['a'], inputs['b'], inputs['c'], inputs['d'], )
    image = inputs["image"]

    input_data = processor(prompt=prompt, images=image, return_tensors="pt").to(model.device)
    output = model.generate(**input_data, max_new_tokens=128)
    response = processor.tokenizer.decode(output[0], skip_special_tokens=True)
    return {"response": response}

def output_fn(prediction, accept="application/json"):
    return json.dumps(prediction), accept

def format_input(question, a, b, c, d):

    # craft the conversation
    prompt_txt = (
        "Based on the image and the caption, answer the following "
        "multiple-choice question by selecting the correct letter.\n"
        f"Question: {question}\n"
        f"{a}\n{b}\n"
        f"{c}\n{d}\n"
        #"SELECT ONLY THE LETTER CHOICE. SELECT ONLY THE LETTER CHOICE."
    )

    # user turn: text + image     assistant turn: *empty* (only a tag)
    prompt = [
        {"role": "user", "content": [
            {"type": "text",  "text": prompt_txt},
            {"type": "image"},                                  # PIL passed later
        ]},
        {"role": "assistant", "content": [
            {"type": "text",  "text": "Answer: "}               # generation starts here
        ]}
    ]

    return prompt