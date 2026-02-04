import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Trust proxy is handled at app level, so rate limiter will use the correct IP
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: 'Too many authentication attempts, please try again later.',
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'You have exceeded the authentication rate limit. Please try again in 15 minutes.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// Monitor creation rate limiter
export const monitorCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 monitor creations per hour
  message: 'Too many monitors created, please try again later.',
  handler: (req, res) => {
    res.status(429).json({
      error: 'Monitor creation limit exceeded',
      message: 'You have created too many monitors. Please try again later.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});
