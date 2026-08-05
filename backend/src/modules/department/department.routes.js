import { Router } from "express";
import {
    getDepartments,
    getDepartment,
} from "./department.controller.js";

const router = Router();

router.get("/university/:universityId", getDepartments);
router.get("/:id", getDepartment);

export default router;