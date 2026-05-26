import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Expense } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Colors, Spacing } from '@/constants/colors';
import { useTranslation } from 'react-i18next';

interface Props {
  expense: Expense;
  onDelete?: (id: string) => void;
  onEdit?: (expense: Expense) => void;
}

export default function ExpenseItem({ expense, onDelete, onEdit }: Props) {
  const { t } = useTranslation();

  function confirmDelete() {
    Alert.alert(t('common.delete'), 'Delete this expense?', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => onDelete?.(expense._id),
      },
    ]);
  }

  const categoryLabel = t(`cat.${expense.category}`, { defaultValue: expense.category });

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="receipt-outline" size={18} color={Colors.danger} />
      </View>
      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={1}>{expense.description}</Text>
        <Text style={styles.meta}>{categoryLabel} · {formatDate(expense.date)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>-{formatCurrency(expense.amount)}</Text>
        <View style={styles.actions}>
          {onEdit ? (
            <TouchableOpacity onPress={() => onEdit(expense)} style={styles.actionBtn}>
              <Ionicons name="pencil-outline" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
          {onDelete ? (
            <TouchableOpacity onPress={confirmDelete} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={16} color={Colors.danger} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  description: { fontSize: 14, fontWeight: '500', color: Colors.text },
  meta: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 14, fontWeight: '600', color: Colors.danger },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 4 },
});
