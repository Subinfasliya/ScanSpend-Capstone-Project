export const toFrontendExpense = (expense) => {
  const expenseDate = new Date(expense.expenseDate);
  const pad = (value) => String(value).padStart(2, "0");
  return {
    ...expense,
    id: expense._id || expense.id,
    date: `${expenseDate.getFullYear()}-${pad(expenseDate.getMonth() + 1)}-${pad(expenseDate.getDate())}`,
    time: `${pad(expenseDate.getHours())}:${pad(expenseDate.getMinutes())}`,
    note: expense.notes || "",
  };
};

export const toBackendExpense = (expense) => {
  const expenseDate = new Date(`${expense.date}T${expense.time || "00:00"}`);
  return {
    merchant: expense.merchant,
    amount: Number(expense.amount),
    category: expense.category,
    expenseDate: expenseDate.toISOString(),
    notes: expense.note || "",
  };
};
