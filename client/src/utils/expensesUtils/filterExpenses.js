// export const filterExpenses = (expenses, filters) => {



//     console.log("Expenses filterExp function : " , expenses);

//   let filtered = [...expenses];

//   // Search
//   if (filters.search) {
//     filtered = filtered.filter((expense) =>
//       expense.merchant.toLowerCase().includes(filters.search.toLowerCase()),
//     );
//   }

//   // Category
//   if(filters.category) {
//     filtered = filtered.filter((expense) => expense.category === filters.category)
//   }

//   //Date Range
//   // if(filters.dateRange){
//   //   filtered = applyDateRange = ()
//   // }

//   return filtered

// //
// };
import { isWithinDateRange } from "./dateUtils";
export const filterExpenses = ({
  expenses,
  userId,
  search,
  category,
  dateRange,
  minAmount,
  maxAmount,
  fromDate,
  toDate,
}) => {
  let result = expenses.filter((expense) => expense.userId === userId);

  const normalizedSearch = search.trim().toLowerCase();
  const normalizedCategory = category.trim().toLowerCase();

  if (normalizedSearch) {
    result = result.filter((expense) =>
      expense.merchant.toLowerCase().includes(normalizedSearch),
    );
  }

  if(normalizedCategory){
    result = result.filter((expense) => expense.category.toLowerCase() === normalizedCategory)
  }

  if (dateRange) {    
    result = result.filter((expense) =>
      isWithinDateRange(expense.date, dateRange),
    );
  }

  if (minAmount !== "" && minAmount !== undefined) {
    result = result.filter((expense) => Number(expense.amount) >= Number(minAmount));
  }
  if (maxAmount !== "" && maxAmount !== undefined) {
    result = result.filter((expense) => Number(expense.amount) <= Number(maxAmount));
  }
  if (fromDate) result = result.filter((expense) => expense.date >= fromDate);
  if (toDate) result = result.filter((expense) => expense.date <= toDate);

  return result;
};
