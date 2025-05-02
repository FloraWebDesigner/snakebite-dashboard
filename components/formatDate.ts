
export const formatDateForDB = (date: unknown): string | null => {
    if (!date) return null;
    try {
      const d = new Date(date as string | number);
      return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
    } catch {
      return null;
    }
  };
  
  export const formatDateForDisplay = (date: unknown): string => {
    if (!date) return "N/A";
    try {
      const d = date instanceof Date ? date : new Date(date as string | number);
      return isNaN(d.getTime()) ? "Invalid Date" : d.toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };