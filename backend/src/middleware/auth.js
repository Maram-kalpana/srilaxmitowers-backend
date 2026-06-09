import ApiError from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/tokens.js";
import userRepository from "../repositories/user.repository.js";

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Access token required");
    }
    const token = header.slice(7);
    const decoded = verifyAccessToken(token);
    const user = await userRepository.findById(decoded.sub);
    if (!user || user.deleted_at || !user.is_active) {
      throw ApiError.unauthorized("Invalid or inactive user");
    }
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    return next(ApiError.unauthorized("Invalid or expired token"));
  }
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden("Insufficient permissions"));
    }
    next();
  };
}
