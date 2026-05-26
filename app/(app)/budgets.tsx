import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import BudgetCard from '@/components/budgets/BudgetCard';
import AppModal from '@/components/ui/AppModal';
import BudgetForm from '@/components/budgets/BudgetForm';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { getBudgets, createBudget } from '@/lib/api/budgets';
import { getPlots } from '@/lib/api/plots';
import { Colors, Spacing } from '@/constants/colors';

export default function BudgetsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: budgets, isLoading, refetch } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => getBudgets(),
  });

  const { data: plots } = useQuery({
    queryKey: ['plots'],
    queryFn: getPlots,
  });

  async function handleCreate(data: Parameters<typeof createBudget>[0]) {
    setSubmitting(true);
    try {
      await createBudget(data);
      setModal(false);
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create budget');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('budgets.title')}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              if (!plots || plots.length === 0) {
                Alert.alert('No plots', 'Create a plot first to set a budget.');
                return;
              }
              setModal(true);
            }}
          >
            <Ionicons name="add" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={budgets ?? []}
          keyExtractor={(b) => b._id}
          renderItem={({ item }) => <BudgetCard budget={item} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={Colors.primary} />}
          ListEmptyComponent={<EmptyState icon="calculator-outline" message={t('budgets.noBudgets')} />}
        />
      </View>

      <AppModal
        visible={modal}
        onClose={() => setModal(false)}
        title={t('budgets.create')}
      >
        <BudgetForm plots={plots ?? []} onSubmit={handleCreate} loading={submitting} />
      </AppModal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: Spacing.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.text },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: Spacing.base },
});
