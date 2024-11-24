import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles } from '../styles/styles';
import { DELEGATION_HOURS, CHSCT_HOURS } from '../utils/constants';

const StatsView = ({ entries, selectedMonth, selectedYear }) => {
  // Calculer le pourcentage d'utilisation
  const getUsageStats = () => {
    let totalDelegation = 0;
    let totalChsct = 0;
    let totalReunion = 0;

    entries.forEach(entry => {
      const entryDate = new Date(entry.date);
      if (entryDate.getMonth() === selectedMonth && entryDate.getFullYear() === selectedYear) {
        const start_time = new Date(entry.start_time);
        const end_time = new Date(entry.end_time);
        const hours = (end_time - start_time) / (1000 * 60 * 60);
        
        if (entry.type === 'delegation') {
          totalDelegation += hours;
        } else if (entry.type === 'chsct') {
          totalChsct += hours;
        } else if (entry.type === 'reunion') {
          totalReunion += hours;
        }
      }
    });

    return {
      delegation: {
        used: totalDelegation,
        remaining: Math.max(0, DELEGATION_HOURS - totalDelegation),
        percent: (totalDelegation / DELEGATION_HOURS) * 100
      },
      chsct: {
        used: totalChsct,
        remaining: Math.max(0, CHSCT_HOURS - totalChsct),
        percent: (totalChsct / CHSCT_HOURS) * 100
      },
      reunion: {
        used: totalReunion
      }
    };
  };

  const usageStats = getUsageStats();

  return (
    <ScrollView style={styles.statsContainer}>
      <View style={styles.statsSection}>
        <Text style={styles.statsSectionTitle}>Résumé du Mois</Text>
        
        {/* Première ligne : Délégation et CHSCT côte à côte */}
        <View style={styles.statsTopRow}>
          <View style={[styles.statsCard, styles.halfWidth]}>
            <Text style={styles.statsLabel}>Délégation</Text>
            <Text style={styles.statsValue}>
              {usageStats.delegation.used.toFixed(1)}h
            </Text>
            <Text style={[
              styles.statsPercent,
              usageStats.delegation.percent > 100 ? styles.warningText : styles.goodText
            ]}>
              {usageStats.delegation.percent.toFixed(0)}%
            </Text>
            <Text style={styles.statsRemaining}>
              Reste : {usageStats.delegation.remaining.toFixed(1)}h
            </Text>
          </View>
          
          <View style={[styles.statsCard, styles.halfWidth]}>
            <Text style={styles.statsLabel}>CHSCT</Text>
            <Text style={styles.statsValue}>
              {usageStats.chsct.used.toFixed(1)}h
            </Text>
            <Text style={[
              styles.statsPercent,
              usageStats.chsct.percent > 100 ? styles.warningText : styles.goodText
            ]}>
              {usageStats.chsct.percent.toFixed(0)}%
            </Text>
            <Text style={styles.statsRemaining}>
              Reste : {usageStats.chsct.remaining.toFixed(1)}h
            </Text>
          </View>
        </View>

        {/* Deuxième ligne : Réunion en pleine largeur */}
        <View style={[styles.statsCard, styles.fullWidth]}>
          <Text style={styles.statsLabel}>Réunion</Text>
          <Text style={styles.statsValue}>
            {usageStats.reunion.used.toFixed(1)}h
          </Text>
          <Text style={styles.statsInfo}>
            Total des heures de réunion ce mois
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default StatsView;
