-- CreateEnum for new payment enums
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "PaymentProvider" AS ENUM ('CHAPA', 'MANUAL');
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- Add STUDENT to subscriptionPlan enum
ALTER TYPE "subscriptionPlan" ADD VALUE 'STUDENT';

-- Add new usage features
ALTER TYPE "UsageFeature" ADD VALUE 'QUIZ_GENERATION';
ALTER TYPE "UsageFeature" ADD VALUE 'PDF_UPLOAD';

-- Add subscriptionExpiresAt to Student table
ALTER TABLE "Student" ADD COLUMN "subscriptionExpiresAt" TIMESTAMP(3);

-- CreateTable Payment
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" "PaymentProvider" NOT NULL DEFAULT 'CHAPA',
    "transactionRef" TEXT NOT NULL,
    "chapaReference" TEXT,
    "planUpgraded" "subscriptionPlan" NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL,
    "metadata" JSONB,
    "providerResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable SubscriptionHistory
CREATE TABLE "SubscriptionHistory" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "previousPlan" "subscriptionPlan" NOT NULL,
    "newPlan" "subscriptionPlan" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "reason" TEXT,
    "paymentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SubscriptionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionRef_key" ON "Payment"("transactionRef");

-- CreateIndex
CREATE INDEX "Payment_studentId_idx" ON "Payment"("studentId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_transactionRef_idx" ON "Payment"("transactionRef");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_studentId_idx" ON "SubscriptionHistory"("studentId");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_isActive_idx" ON "SubscriptionHistory"("isActive");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_changedAt_idx" ON "SubscriptionHistory"("changedAt");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionHistory" ADD CONSTRAINT "SubscriptionHistory_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
