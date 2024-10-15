const formatSalary = (amount: number): string => {
  const formattedAmountEUR = amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  return formattedAmountEUR;
};

export default formatSalary;
