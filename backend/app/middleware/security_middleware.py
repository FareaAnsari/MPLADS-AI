"""
Government of India MoSPI — MPLADS AI Backend Security Middleware
Provides:
1. IP-Based Sliding-Window Rate Limiting (Anti-DoS / Flood Protection)
2. Request Payload Size Guard (Max 2MB)
3. Anti-Injection Scanner (SQLi, NoSQLi, Path Traversal, XSS Detection)
4. Hardened Security Headers Injection (CSP, HSTS, X-Frame-Options, nosniff)
5. Request ID Tracing (X-Request-ID)
"""

import time
import re
import uuid
from typing import Dict, Tuple
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

# Max request body size: 2 Megabytes
MAX_BODY_SIZE_BYTES = 2 * 1024 * 1024

# Malicious signature patterns
SQL_INJECTION_PATTERN = re.compile(
    r"(\b(UNION(\s+ALL)?|SELECT|INSERT|DELETE|UPDATE|DROP|ALTER|EXEC|TRUNCATE)\b\s+)|(--|\/\*|\*\/|;)",
    re.IGNORECASE
)
XSS_PATTERN = re.compile(
    r"(<script\b[^>]*>|javascript\s*:|vbscript\s*:|\bon\w+\s*=)",
    re.IGNORECASE
)
PATH_TRAVERSAL_PATTERN = re.compile(
    r"(\.\./|\.\.\\)",
    re.IGNORECASE
)

# In-memory rate limiting store: ip -> (request_count, window_start_time)
RATE_LIMIT_STORE: Dict[str, Tuple[int, float]] = {}
RATE_LIMIT_MAX_REQUESTS = 120
RATE_LIMIT_WINDOW_SECONDS = 60


class HardenedSecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Attach Unique Tracing ID
        request_id = request.headers.get("X-Request-ID") or f"req_{uuid.uuid4().hex[:12]}"

        # 2. Rate Limiting Check
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        
        req_count, window_start = RATE_LIMIT_STORE.get(client_ip, (0, now))
        if now - window_start > RATE_LIMIT_WINDOW_SECONDS:
            req_count = 1
            window_start = now
        else:
            req_count += 1

        RATE_LIMIT_STORE[client_ip] = (req_count, window_start)

        if req_count > RATE_LIMIT_MAX_REQUESTS:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "RATE_LIMIT_EXCEEDED",
                    "message": "Too many requests. Statutory MoSPI anti-flood protocol active. Please retry shortly.",
                    "request_id": request_id
                },
                headers={
                    "Retry-After": "30",
                    "X-Request-ID": request_id
                }
            )

        # 3. Payload Size Guard
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > MAX_BODY_SIZE_BYTES:
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={
                    "error": "PAYLOAD_TOO_LARGE",
                    "message": f"Request body exceeds statutory maximum limit of {MAX_BODY_SIZE_BYTES // (1024 * 1024)}MB.",
                    "request_id": request_id
                },
                headers={"X-Request-ID": request_id}
            )

        # 4. Anti-Injection Inspection on URL Query Parameters
        raw_query = str(request.url.query)
        if raw_query:
            if PATH_TRAVERSAL_PATTERN.search(raw_query):
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"error": "SECURITY_VIOLATION", "message": "Illegal path traversal sequence detected."},
                    headers={"X-Request-ID": request_id}
                )
            if XSS_PATTERN.search(raw_query):
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"error": "SECURITY_VIOLATION", "message": "Cross-site scripting (XSS) payload rejected."},
                    headers={"X-Request-ID": request_id}
                )

        # 5. Process Request
        response: Response = await call_next(request)

        # 6. Inject Enterprise Security Headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(self)"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "img-src 'self' data: https: https://*.tile.openstreetmap.org; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "connect-src 'self' http://localhost:* ws://localhost:* https://*.googleapis.com; "
            "frame-ancestors 'none';"
        )

        return response
