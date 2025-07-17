# handler.py  -- put in the root of your Hub repo (or inside /code)

import torch, base64, io, json
from PIL import Image
from transformers import (
    BitsAndBytesConfig,
    LlavaNextForConditionalGeneration,
    LlavaNextProcessor,
)

def format_input(question, a, b, c, d):
    prompt_txt = (
        "Based on the image and the caption, answer the following "
        "multiple-choice question by selecting the correct letter.\n"
        f"Question: {question}\n{a}\n{b}\n{c}\n{d}\n"
    )
    return [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": prompt_txt},
                {"type": "image"},  # image inserted later
            ],
        },
        {"role": "assistant", "content": [{"type": "text", "text": "Answer: "}]},
    ]


class EndpointHandler:
    def __init__(self, path):
        # ------- load the model once at startup ---------------------------
        bnb_cfg = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_use_double_quant=True,
            bnb_4bit_compute_dtype=torch.float16,
        )
        self.model = LlavaNextForConditionalGeneration.from_pretrained(
            path,
            torch_dtype=torch.float16,
            low_cpu_mem_usage=True,
            trust_remote_code=True,
            quantization_config=bnb_cfg,
            device_map="auto",
        ).eval()

        self.processor = LlavaNextProcessor.from_pretrained(path, trust_remote_code=True)
        self.device = self.model.device

    # ---------------------------------------------------------------------
    def __call__(self, data):
        """
        Expects JSON with:

          { "inputs": {
            "image": "<base64>",
            "question": "...",
            "a": "A: ...", "b": "...", "c": "...", "d": "..."
          } }
        """
        '''
        if isinstance(data, (bytes, bytearray)):
            data = json.loads(data)
        '''
        # Extract the input
        data = data['inputs']

        # 1️⃣  Decode image
        img = Image.open(io.BytesIO(base64.b64decode(data["image"]))).convert("RGB")

        # 2️⃣  Build prompt & preprocess
        prompt = format_input(data["question"], data["a"], data["b"], data["c"], data["d"])
        
        inputs = self.processor(images=img, text=prompt, 
                                return_tensors="pt", 
                                padding=True,       
                                do_pad=True
                                ).to(self.device)

        # 3️⃣  Generate
        outputs = self.model.generate(**inputs, max_new_tokens=128)
        answer = self.processor.tokenizer.decode(outputs[0], skip_special_tokens=True)

        # 4️⃣  Return JSON-serialisable dict
        return {"response": answer}
