import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Colors, Spacing } from '@/constants/colors';
import { CategoryTotal } from '@/types';
import { useTranslation } from 'react-i18next';

interface Props {
  data: CategoryTotal[];
}

const BAR_COLORS = [
  Colors.primary,
  Colors.secondary,
  Colors.info,
  Colors.warning,
  Colors.emerald500,
  Colors.blue600,
  Colors.amber600,
  Colors.danger,
];

export default function CategoryChart({ data }: Props) {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No expense data</Text>
      </View>
    );
  }

  const top8 = data.slice(0, 8);
  const screenWidth = Dimensions.get('window').width - 64;

  const chartData = top8.map((d, i) => ({
    value: d.amount,
    label: t(`cat.${d.category}`, { defaultValue: d.category }).slice(0, 8),
    frontColor: BAR_COLORS[i % BAR_COLORS.length],
    topLabelComponent: () => null,
  }));

  return (
    <BarChart
      data={chartData}
      width={screenWidth}
      height={160}
      barWidth={screenWidth / (top8.length * 2)}
      spacing={screenWidth / (top8.length * 2.5)}
      noOfSections={4}
      yAxisTextStyle={{ color: Colors.textLight, fontSize: 9 }}
      xAxisLabelTextStyle={{ color: Colors.textLight, fontSize: 8, width: 40, textAlign: 'center' }}
      rulesColor={Colors.borderLight}
      yAxisColor={Colors.border}
      xAxisColor={Colors.border}
      isAnimated
      roundedTop
      hideRules={false}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 13, color: Colors.textMuted },
});
