import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getHerds } from '@/lib/api/animals';
import { AnimalHerd } from '@/types';
import { ANIMAL_EMOJI, ANIMAL_LABELS, ANIMAL_PURPOSE_LABELS } from '@/constants/animals';
import { Colors, Spacing, Radius, Shadow } from '@/constants/colors';

function HerdCard({ herd }: { herd: AnimalHerd }) {
  const router = useRouter();
  const { t } = useTranslation();
  const emoji = ANIMAL_EMOJI[herd.animalType] ?? '🐾';
  const label = ANIMAL_LABELS[herd.animalType] ?? herd.animalType;

  const statusColor = herd.status === 'active' ? Colors.success
    : herd.status === 'sold' ? Colors.info
    : Colors.textLight;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(app)/animals/${herd._id}` as any)}
      activeOpacity={0.75}
    >
      <View style={styles.cardHeader}>
        <View style={styles.emojiBox}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{herd.name}</Text>
          <Text style={styles.cardType}>{label} · {herd.breed}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.metaText}>{t('animals.count', { count: herd.currentCount })}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="pricetag-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.metaText}>{ANIMAL_PURPOSE_LABELS[herd.purpose] ?? herd.purpose}</Text>
        </View>
        {herd.location ? (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>{herd.location}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.herdCode}>{herd.herdCode}</Text>
        <Text style={[styles.statusBadge, { color: statusColor }]}>
          {herd.status.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AnimalsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'sold' | 'archived'>('all');

  const { data: herds, isLoading, refetch } = useQuery({
    queryKey: ['herds'],
    queryFn: () => getHerds(),
  });

  const filtered = (herds ?? []).filter((h) => {
    const q = search.toLowerCase();
    const matchesSearch =
      h.name.toLowerCase().includes(q) ||
      h.breed.toLowerCase().includes(q) ||
      ANIMAL_LABELS[h.animalType]?.toLowerCase().includes(q) ||
      h.location?.toLowerCase().includes(q);
    const matchesFilter = filter === 'all' || h.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>🐾 {t('nav.animals')}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/(app)/animals/new' as any)}
        >
          <Ionicons name="add" size={20} color={Colors.white} />
          <Text style={styles.addText}>{t('animals.newHerd')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('animals.searchHerds')}
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={Colors.textLight}
        />
      </View>

      <View style={styles.filterRow}>
        {(['all', 'active', 'sold', 'archived'] as const).map((f) => {
          const label = f === 'all' ? t('common.all')
            : f === 'active'   ? t('animals.status.active')
            : f === 'sold'     ? t('animals.status.sold')
            : t('animals.status.archived');
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterActiveText]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(h) => h._id}
          renderItem={({ item }) => <HerdCard herd={item} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refetch} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🐾</Text>
              <Text style={styles.emptyTitle}>
                {herds?.length === 0 ? t('animals.noHerds') : t('animals.noResults')}
              </Text>
              <Text style={styles.emptyText}>
                {herds?.length === 0
                  ? t('animals.noHerdsPrompt')
                  : t('animals.adjustSearch')}
              </Text>
              {herds?.length === 0 && (
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => router.push('/(app)/animals/new' as any)}
                >
                  <Text style={styles.emptyBtnText}>{t('animals.addFirstHerd')}</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  title:          { fontSize: 22, fontWeight: '800', color: Colors.text },
  addBtn:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#d97706', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 20, gap: 4 },
  addText:        { color: Colors.white, fontWeight: '600', fontSize: 14 },
  searchWrap:     { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, marginHorizontal: Spacing.base, marginBottom: Spacing.sm, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md },
  searchIcon:     { marginRight: Spacing.sm },
  searchInput:    { flex: 1, fontSize: 15, color: Colors.text, paddingVertical: Spacing.md - 2 },
  filterRow:      { flexDirection: 'row', paddingHorizontal: Spacing.base, gap: Spacing.sm, marginBottom: Spacing.md },
  filterBtn:      { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  filterActive:   { borderColor: '#d97706', backgroundColor: '#fef3c7' },
  filterText:     { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  filterActiveText: { color: '#d97706' },
  list:           { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText:    { color: Colors.textMuted },
  card:           { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, marginBottom: Spacing.md, ...Shadow.sm },
  cardHeader:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  emojiBox:       { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center' },
  emoji:          { fontSize: 22 },
  cardInfo:       { flex: 1 },
  cardName:       { fontSize: 15, fontWeight: '700', color: Colors.text },
  cardType:       { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  statusDot:      { width: 8, height: 8, borderRadius: 4 },
  cardMeta:       { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.sm },
  metaItem:       { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:       { fontSize: 12, color: Colors.textMuted },
  cardFooter:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.sm },
  herdCode:       { fontSize: 11, fontFamily: 'monospace', color: Colors.textLight },
  statusBadge:    { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  empty:          { alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.xl },
  emptyEmoji:     { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle:     { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  emptyText:      { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.lg },
  emptyBtn:       { backgroundColor: '#d97706', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: 20 },
  emptyBtnText:   { color: Colors.white, fontWeight: '700' },
});
