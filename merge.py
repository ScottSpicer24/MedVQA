from transformers import LlavaNextForConditionalGeneration, LlavaNextProcessor
from transformers import BitsAndBytesConfig
from peft import PeftModel
import torch

base_model_id = "llava-hf/llava-v1.6-vicuna-13b-hf"
adapter_path = "checkpoint-5000-001/checkpoint-5000"  # Folder with adapter_model.safetensors

# Load base model
bnb_cfg = BitsAndBytesConfig( # QLoRA default recipe
    load_in_4bit          = True,
    bnb_4bit_quant_type   = "nf4",
    bnb_4bit_use_double_quant = True,
    bnb_4bit_compute_dtype    = torch.float16,
)
model = LlavaNextForConditionalGeneration.from_pretrained(
    base_model_id,
    torch_dtype=torch.float16,
    low_cpu_mem_usage=True,
    trust_remote_code=True,
    quantization_config=bnb_cfg
)

# Load adapters
model = PeftModel.from_pretrained(model, adapter_path)

# Merge LoRA adapter into base model
model = model.merge_and_unload()

# Save the full merged model
save_path = "llava-merged-bnb"
model.save_pretrained(save_path)

# Save tokenizer
processor = LlavaNextProcessor.from_pretrained(base_model_id, trust_remote_code=True)
processor.save_pretrained(save_path)