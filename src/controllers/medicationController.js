import { MedicationModel } from "../models/medicationModel.js";

export const MedicationController = {
  async getAll(req, res) {
    try {
      // Extract query parameters
      const { name, page, limit } = req.query;
      
      // Validate pagination parameters
      let validatedPage = null;
      let validatedLimit = null;
      
      if (page || limit) {
        // Parse and validate page parameter
        validatedPage = page ? parseInt(page) : 1;
        if (validatedPage < 1) {
          return res.status(400).json({ 
            error: "Page must be a positive integer" 
          });
        }
        
        // Parse and validate limit parameter
        validatedLimit = limit ? parseInt(limit) : 10;
        if (validatedLimit < 1 || validatedLimit > 100) {
          return res.status(400).json({ 
            error: "Limit must be between 1 and 100" 
          });
        }
      }
      
      // Get data from model
      const result = await MedicationModel.getAll(name, validatedPage, validatedLimit);
      
      // Format response based on whether pagination was used
      if (validatedPage && validatedLimit) {
        // Response with pagination
        const response = {
          ...result,
          search: name ? { query: name } : undefined
        };
        
        // Remove undefined search property if no search was performed
        if (!name) {
          delete response.search;
        }
        
        res.json(response);
      } else {
        // Response without pagination (backward compatibility)
        if (name) {
          res.json({
            search: {
              query: name,
              total_results: result.length
            },
            data: result
          });
        } else {
          res.json(result);
        }
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const med = await MedicationModel.getById(req.params.id);
      res.json(med);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      // Check if the request body is an array (multiple medications) or single object
      const isArray = Array.isArray(req.body);

      if (isArray) {
        // Handle multiple medications
        if (req.body.length === 0) {
          return res
            .status(400)
            .json({ error: "Medications array cannot be empty" });
        }

        const medications = await MedicationModel.createMultiple(req.body);
        res.status(201).json({
          message: `Successfully created ${medications.length} medications`,
          data: medications,
        });
      } else {
        // Handle single medication (backward compatibility)
        const med = await MedicationModel.create(req.body);
        res.status(201).json(med);
      }
    } catch (err) {
      // Check if it's a validation error or database error
      if (err.message.includes('Price must be') || 
          err.message.includes('Quantity must be') ||
          err.message.includes('Missing required field')) {
        res.status(400).json({ 
          error: "Validation failed", 
          details: err.message 
        });
      } else {
        res.status(400).json({ error: err.message });
      }
    }
  },

  async update(req, res) {
    try {
      const med = await MedicationModel.update(req.params.id, req.body);
      res.json(med);
    } catch (err) {
      // Check if it's a validation error or database error
      if (err.message.includes('Price must be') || 
          err.message.includes('Quantity must be')) {
        res.status(400).json({ 
          error: "Validation failed", 
          details: err.message 
        });
      } else {
        res.status(400).json({ error: err.message });
      }
    }
  },

  async remove(req, res) {
    try {
      await MedicationModel.remove(req.params.id);
      res.json({ message: "Deleted successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};