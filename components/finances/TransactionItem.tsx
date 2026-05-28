import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Colors, Spacing } from '@/constants/colors';
import { useTranslation } from 'react-i18next';

interface Props {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export default function TransactionItem({ transaction, onEdit, onDelete }: Props) {
  const { t } = useTranslation();
  const isIncome = transaction.type === 'income';
  const categoryLabel = t(`cat.${transaction.category}`, { defaultValue: transaction.category });

  function confirmDelete() {
    Alert.alert(t('common.delete'), t('finances.deleteConfirm', { defaultValue: 'Delete this transaction?' }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => onDelete?.(transaction._id) },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, isIncome ? styles.incomeIcon : styles.expenseIcon]}>
        <Ionicons
          name={isIncome ? 'arrow-down-outline' : 'arrow-up-outline'}
          size={16}
          color={isIncome ? Colors.primary : Colors.danger}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={styles.meta}>{categoryLabel} · {formatDate(transaction.date)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, isIncome ? styles.incomeText : styles.expenseText]}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
        {(onEdit || onDelete) ? (
          <View style={styles.actions}>
            {onEdit ? (
              <TouchableOpacity onPress={() => onEdit(transaction)} style={styles.actionBtn}>
                <Ionicons name="pencil-outline" size={15} color={Colors.textMuted} />
              </TouchableOpacity>
            ) : null}
            {onDelete ? (
              <TouchableOpacity onPress={confirmDelete} style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={15} color={Colors.danger} />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomeIcon: { backgroundColor: Colors.primaryLight },
  expenseIcon: { backgroundColor: Colors.dangerLight },
  info: { flex: 1 },
  description: { fontSize: 14, fontWeight: '500', color: Colors.text },
  meta: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 14, fontWeight: '600' },
  incomeText: { color: Colors.primary },
  expenseText: { color: Colors.danger },
  actions: { flexDirection: 'row', gap: 6 },
  actionBtn: { padding: 3 },
});
