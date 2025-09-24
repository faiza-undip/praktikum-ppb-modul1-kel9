import { ReportModel } from "../models/reportModel.js";

export const ReportController = {
  async getTotalMedications(req, res) {
    try {
      const total = await ReportModel.getTotalMedications();
      res.json({
        total_medications: total,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getTotalMedicationsByCategory(req, res) {
    try {
      const categoryTotals = await ReportModel.getTotalMedicationsByCategory();
      res.json({
        medications_by_category: categoryTotals,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getTotalMedicationsBySupplier(req, res) {
    try {
      const supplierTotals = await ReportModel.getTotalMedicationsBySupplier();
      res.json({
        medications_by_supplier: supplierTotals,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getTotalQuantity(req, res) {
    try {
      const totalQuantity = await ReportModel.getTotalQuantity();
      res.json({
        total_quantity: totalQuantity,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};