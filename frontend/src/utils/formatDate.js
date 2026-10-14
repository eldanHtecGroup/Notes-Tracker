const formatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

// Formats an ISO timestamp for display, e.g. "Oct 14, 2026, 9:25 AM" (depends on the user's locale).
export const formatDate = (isoString) => {
  const date = new Date(isoString);
  return Number.isNaN(date.getTime()) ? '' : formatter.format(date);
};

export default formatDate;
