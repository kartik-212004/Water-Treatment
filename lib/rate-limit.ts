import { NextRequest } from "next/server";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Simple in-memory store for rate limiting
const rateLimitStore: RateLimitStore = {};

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

/**
 * Simple rate limiting function
 * @param request - The Next.js request object
 * @param options - Rate limiting configuration
 * @returns boolean indicating if request is allowed
 */
export function rateLimit(
  request: NextRequest,
  options: RateLimitOptions = { maxRequests: 20, windowMs: 60 * 1000 }
): boolean {
  // Get client IP address (simplified)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown";

  const now = Date.now();

  // Clean up old entries
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });

  // If no previous requests or window has passed, allow request
  if (!rateLimitStore[ip] || rateLimitStore[ip].resetTime < now) {
    rateLimitStore[ip] = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    return true;
  }

  // If within window, check count
  if (rateLimitStore[ip].count >= options.maxRequests) {
    return false;
  }

  // Increment count and allow
  rateLimitStore[ip].count++;

  return true;
}

/**
 * Higher-order function to wrap API route handlers with rate limiting
 * @param handler - The API route handler function
 * @param options - Rate limiting options
 * @returns Wrapped handler with rate limiting
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<Response>,
  options: RateLimitOptions = { maxRequests: 20, windowMs: 60 * 1000 }
) {
  return async (req: NextRequest): Promise<Response> => {
    // Check rate limit
    const isAllowed = rateLimit(req, options);

    if (!isAllowed) {
      return new Response(
        JSON.stringify({
          error: "Too many requests. Please try again in a minute.",
          maxRequests: options.maxRequests,
          windowSeconds: Math.ceil(options.windowMs / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(options.windowMs / 1000)),
          },
        }
      );
    }

    // If rate limit passed, call the original handler
    return handler(req);
  };
}
