from fastapi.responses import JSONResponse


def internal_error_response() -> JSONResponse:
    return JSONResponse(status_code=500, content={"error": "Erro interno do servidor"})
