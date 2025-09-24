import { supabase } from "../config/supabaseClient.js";

export const MedicationModel = {
  async getAll(searchName = null, page = null, limit = null) {
    // Base query for counting total records
    let countQuery = supabase
      .from("medications")
      .select("id", { count: "exact", head: true });

    // Base query for fetching data
    let dataQuery = supabase
      .from("medications")
      .select(
        "id, sku, name, description, price, quantity, category_id, supplier_id"
      );

    // Add search filter if searchName is provided
    if (searchName) {
      countQuery = countQuery.ilike("name", `%${searchName}%`);
      dataQuery = dataQuery.ilike("name", `%${searchName}%`);
    }

    // Get total count
    const { count: totalRecords, error: countError } = await countQuery;
    if (countError) throw countError;

    // Add pagination if page and limit are provided
    if (page && limit) {
      const offset = (page - 1) * limit;
      dataQuery = dataQuery.range(offset, offset + limit - 1);
    }

    // Execute data query
    const { data, error } = await dataQuery;
    if (error) throw error;

    // Return data with pagination info if pagination is used
    if (page && limit) {
      const totalPages = Math.ceil(totalRecords / limit);
      return {
        data,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total_records: totalRecords,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1
        }
      };
    }

    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("medications")
      .select(
        `
        id, sku, name, description, price, quantity,
        categories ( id, name ),
        suppliers ( id, name, email, phone ),
      `
      )
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  // Validation helper function
  validateMedication(medication, index = null) {
    const errors = [];
    const prefix = index !== null ? `Medication at index ${index}:` : '';

    // Validate price
    if (medication.price !== undefined && medication.price !== null) {
      const price = parseFloat(medication.price);
      if (isNaN(price) || price < 0) {
        errors.push(`${prefix} Price must be a non-negative number`.trim());
      }
    }

    // Validate quantity
    if (medication.quantity !== undefined && medication.quantity !== null) {
      const quantity = parseFloat(medication.quantity);
      if (isNaN(quantity) || quantity < 0) {
        errors.push(`${prefix} Quantity must be a non-negative number`.trim());
      }
    }

    return errors;
  },

  async create(payload) {
    // Validate the medication data
    const validationErrors = this.validateMedication(payload);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }

    const { data, error } = await supabase
      .from("medications")
      .insert([payload])
      .select();
    if (error) throw error;
    return data[0];
  },

  async createMultiple(medications) {
    // Validate that all medications have required fields
    const requiredFields = [
      "sku",
      "name",
      "category_id",
      "supplier_id",
      "price",
      "quantity",
    ];

    const allErrors = [];

    for (let i = 0; i < medications.length; i++) {
      const med = medications[i];
      
      // Check required fields
      for (const field of requiredFields) {
        if (
          !med.hasOwnProperty(field) ||
          med[field] === null ||
          med[field] === undefined
        ) {
          allErrors.push(
            `Missing required field '${field}' in medication at index ${i}`
          );
        }
      }

      // Validate price and quantity
      const validationErrors = this.validateMedication(med, i);
      allErrors.push(...validationErrors);
    }

    // If there are any validation errors, throw them all
    if (allErrors.length > 0) {
      throw new Error(allErrors.join('; '));
    }

    const { data, error } = await supabase
      .from("medications")
      .insert(medications)
      .select();

    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    // Validate the medication data for update
    const validationErrors = this.validateMedication(payload);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }

    const { data, error } = await supabase
      .from("medications")
      .update(payload)
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async remove(id) {
    const { error } = await supabase.from("medications").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  },
};