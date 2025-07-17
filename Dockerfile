FROM pytorch/pytorch:2.3.0-cuda12.1-cudnn8-devel

# Install requirements
COPY requirements.txt .
RUN pip install -r requirements.txt

# For SageMaker AI
RUN pip install sagemaker-inference
CMD ["gunicorn", "--timeout", "60", "-k", "uvicorn.workers.UvicornWorker", \
     "inference:app"]


# Verify GPU access at build-time
# RUN python - << 'PY'
# import torch, bitsandbytes as bnb, xformers, triton, os
# print("CUDA available:", torch.cuda.is_available())
# print("GPU arch:", torch.cuda.get_device_name(0))
# print("BitsAndBytes version:", bnb.__version__)
# PY