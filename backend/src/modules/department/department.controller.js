import * as departmentService from "./department.service.js";

export const getDepartments = async (req, res, next) => {
    try {
        const { universityId } = req.params;

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
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: department,
        });
    } catch (error) {
        next(error);
    }
};