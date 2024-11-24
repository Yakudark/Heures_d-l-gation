export const STORAGE_KEY = '@heures_delegation';
export const ENTRIES_KEY = '@heures_delegation_entries';
export const DELEGATION_HOURS = 22;
export const CHSCT_HOURS = 2;

export const calculateTotalHours = (entriesList, selectedMonth, selectedYear) => {
  // Validation des paramètres
  if (!Array.isArray(entriesList)) {
    throw new Error('entriesList doit être un tableau.');
  }
  if (typeof selectedMonth !== 'number' || selectedMonth < 0 || selectedMonth > 11) {
    throw new Error('selectedMonth doit être un nombre entre 0 et 11.');
  }
  if (typeof selectedYear !== 'number' || selectedYear < 1970) {
    throw new Error('selectedYear doit être un nombre valide.');
  }

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

        if (isNaN(startTime) || isNaN(endTime)) {
          console.warn(`Heure invalide dans l'entrée : ${JSON.stringify(entry)}`);
          return totals;
        }

        const hours = (endTime - startTime) / (1000 * 60 * 60);

        switch (entry.type) {
          case 'delegation':
            totals.delegation += hours;
            break;
          case 'chsct':
            totals.chsct += hours;
            break;
          case 'reunion':
            totals.reunion += hours;
            break;
          default:
            console.warn(`Type d'entrée non reconnu : ${entry.type}`);
        }

        return totals;
      },
      { delegation: 0, chsct: 0, reunion: 0 }
    );
};
