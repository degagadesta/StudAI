import * as departmentService from "./department.service.js";
import { AppError } from "../../utils/AppError.js";

export const getDepartments = async (req, res, next) => {
    try {
        const { universityId } = req.params;

        if (!universityId) {
            throw new AppError("University ID is required", 400);
        }

        const departments = await departmentService.getDepartmentsByUniversity(
            universityId
        );

        return res.status(200).json({
            success: true,
            data: departments,
        });
    } catch (error) {
        next(error);
    }
};

export const getDepartment = async (req, res, next) => {
    try {
        const department = await departmentService.getDepartmentById(req.params.id);

        if (!department) {
            throw new AppError("Department not found", 404);
        }

        return res.status(200).json({
            success: true,
            data: department,
        });
    } catch (error) {
        next(error);
    }
};