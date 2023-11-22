FROM python:3.11.6-slim AS build-env

WORKDIR /app
COPY static/ static/
COPY templates/ templates/
COPY requirements.txt server.py .
RUN pip install -r requirements.txt --isolated --only-binary=:all:


FROM gcr.io/distroless/python3-debian12:debug

COPY --from=build-env /usr/local/lib/python3.11/site-packages /usr/lib/python3.11/
COPY --from=build-env /app /app
WORKDIR /app

CMD ["server.py"]
