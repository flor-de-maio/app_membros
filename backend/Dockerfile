FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY alembic ./alembic
COPY alembic.ini ./
COPY entrypoint.sh ./

RUN mkdir -p /app/public/uploads && \
    chmod +x /app/entrypoint.sh

EXPOSE 3001

CMD ["sh", "./entrypoint.sh"]
