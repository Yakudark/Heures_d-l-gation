export const STORAGE_KEY = '@heures_delegation';
export const ENTRIES_KEY = '@heures_delegation_entries';
export const DELEGATION_HOURS = 22;
export const CHSCT_HOURS = 2;

export const calculateTotalHours = (entriesList, selectedMonth, selectedYear) => {
  return entriesList
    .filter(entry => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getMonth() === selectedMonth &&
        entryDate.getFullYear() === selectedYear
      );
    })
    .reduce(
      (totals, entry) => {
        const startTime = new Date(entry.startTime);
        const endTime = new Date(entry.endTime);
        const hours = (endTime - startTime) / (1000 * 60 * 60);

        if (entry.type === 'delegation') {
          totals.delegation += hours;
        } else if (entry.type === 'chsct') {
          totals.chsct += hours;
        } else if (entry.type === 'reunion') {
          totals.reunion += hours;
        }

        return totals;
      },
      { delegation: 0, chsct: 0, reunion: 0 }
    );
};
