import { expenseSchema } from "./expenseSchema";

export const validateExpense = async (formData) => {
  try {

    await expenseSchema.validate(formData,{
        abortEarly:false
    });

    return{
        isValid:true,
        errors:{},
    }

  } catch (err) {
    const validationErrors = {};
    err.inner.forEach((error) => {
      validationErrors[error.path] = error.message;
    });

    return {
        isValid:false,
        errors:validationErrors
    }
  }
};
