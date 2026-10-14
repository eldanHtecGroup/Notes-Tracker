// Most recently modified first, matching the order the backend returns.
export const sortByLastModified = (notes) =>
  [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

export default sortByLastModified;
