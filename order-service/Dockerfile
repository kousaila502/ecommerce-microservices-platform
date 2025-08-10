# Install python in the container
FROM python:3.10.5-alpine3.16

# Install system dependencies for cryptography
RUN apk add --no-cache gcc musl-dev libffi-dev openssl-dev

WORKDIR /usr/src/app

# Copy requirements and install dependencies
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Expose the port
EXPOSE 8081

# Copy the app
COPY . .

# Run the app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8081"]
