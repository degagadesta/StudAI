import { AppError } from "../../utils/AppError.js";

export function validateRegister({ firstName, lastName, email, password }) {
    const errors = [];

    if (!firstName || typeof firstName !== "string" || firstName.trim().length < 2) {
        errors.push("First name must be at least 2 characters");
    }

    if (!lastName || typeof lastName !== "string" || lastName.trim().length < 2) {
        errors.push("Last name must be at least 2 characters");
    }

    if (!email || !isValidEmail(email)) {
        errors.push("Valid email is required");
    }

    if (!password || password.length < 8) {
        errors.push("Password must be at least 8 characters");
    }

    if (password && !/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }

    if (password && !/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }

    if (password && !/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
    }

    if (errors.length > 0) {
        throw new AppError(errors.join(", "), 400);
    }
}

export function validateLogin({ email, password }) {
    const errors = [];

    if (!email || !isValidEmail(email)) {
        errors.push("Valid email is required");
    }

    if (!password || !password.trim()) {
        errors.push("Password is required");
    }

    if (errors.length > 0) {
        throw new AppError(errors.join(", "), 400);
    }
}

export function validateEmail(email) {
    if (!email || !isValidEmail(email)) {
        throw new AppError("Valid email is required", 400);
    }
}

export function validateResetPassword({ token, newPassword }) {
    const errors = [];

    if (!token || typeof token !== "string" || token.trim().length === 0) {
        errors.push("Reset token is required");
    }

    if (!newPassword || newPassword.length < 8) {
        errors.push("Password must be at least 8 characters");
    }

    if (newPassword && !/[A-Z]/.test(newPassword)) {
        errors.push("Password must contain at least one uppercase letter");
    }

    if (newPassword && !/[a-z]/.test(newPassword)) {
        errors.push("Password must contain at least one lowercase letter");
    }

    if (newPassword && !/[0-9]/.test(newPassword)) {
        errors.push("Password must contain at least one number");
    }

    if (errors.length > 0) {
        throw new AppError(errors.join(", "), 400);
    }
}

export function validateRefreshToken(refreshToken) {
    if (!refreshToken || typeof refreshToken !== "string" || refreshToken.trim().length === 0) {
        throw new AppError("Refresh token is required", 400);
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
