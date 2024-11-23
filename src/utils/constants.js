export const STORAGE_KEY = '@heures_delegation';
export const ENTRIES_KEY = '@heures_delegation_entries';
export const DELEGATION_HOURS = 22;
export const CHSCT_HOURS = 2;

export const calculateTotalHours = (entriesList, selectedMonth, selectedYear) => {
  return entriesList
    .filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === selectedMonth && 
             entryDate.getFullYear() === selectedYear;
    })
    .reduce(
      (acc, entry) => ({
        ...acc,
        [entry.type]: acc[entry.type] + entry.hours
      }),
      { delegation: 0, chsct: 0 }
    );
};
