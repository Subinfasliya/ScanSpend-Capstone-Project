import * as Yup from "yup";

export const expenseSchema = Yup.object({

    merchant: Yup.string()
        .trim()
        .required("Merchant name is required")
        .max(50, "Merchant name is too long"),

    amount: Yup.number()
        .typeError("Amount must be a number")
        .positive("Amount must be greater than 0")
        .required("Amount is required"),

    category: Yup.string()
        .required("Category is required"),

    date: Yup.string()
        .required("Date is required"),

    time: Yup.string()
        .required("Time is required"),

    note: Yup.string()
        .max(250, "Maximum 250 characters"),
});