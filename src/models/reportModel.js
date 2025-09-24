import { supabase } from "../config/supabaseClient.js";

export const ReportModel = {
  async getTotalMedications() {
    const { count, error } = await supabase
      .from("medications")
      .select("id", { count: "exact", head: true });
    
    if (error) throw error;
    return count;
  },

  async getTotalMedicationsByCategory() {
    const { data, error } = await supabase
      .from("medications")
      .select(`
        category_id,
        categories!inner(name)
      `);
    
    if (error) throw error;
    
    // Group by category and count
    const categoryCount = data.reduce((acc, medication) => {
      const categoryName = medication.categories.name;
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {});
    
    return categoryCount;
  },

  async getTotalMedicationsBySupplier() {
    const { data, error } = await supabase
      .from("medications")
      .select(`
        supplier_id,
        suppliers!inner(name)
      `);
    
    if (error) throw error;
    
    // Group by supplier and count
    const supplierCount = data.reduce((acc, medication) => {
      const supplierName = medication.suppliers.name;
      acc[supplierName] = (acc[supplierName] || 0) + 1;
      return acc;
    }, {});
    
    return supplierCount;
  },

  async getTotalQuantity() {
    const { data, error } = await supabase
      .from("medications")
      .select("quantity");
    
    if (error) throw error;
    
    // Sum all quantities
    const totalQuantity = data.reduce((sum, medication) => {
      return sum + (parseFloat(medication.quantity) || 0);
    }, 0);
    
    return totalQuantity;
  },
};