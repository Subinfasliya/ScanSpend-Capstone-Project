import { expenseSchema } from "./expenseSchema";

export const validateExpenseField = async (
  field,
  value,
  formData
) => {
  try {
    await expenseSchema.validateAt(field, {
      ...formData,
      [field]: value,
    });

    return "";
  } catch (err) {
    return err.message;
  }
};