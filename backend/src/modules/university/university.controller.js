import * as universityService from "./university.service.js";
import { AppError } from "../../utils/AppError.js";

export const getUniversities = async (req, res, next) => {
    try {
        const universities = await universityService.getAllUniversities();

        return res.status(200).json({
            success: true,
            data: universities,
        });
    } catch (error) {
        next(error);
    }
};

export const getUniversity = async (req, res, next) => {
    try {
        const university = await universityService.getUniversityById(req.params.id);

        if (!university) {
            throw new AppError("University not found", 404);
        }

        return res.status(200).json({
            success: true,
            data: university,
        });
    } catch (error) {
        next(error);
    }
};