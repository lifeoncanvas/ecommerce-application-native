export const CURRENCY = {
  symbol: '₹',
  label: 'Rs',
  format: (value) => `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
};

export default CURRENCY;
