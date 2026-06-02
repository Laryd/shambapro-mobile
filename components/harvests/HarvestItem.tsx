import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Harvest } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Colors, Spacing } from '@/constants/colors';
import { useTranslation } from 'react-i18next';

interface Props {
  harvest: Harvest;
  onDelete?: (id: string) => void;
  onEdit?: (harvest: Harvest) => void;
}

export default function HarvestItem({ harvest, onDelete, onEdit }: Props) {
  const { t } = useTranslation();

  function confirmDelete() {
    Alert.alert('Delete Harvest', 'Delete this harvest record?', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => onDelete?.(harvest._id) },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="cut-outline" size={18} color={Colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.quantity}>
          {harvest.quantity} {harvest.quantityUnit}
          {harvest.buyer ? ` · ${harvest.buyer}` : ''}
        </Text>
        <Text style={styles.meta}>{formatDate(harvest.date)}</Text>
        <View style={styles.financials}>
          <Text style={styles.gross}>Gross: {formatCurrency(harvest.grossAmount)}</Text>
          {harvest.totalDeductions > 0 ? (
            <Text style={styles.deduction}>
              -{formatCurrency(harvest.totalDeductions)} deductions
            </Text>
          ) : null}
          <Text style={styles.net}>Net: {formatCurrency(harvest.netReceived)}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity onPress={() => onEdit(harvest)} style={styles.editBtn}>
            <Ionicons name="pencil-outline" size={15} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={confirmDelete} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={15} color={Colors.danger} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  info: { flex: 1 },
  quantity: { fontSize: 14, fontWeight: '600', color: Colors.text },
  meta: { fontSize: 12, color: Colors.textMuted, marginTop: 2, marginBottom: 6 },
  financials: { gap: 2 },
  gross: { fontSize: 12, color: Colors.textSecondary },
  deduction: { fontSize: 12, color: Colors.danger },
  net: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  actions: { flexDirection: 'row', gap: 4, marginTop: 4 },
  editBtn: { padding: 6, borderRadius: 8 },
  deleteBtn: { padding: 6, borderRadius: 8 },
});
