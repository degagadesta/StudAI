import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../../../uploads/pdfs');

// Subscription limits
const SUBSCRIPTION_LIMITS = {
    FREE: 5,
    PRO: 10,
    UNLIMITED: Infinity
};

// Helper: Save file to disk
async function saveFileToDisk(file, studentId, courseId) {
    try {
        await fs.access(UPLOAD_DIR);
    } catch {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }

    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${studentId}_${courseId}_${timestamp}_${sanitizedName}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    await fs.writeFile(filePath, file.buffer);

    return {
        fileName,
        filePath: `/uploads/pdfs/${fileName}`,
        fileSize: file.size
    };
}

// Helper: Delete file from disk
async function deleteFileFromDisk(fileUrl) {
    try {
        const fileName = fileUrl.split('/').pop();
        const filePath = path.join(UPLOAD_DIR, fileName);
        await fs.unlink(filePath);
    } catch (error) {
        console.error('Failed to delete file:', error);
    }
}

// Upload PDF
export async function uploadPDF(studentId, courseId, file) {
    // 1. Get student subscription
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { subscriptionPlan: true }
    });

    if (!student) {
        throw new AppError("Student not found", 404);
    }

    // 2. Count active PDFs
    const activeCount = await prisma.courseMaterial.count({
        where: {
            uploadedBy: studentId,
            status: 'READY' // READY means active, FAILED means deleted
        }
    });

    const limit = SUBSCRIPTION_LIMITS[student.subscriptionPlan];
    if (activeCount >= limit) {
        throw new AppError(
            `Upload limit reached. Your ${student.subscriptionPlan} plan allows ${limit} active PDFs`,
            403
        );
    }

    // 3. Verify student has access to course
    const profile = await prisma.studentProfile.findUnique({
        where: { studentId }
    });

    if (!profile) {
        throw new AppError("Please complete onboarding first", 400);
    }

    const courseAccess = await prisma.curriculumCourse.findFirst({
        where: {
            curriculumId: profile.curriculumId,
            courseId: courseId
        }
    });

    if (!courseAccess) {
        throw new AppError("You don't have access to this course", 403);
    }

    // 4. Save file
    const { fileName, filePath, fileSize } = await saveFileToDisk(file, studentId, courseId);

    // 5. Save to database
    const pdf = await prisma.courseMaterial.create({
        data: {
            courseId,
            title: file.originalname,
            fileUrl: filePath,
            fileSize,
            uploadedBy: studentId,
            status: 'READY',
            summary: null // Can add PDF text extraction later
        },
        include: {
            course: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    });

    return {
        id: pdf.id,
        fileName: pdf.title,
        fileSize: pdf.fileSize,
        uploadDate: pdf.createdAt,
        courseName: pdf.course.title
    };
}

// List PDFs grouped by course
export async function getStudentPDFs(studentId) {
    const pdfs = await prisma.courseMaterial.findMany({
        where: {
            uploadedBy: studentId,
            status: 'READY'
        },
        include: {
            course: {
                select: {
                    title: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Group by course
    const grouped = {};
    pdfs.forEach(pdf => {
        const courseName = pdf.course.title;
        if (!grouped[courseName]) {
            grouped[courseName] = [];
        }
        grouped[courseName].push({
            id: pdf.id,
            fileName: pdf.title,
            fileSize: pdf.fileSize,
            uploadDate: pdf.createdAt,
            courseName
        });
    });

    return grouped;
}

// Delete PDF
export async function deletePDF(studentId, pdfId) {
    // Verify ownership
    const pdf = await prisma.courseMaterial.findFirst({
        where: {
            id: pdfId,
            uploadedBy: studentId,
            status: 'READY'
        }
    });

    if (!pdf) {
        throw new AppError("PDF not found or already deleted", 404);
    }

    // Delete file from storage
    await deleteFileFromDisk(pdf.fileUrl);

    // Soft delete: change status to FAILED
    await prisma.courseMaterial.update({
        where: { id: pdfId },
        data: { status: 'FAILED' }
    });

    return { message: "PDF deleted successfully" };
}
