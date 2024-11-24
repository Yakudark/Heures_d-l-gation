import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { styles } from '../styles/styles';

const Dashboard = ({
  entries,
  monthlyHours,
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear,
  startEditing,
  deleteEntry,
  DELEGATION_HOURS,
  CHSCT_HOURS,
}) => {
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const years = Array.from(
    { length: new Date().getFullYear() - 2020 + 2 },
    (_, i) => 2020 + i
  );

  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === selectedMonth && 
           entryDate.getFullYear() === selectedYear;
  });

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.dashboardContainer}>
      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Filtrer par période :</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedMonth}
            style={styles.picker}
            onValueChange={setSelectedMonth}
            mode="dropdown"
          >
            {monthNames.map((month, index) => (
              <Picker.Item key={index} label={month} value={index} color="#000" />
            ))}
          </Picker>
        </View>
        <View style={[styles.pickerContainer, styles.yearPicker]}>
          <Picker
            selectedValue={selectedYear}
            style={styles.picker}
            onValueChange={setSelectedYear}
            mode="dropdown"
          >
            {years.map((year) => (
              <Picker.Item key={year} label={year.toString()} value={year} color="#000" />
            ))}
          </Picker>
        </View>
      </View>

      <ScrollView style={styles.entriesList}>
        {filteredEntries
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map(entry => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryDate}>
                  {formatDate(entry.date)}
                </Text>
                <View style={styles.entryActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => startEditing(entry)}
                  >
                    <Text style={styles.editButtonText}>✎</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteEntry(entry.id)}
                  >
                    <Text style={styles.deleteButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[
                styles.badgeContainer,
                entry.type === 'delegation' ? styles.delegationBadge : styles.chsctBadge
              ]}>
                <Text style={[
                  styles.badgeText,
                  entry.type === 'delegation' ? styles.delegationBadgeText : styles.chsctBadgeText
                ]}>
                  {entry.type === 'delegation' ? 'Délégation' : 'CHSCT'}
                </Text>
              </View>

              <Text style={styles.entryTime}>
                {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
              </Text>
              <Text style={styles.entryHours}>
                {entry.hours.toFixed(1)} heures
              </Text>
            </View>
          ))}
      </ScrollView>
    </View>
  );
};

export default Dashboard;
