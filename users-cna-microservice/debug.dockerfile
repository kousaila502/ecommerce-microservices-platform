FROM python:3.10.5-alpine3.16 
WORKDIR /usr/src/app 
COPY . . 
RUN ls -la db/ 
RUN cat db/config.py 
