export const CURRENCY = {
  symbol: '₦',
  label: '₦',
  format: (value) => `₦${Number(value).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
};

export default CURRENCY;
