export const isWithinDateRange = (expenseDate, present) => {
  const today = new Date();

  const date = new Date(expenseDate);

  console.log("Today is  :", today);
  console.log("Purchased Date is  :", date);
  

  switch (present) {
    case "today":
      return date.toDateString() === today.toDateString();

    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      return date.toDateString() === yesterday.toDateString();
    }

    case "last7days": {
      const last7 = new Date(today);
      last7.setDate(today.getDate() - 7);

      return date >= last7;
    }
    case "last30days": {
      const last30 = new Date(today);
      last30.setDate(today.getDate() - 30);

      return date >= last30;
    }
    case "thisMonth":
      return (
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );

    case "lastMonth": {
      const lastMonth = new Date(today);
      lastMonth.setMonth(today.getMonth() - 1);

      return (
        date.getMonth() === lastMonth.getMonth() &&
        date.getFullYear() === lastMonth.getFullYear()
      );
    }

    default:
      return true;
  }
};
