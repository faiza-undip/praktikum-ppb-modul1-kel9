import express from "express";
import { ReportController } from "../controllers/reportController.js";

const router = express.Router();

// Basic reports
router.get("/total", ReportController.getTotalMedications);
router.get("/total-quantity", ReportController.getTotalQuantity);

// Breakdown reports
router.get("/by-category", ReportController.getTotalMedicationsByCategory);
router.get("/by-supplier", ReportController.getTotalMedicationsBySupplier);

export default router;