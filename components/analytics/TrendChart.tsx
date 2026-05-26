import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Colors, Spacing } from '@/constants/colors';
import { MonthlyTrend } from '@/types';

interface Props {
  data: MonthlyTrend[];
}

export default function TrendChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No trend data available</Text>
      </View>
    );
  }

  const incomeData = data.map((d) => ({ value: d.income, label: d.month.slice(0, 3) }));
  const expenseData = data.map((d) => ({ value: d.expenses }));
  const profitData = data.map((d) => ({ value: Math.max(d.profit, 0) }));

  const screenWidth = Dimensions.get('window').width - 64;

  return (
    <View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
          <Text style={styles.legendText}>Expenses</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.info }]} />
          <Text style={styles.legendText}>Profit</Text>
        </View>
      </View>
      <LineChart
        data={incomeData}
        data2={expenseData}
        data3={profitData}
        color1={Colors.primary}
        color2={Colors.danger}
        color3={Colors.info}
        thickness1={2}
        thickness2={2}
        thickness3={2}
        hideDataPoints
        startFillColor1={Colors.primary}
        startFillColor2={Colors.danger}
        areaChart
        curved
        width={screenWidth}
        height={160}
        noOfSections={4}
        yAxisTextStyle={{ color: Colors.textLight, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: Colors.textLight, fontSize: 9 }}
        rulesColor={Colors.borderLight}
        yAxisColor={Colors.border}
        xAxisColor={Colors.border}
        hideRules={false}
        initialSpacing={0}
        spacing={screenWidth / (data.length + 1)}
        startOpacity1={0.15}
        startOpacity2={0.1}
        endOpacity1={0.02}
        endOpacity2={0.02}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 13, color: Colors.textMuted },
  legend: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: Colors.textMuted },
});
