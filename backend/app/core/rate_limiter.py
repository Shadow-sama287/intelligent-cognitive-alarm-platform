from fastapi import Request, HTTPException
from app.db.redis import redis_client

async def rate_limiter(request: Request):
    client_ip = request.client.host
    key = f"rate_limit:{client_ip}"
    
    current_requests = redis_client.r.get(key)
    if current_requests and int(current_requests) > 60:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again in 1 minute.")
    
    pipe = redis_client.r.pipeline()
    pipe.incr(key)
    pipe.expire(key, 60)
    pipe.execute()