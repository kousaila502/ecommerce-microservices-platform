# Install python in the container
FROM python:3.10.5-alpine3.16

# Install system dependencies for cryptography
RUN apk add --no-cache gcc musl-dev libffi-dev openssl-dev

RUN pip install pipenv
WORKDIR /usr/src/app

# Copy the Pipfile
COPY Pipfile ./

# install the packages from the Pipfile
RUN pipenv install

# expose the port that uvicorn will run the app
EXPOSE 9090

# Copy .env first to bust cache when it changes
COPY .env .

# copy the rest of the app
COPY . .

# execute the command python main.py (in the WORKDIR) to start the app
CMD ["pipenv", "run", "python", "app.py"]