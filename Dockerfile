FROM python:3.11.6-slim AS build-env

WORKDIR /app

RUN apt-get update && apt-get install -y nginx

COPY requirements.txt.freeze .
RUN pip install -r requirements.txt.freeze --isolated --only-binary=:all:

COPY nginx.conf /etc/nginx/nginx.conf
COPY server.py .
COPY templates/ templates/
COPY static/ static/

CMD ["python", "server.py", "--certbot"]
