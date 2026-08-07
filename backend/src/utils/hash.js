import bcrypt from "bcrypt";
import { AppError } from "./AppError.js";

const SALT_ROUNDS = 12;

export const hashPassword = async (password) => {
    try {
        if (!password) {
            throw new AppError("Password is required", 400);
        }
        return await bcrypt.hash(password, SALT_ROUNDS);
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Unable to process password. Please try again", 500);
    }
};

export const comparePassword = async (password, hash) => {
    try {
        if (!password || !hash) {
            throw new AppError("Password is required", 400);
        }
        return await bcrypt.compare(password, hash);
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Unable to verify password. Please try again", 500);
    }
};