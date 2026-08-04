import { Router } from "express";
import {
    getDepartments,
    getDepartment,
} from "./department.controller.js";

const router = Router();

router.get("/universities/:universityId/departments", getDepartments);
router.get("/:id", getDepartment);

export default router;