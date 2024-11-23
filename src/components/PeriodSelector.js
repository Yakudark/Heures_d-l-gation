import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { styles } from '../styles/styles';

const PeriodSelector = ({ selectedMonth, selectedYear, setSelectedMonth, setSelectedYear, onValidate }) => {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 2 + i
  );

  return (
    <View style={styles.periodSelector}>
      <Text style={styles.periodTitle}>Sélectionner la période</Text>
      
      <View style={styles.pickerContainer}>
        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Mois</Text>
          <View style={styles.pickerBackground}>
            <Picker
              selectedValue={selectedMonth}
              onValueChange={setSelectedMonth}
              style={styles.picker}
            >
              {months.map((month, index) => (
                <Picker.Item key={index} label={month} value={index} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Année</Text>
          <View style={styles.pickerBackground}>
            <Picker
              selectedValue={selectedYear}
              onValueChange={setSelectedYear}
              style={styles.picker}
            >
              {years.map(year => (
                <Picker.Item key={year} label={year.toString()} value={year} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.validateButton}
        onPress={onValidate}
      >
        <Text style={styles.validateButtonText}>Voir l'historique</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PeriodSelector;
