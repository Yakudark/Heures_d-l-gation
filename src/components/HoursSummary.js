import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/styles';
import { DELEGATION_HOURS, CHSCT_HOURS } from '../utils/constants';

const HoursSummary = ({ monthlyHours, selectedMonth, selectedYear }) => {
  const delegationRemaining = DELEGATION_HOURS - monthlyHours.delegation;
  const chsctRemaining = CHSCT_HOURS - monthlyHours.chsct;

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  return (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryPeriod}>
        {monthNames[selectedMonth]} {selectedYear}
      </Text>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Délégation :</Text>
        <View style={styles.summaryValues}>
          <Text style={[
            styles.summaryValue,
            monthlyHours.delegation > DELEGATION_HOURS && styles.warningValue,
            monthlyHours.delegation <= DELEGATION_HOURS && styles.goodValue
          ]}>
            {monthlyHours.delegation.toFixed(1)}h
          </Text>
          <Text style={styles.summaryValue}> / {DELEGATION_HOURS}h</Text>
          <Text style={[
            styles.summaryValue, 
            styles.remainingValue,
            delegationRemaining < 0 ? styles.warningValue : styles.goodValue
          ]}>
            (Reste : {delegationRemaining.toFixed(1)}h)
          </Text>
        </View>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>CHSCT :</Text>
        <View style={styles.summaryValues}>
          <Text style={[
            styles.summaryValue,
            monthlyHours.chsct > CHSCT_HOURS && styles.warningValue,
            monthlyHours.chsct <= CHSCT_HOURS && styles.goodValue
          ]}>
            {monthlyHours.chsct.toFixed(1)}h
          </Text>
          <Text style={styles.summaryValue}> / {CHSCT_HOURS}h</Text>
          <Text style={[
            styles.summaryValue,
            styles.remainingValue,
            chsctRemaining < 0 ? styles.warningValue : styles.goodValue
          ]}>
            (Reste : {chsctRemaining.toFixed(1)}h)
          </Text>
        </View>
      </View>
    </View>
  );
};

export default HoursSummary;
