const formatSalary = (amount: number): string => {
  const formattedAmountEUR = amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
  return formattedAmountEUR;
};

export default formatSalary;
