import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, RefreshControl, Modal, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getHerd, createVaccination, createAnimalProduction,
  createHealthEvent, createAnimalExpense,
  CreateVaccinationPayload, CreateProductionPayload,
  CreateHealthEventPayload, CreateAnimalExpensePayload,
} from '@/lib/api/animals';
import {
  ANIMAL_LABELS, ANIMAL_EMOJI, ANIMAL_PURPOSE_LABELS,
  COMMON_VACCINES, ANIMAL_PRODUCTION_TYPES, HEALTH_EVENT_TYPES, ANIMAL_EXPENSE_CATEGORIES,
} from '@/constants/animals';
import { AnimalType, Vaccination, AnimalProduction, AnimalHealth, Expense } from '@/types';
import { Colors, Spacing, Radius, Shadow } from '@/constants/colors';

const fmt = (n: number) => `KSH ${n.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

type Tab = 'overview' | 'vaccinations' | 'production' | 'health' | 'expenses';

// ---------- Mini modal helpers ----------

function useModal() {
  const [open, setOpen] = useState(false);
  return { open, show: () => setOpen(true), hide: () => setOpen(false) };
}

function ModalWrap({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={ms.container}>
        <View style={ms.header}>
          <Text style={ms.title}>{title}</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={Colors.text} /></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={ms.body} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </View>
    </Modal>
  );
}

function Field({ label, value, onChange, placeholder, keyboardType = 'default', multiline = false }: any) {
  return (
    <View style={ms.field}>
      <Text style={ms.fieldLabel}>{label}</Text>
      <TextInput
        style={[ms.input, multiline && ms.textarea]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );
}

function ChipPicker({ label, options, value, onChange }: { label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={ms.field}>
      <Text style={ms.fieldLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
          {options.map((o) => (
            <TouchableOpacity key={o.value} style={[ms.chip, value === o.value && ms.chipActive]} onPress={() => onChange(o.value)}>
              <Text style={[ms.chipText, value === o.value && ms.chipActiveText]}>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ---------- Main component ----------

export default function AnimalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('overview');

  const vaccModal = useModal();
  const prodModal = useModal();
  const healthModal = useModal();
  const expModal = useModal();

  // Vaccination form state
  const [vVaccineName, setVVaccineName] = useState('');
  const [vDate, setVDate] = useState(new Date().toISOString().split('T')[0]);
  const [vNextDue, setVNextDue] = useState('');
  const [vCount, setVCount] = useState('');
  const [vCost, setVCost] = useState('');
  const [vAdmin, setVAdmin] = useState('');
  const [vNotes, setVNotes] = useState('');

  // Production form state
  const [pType, setPType] = useState('');
  const [pQty, setPQty] = useState('');
  const [pUnit, setPUnit] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pDate, setPDate] = useState(new Date().toISOString().split('T')[0]);
  const [pBuyer, setPBuyer] = useState('');

  // Health form state
  const [hType, setHType] = useState('');
  const [hDesc, setHDesc] = useState('');
  const [hDate, setHDate] = useState(new Date().toISOString().split('T')[0]);
  const [hCount, setHCount] = useState('');
  const [hCost, setHCost] = useState('');
  const [hVet, setHVet] = useState('');

  // Expense form state
  const [eCat, setECat] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [eAmount, setEAmount] = useState('');
  const [eDate, setEDate] = useState(new Date().toISOString().split('T')[0]);
  const [eQty, setEQty] = useState('');
  const [eUnit, setEUnit] = useState('');

  const [saving, setSaving] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['herd', id],
    queryFn: () => getHerd(id),
  });

  const herd = data?.herd;
  const animalType = (herd?.animalType ?? 'other') as AnimalType;

  const prodTypes = ANIMAL_PRODUCTION_TYPES[animalType] ?? [];
  const currentProdUnits = prodTypes.find((p) => p.value === pType)?.units ?? ['kg', 'units'];
  const expCategories = ANIMAL_EXPENSE_CATEGORIES[animalType] ?? ANIMAL_EXPENSE_CATEGORIES.other;
  const vaccines = COMMON_VACCINES[animalType] ?? ['Other'];

  async function saveVaccination() {
    if (!vVaccineName) return Alert.alert('Error', 'Vaccine name is required.');
    setSaving(true);
    try {
      const payload: CreateVaccinationPayload = {
        herdId: id, vaccineName: vVaccineName, dateAdministered: vDate,
        nextDueDate: vNextDue || undefined,
        animalsVaccinated: vCount ? parseInt(vCount) : undefined,
        cost: vCost ? parseFloat(vCost) : undefined,
        administrator: vAdmin || undefined,
        notes: vNotes || undefined,
      };
      await createVaccination(payload);
      qc.invalidateQueries({ queryKey: ['herd', id] });
      vaccModal.hide();
      setVVaccineName(''); setVDate(new Date().toISOString().split('T')[0]); setVNextDue(''); setVCount(''); setVCost(''); setVAdmin(''); setVNotes('');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed');
    } finally { setSaving(false); }
  }

  async function saveProduction() {
    if (!pType || !pQty || !pPrice) return Alert.alert('Error', 'Type, quantity and price are required.');
    setSaving(true);
    try {
      const payload: CreateProductionPayload = {
        herdId: id, productionType: pType, quantity: parseFloat(pQty),
        unit: pUnit || currentProdUnits[0], pricePerUnit: parseFloat(pPrice),
        date: pDate || undefined, buyer: pBuyer || undefined,
      };
      await createAnimalProduction(payload);
      qc.invalidateQueries({ queryKey: ['herd', id] });
      prodModal.hide();
      setPType(''); setPQty(''); setPUnit(''); setPPrice(''); setPBuyer('');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed');
    } finally { setSaving(false); }
  }

  async function saveHealth() {
    if (!hType || !hDesc) return Alert.alert('Error', 'Event type and description are required.');
    setSaving(true);
    try {
      let countChange: number | undefined;
      if ((hType === 'birth' || hType === 'purchase') && hCount) countChange = parseInt(hCount);
      if ((hType === 'death' || hType === 'sale') && hCount) countChange = -parseInt(hCount);
      const payload: CreateHealthEventPayload = {
        herdId: id, eventType: hType, description: hDesc, date: hDate || undefined,
        affectedCount: hCount ? parseInt(hCount) : undefined,
        countChange,
        cost: hCost ? parseFloat(hCost) : undefined,
        veterinarian: hVet || undefined,
      };
      await createHealthEvent(payload);
      qc.invalidateQueries({ queryKey: ['herd', id] });
      healthModal.hide();
      setHType(''); setHDesc(''); setHCount(''); setHCost(''); setHVet('');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed');
    } finally { setSaving(false); }
  }

  async function saveExpense() {
    if (!eCat || !eDesc || !eAmount) return Alert.alert('Error', 'Category, description and amount are required.');
    setSaving(true);
    try {
      const payload: CreateAnimalExpensePayload = {
        herdId: id, category: eCat, description: eDesc, amount: parseFloat(eAmount),
        date: eDate || undefined,
        quantity: eQty ? parseFloat(eQty) : undefined,
        unit: eUnit || undefined,
      };
      await createAnimalExpense(payload);
      qc.invalidateQueries({ queryKey: ['herd', id] });
      expModal.hide();
      setECat(''); setEDesc(''); setEAmount(''); setEQty(''); setEUnit('');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed');
    } finally { setSaving(false); }
  }

  if (isLoading || !herd) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Loading…</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={s.center}><Text style={s.loadingText}>Loading herd data…</Text></View>
      </View>
    );
  }

  const summary = data?.summary ?? { totalExpenses: 0, totalRevenue: 0, profit: 0 };

  const today = new Date();
  const upcomingVacc = (data?.vaccinations ?? []).filter((v: Vaccination) =>
    v.nextDueDate && new Date(v.nextDueDate) >= today && new Date(v.nextDueDate) <= new Date(today.getTime() + 30 * 86400000)
  );

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview',     label: 'Overview',      icon: 'grid-outline' },
    { key: 'vaccinations', label: 'Vaccines',       icon: 'medical-outline' },
    { key: 'production',   label: 'Production',     icon: 'egg-outline' },
    { key: 'health',       label: 'Health',         icon: 'heart-outline' },
    { key: 'expenses',     label: 'Expenses',       icon: 'receipt-outline' },
  ];

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerEmoji}>{ANIMAL_EMOJI[animalType]}</Text>
          <View>
            <Text style={s.headerTitle} numberOfLines={1}>{herd.name}</Text>
            <Text style={s.headerSub}>{ANIMAL_LABELS[animalType]} · {herd.breed}</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Upcoming vaccination alert */}
      {upcomingVacc.length > 0 && (
        <View style={s.alert}>
          <Ionicons name="warning-outline" size={16} color="#d97706" />
          <Text style={s.alertText}>{upcomingVacc.length} vaccination{upcomingVacc.length > 1 ? 's' : ''} due in 30 days</Text>
        </View>
      )}

      {/* KPIs */}
      <View style={s.kpiRow}>
        <View style={s.kpi}><Text style={s.kpiVal}>{herd.currentCount}</Text><Text style={s.kpiLabel}>Animals</Text></View>
        <View style={s.kpi}><Text style={[s.kpiVal, { color: Colors.danger }]}>{fmt(summary.totalExpenses)}</Text><Text style={s.kpiLabel}>Expenses</Text></View>
        <View style={s.kpi}><Text style={[s.kpiVal, { color: Colors.success }]}>{fmt(summary.totalRevenue)}</Text><Text style={s.kpiLabel}>Revenue</Text></View>
        <View style={s.kpi}>
          <Text style={[s.kpiVal, { color: summary.profit >= 0 ? Colors.success : Colors.danger }]}>
            {summary.profit >= 0 ? '+' : ''}{fmt(summary.profit)}
          </Text>
          <Text style={s.kpiLabel}>Profit</Text>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabBar}>
        <View style={s.tabInner}>
          {tabs.map((t) => (
            <TouchableOpacity key={t.key} style={[s.tabBtn, tab === t.key && s.tabActive]} onPress={() => setTab(t.key)}>
              <Ionicons name={t.icon as any} size={14} color={tab === t.key ? '#d97706' : Colors.textMuted} />
              <Text style={[s.tabText, tab === t.key && s.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={Colors.primary} />}
      >

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <View>
            <View style={s.infoCard}>
              <Text style={s.cardTitle}>Herd Details</Text>
              {[
                { label: 'Purpose', value: ANIMAL_PURPOSE_LABELS[herd.purpose] ?? herd.purpose },
                { label: 'Acquired', value: fmtDate(herd.acquisitionDate) },
                herd.location && { label: 'Location', value: herd.location },
                herd.housingType && { label: 'Housing', value: herd.housingType },
                herd.acquisitionCost && { label: 'Acquisition Cost', value: fmt(herd.acquisitionCost) },
              ].filter(Boolean).map((item: any, i) => (
                <View key={i} style={s.infoRow}>
                  <Text style={s.infoLabel}>{item.label}</Text>
                  <Text style={s.infoValue}>{item.value}</Text>
                </View>
              ))}
              {herd.notes && <Text style={s.notesText}>{herd.notes}</Text>}
            </View>

            <View style={s.infoCard}>
              <Text style={s.cardTitle}>Activity Summary</Text>
              {[
                { label: 'Vaccination records', value: data?.vaccinations.length ?? 0 },
                { label: 'Production records',  value: data?.productions.length ?? 0 },
                { label: 'Health events',        value: data?.healthEvents.length ?? 0 },
                { label: 'Expense records',      value: data?.expenses.length ?? 0 },
              ].map((item) => (
                <View key={item.label} style={s.infoRow}>
                  <Text style={s.infoLabel}>{item.label}</Text>
                  <Text style={[s.infoValue, { fontWeight: '700' }]}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* VACCINATIONS */}
        {tab === 'vaccinations' && (
          <View>
            <TouchableOpacity style={s.addRowBtn} onPress={vaccModal.show}>
              <Ionicons name="add-circle-outline" size={18} color="#d97706" />
              <Text style={s.addRowText}>Record Vaccination</Text>
            </TouchableOpacity>
            {(data?.vaccinations ?? []).length === 0 ? (
              <Text style={s.emptyMsg}>No vaccination records yet.</Text>
            ) : (
              (data?.vaccinations ?? []).map((v: Vaccination) => (
                <View key={v._id} style={s.listItem}>
                  <View style={s.listLeft}>
                    <Text style={s.listTitle}>{v.vaccineName}</Text>
                    <Text style={s.listSub}>Given: {fmtDate(v.dateAdministered)}</Text>
                    {v.nextDueDate && (
                      <Text style={[s.listSub, { color: new Date(v.nextDueDate) < today ? Colors.danger : '#d97706' }]}>
                        Due: {fmtDate(v.nextDueDate)}
                      </Text>
                    )}
                    {v.animalsVaccinated ? <Text style={s.listSub}>{v.animalsVaccinated} animals</Text> : null}
                    {v.administrator ? <Text style={s.listSub}>By: {v.administrator}</Text> : null}
                  </View>
                  {v.cost ? <Text style={s.listAmount}>{fmt(v.cost)}</Text> : null}
                </View>
              ))
            )}
          </View>
        )}

        {/* PRODUCTION */}
        {tab === 'production' && (
          <View>
            <TouchableOpacity style={s.addRowBtn} onPress={prodModal.show}>
              <Ionicons name="add-circle-outline" size={18} color={Colors.success} />
              <Text style={[s.addRowText, { color: Colors.success }]}>Record Production / Sale</Text>
            </TouchableOpacity>
            {(data?.productions ?? []).length === 0 ? (
              <Text style={s.emptyMsg}>No production records yet.</Text>
            ) : (
              (data?.productions ?? []).map((p: AnimalProduction) => (
                <View key={p._id} style={s.listItem}>
                  <View style={s.listLeft}>
                    <Text style={[s.listTitle, { textTransform: 'capitalize' }]}>{p.productionType}</Text>
                    <Text style={s.listSub}>{fmtDate(p.date)} · {p.quantity} {p.unit}</Text>
                    {p.buyer ? <Text style={s.listSub}>→ {p.buyer}</Text> : null}
                  </View>
                  <Text style={[s.listAmount, { color: Colors.success }]}>{fmt(p.totalRevenue)}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* HEALTH */}
        {tab === 'health' && (
          <View>
            <TouchableOpacity style={s.addRowBtn} onPress={healthModal.show}>
              <Ionicons name="add-circle-outline" size={18} color={Colors.danger} />
              <Text style={[s.addRowText, { color: Colors.danger }]}>Add Health Event</Text>
            </TouchableOpacity>
            {(data?.healthEvents ?? []).length === 0 ? (
              <Text style={s.emptyMsg}>No health events recorded.</Text>
            ) : (
              (data?.healthEvents ?? []).map((ev: AnimalHealth) => (
                <View key={ev._id} style={s.listItem}>
                  <View style={s.listLeft}>
                    <View style={s.badge}><Text style={s.badgeText}>{ev.eventType.replace('_', ' ')}</Text></View>
                    <Text style={s.listTitle}>{ev.description}</Text>
                    <Text style={s.listSub}>{fmtDate(ev.date)}</Text>
                    {ev.affectedCount ? <Text style={s.listSub}>{ev.affectedCount} animals</Text> : null}
                    {ev.veterinarian ? <Text style={s.listSub}>Vet: {ev.veterinarian}</Text> : null}
                  </View>
                  {ev.cost ? <Text style={[s.listAmount, { color: Colors.danger }]}>{fmt(ev.cost)}</Text> : null}
                </View>
              ))
            )}
          </View>
        )}

        {/* EXPENSES */}
        {tab === 'expenses' && (
          <View>
            <TouchableOpacity style={s.addRowBtn} onPress={expModal.show}>
              <Ionicons name="add-circle-outline" size={18} color={Colors.textSecondary} />
              <Text style={[s.addRowText, { color: Colors.textSecondary }]}>Add Expense</Text>
            </TouchableOpacity>
            {(data?.expenses ?? []).length === 0 ? (
              <Text style={s.emptyMsg}>No expenses recorded.</Text>
            ) : (
              (data?.expenses ?? []).map((e: Expense) => (
                <View key={e._id} style={s.listItem}>
                  <View style={s.listLeft}>
                    <Text style={s.listTitle}>{e.description}</Text>
                    <Text style={s.listSub}>{fmtDate(e.date)} · {e.category.replace(/_/g, ' ')}</Text>
                    {e.quantity ? <Text style={s.listSub}>{e.quantity} {e.unit}</Text> : null}
                  </View>
                  <Text style={[s.listAmount, { color: Colors.danger }]}>{fmt(e.amount)}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Vaccination Modal */}
      <ModalWrap visible={vaccModal.open} onClose={vaccModal.hide} title="Record Vaccination">
        <ChipPicker label="Vaccine *" options={vaccines.map((v) => ({ value: v, label: v }))} value={vVaccineName} onChange={setVVaccineName} />
        <Field label="Date Given *" value={vDate} onChange={setVDate} placeholder="YYYY-MM-DD" />
        <Field label="Next Due Date" value={vNextDue} onChange={setVNextDue} placeholder="YYYY-MM-DD" />
        <Field label="Animals Vaccinated" value={vCount} onChange={setVCount} placeholder="e.g. 500" keyboardType="numeric" />
        <Field label="Cost (KSH)" value={vCost} onChange={setVCost} placeholder="0.00" keyboardType="decimal-pad" />
        <Field label="Administrator" value={vAdmin} onChange={setVAdmin} placeholder="Vet or self" />
        <Field label="Notes" value={vNotes} onChange={setVNotes} placeholder="Any observations…" multiline />
        <TouchableOpacity style={[ms.saveBtn, saving && ms.saveBtnDisabled]} onPress={saveVaccination} disabled={saving}>
          <Text style={ms.saveBtnText}>{saving ? 'Saving…' : 'Record Vaccination'}</Text>
        </TouchableOpacity>
      </ModalWrap>

      {/* Production Modal */}
      <ModalWrap visible={prodModal.open} onClose={prodModal.hide} title="Record Production">
        <ChipPicker label="Production Type *" options={prodTypes.map((p) => ({ value: p.value, label: p.label }))} value={pType} onChange={(v) => { setPType(v); setPUnit(''); }} />
        <Field label="Quantity *" value={pQty} onChange={setPQty} placeholder="e.g. 10" keyboardType="decimal-pad" />
        <ChipPicker label="Unit *" options={currentProdUnits.map((u) => ({ value: u, label: u }))} value={pUnit} onChange={setPUnit} />
        <Field label="Price Per Unit (KSH) *" value={pPrice} onChange={setPPrice} placeholder="0.00" keyboardType="decimal-pad" />
        <Field label="Date" value={pDate} onChange={setPDate} placeholder="YYYY-MM-DD" />
        <Field label="Buyer" value={pBuyer} onChange={setPBuyer} placeholder="e.g. Local market" />
        <TouchableOpacity style={[ms.saveBtn, { backgroundColor: Colors.success }, saving && ms.saveBtnDisabled]} onPress={saveProduction} disabled={saving}>
          <Text style={ms.saveBtnText}>{saving ? 'Saving…' : 'Record Production'}</Text>
        </TouchableOpacity>
      </ModalWrap>

      {/* Health Modal */}
      <ModalWrap visible={healthModal.open} onClose={healthModal.hide} title="Add Health Event">
        <ChipPicker label="Event Type *" options={HEALTH_EVENT_TYPES} value={hType} onChange={setHType} />
        <Field label="Description *" value={hDesc} onChange={setHDesc} placeholder="Describe the event…" multiline />
        <Field label="Date" value={hDate} onChange={setHDate} placeholder="YYYY-MM-DD" />
        <Field label="Animals Affected" value={hCount} onChange={setHCount} placeholder="e.g. 5" keyboardType="numeric" />
        <Field label="Cost (KSH)" value={hCost} onChange={setHCost} placeholder="0.00" keyboardType="decimal-pad" />
        <Field label="Veterinarian" value={hVet} onChange={setHVet} placeholder="Dr. name or clinic" />
        <TouchableOpacity style={[ms.saveBtn, { backgroundColor: Colors.danger }, saving && ms.saveBtnDisabled]} onPress={saveHealth} disabled={saving}>
          <Text style={ms.saveBtnText}>{saving ? 'Saving…' : 'Record Event'}</Text>
        </TouchableOpacity>
      </ModalWrap>

      {/* Expense Modal */}
      <ModalWrap visible={expModal.open} onClose={expModal.hide} title="Add Expense">
        <ChipPicker label="Category *" options={expCategories.map((c) => ({ value: c.value, label: c.label }))} value={eCat} onChange={setECat} />
        <Field label="Description *" value={eDesc} onChange={setEDesc} placeholder="e.g. Layer mash — 10 bags" />
        <Field label="Amount (KSH) *" value={eAmount} onChange={setEAmount} placeholder="0.00" keyboardType="decimal-pad" />
        <Field label="Date" value={eDate} onChange={setEDate} placeholder="YYYY-MM-DD" />
        <Field label="Quantity" value={eQty} onChange={setEQty} placeholder="e.g. 10" keyboardType="decimal-pad" />
        <Field label="Unit" value={eUnit} onChange={setEUnit} placeholder="e.g. bags, liters" />
        <TouchableOpacity style={[ms.saveBtn, { backgroundColor: Colors.textSecondary }, saving && ms.saveBtnDisabled]} onPress={saveExpense} disabled={saving}>
          <Text style={ms.saveBtnText}>{saving ? 'Saving…' : 'Record Expense'}</Text>
        </TouchableOpacity>
      </ModalWrap>
    </View>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.background },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface, gap: Spacing.sm },
  backBtn:         { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter:    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerEmoji:     { fontSize: 24 },
  headerTitle:     { fontSize: 16, fontWeight: '700', color: Colors.text },
  headerSub:       { fontSize: 12, color: Colors.textMuted },
  alert:           { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef3c7', paddingHorizontal: Spacing.base, paddingVertical: 8 },
  alertText:       { fontSize: 13, color: '#d97706', fontWeight: '600' },
  kpiRow:          { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  kpi:             { flex: 1, alignItems: 'center', paddingVertical: 10 },
  kpiVal:          { fontSize: 13, fontWeight: '700', color: Colors.text },
  kpiLabel:        { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  tabBar:          { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, maxHeight: 44 },
  tabInner:        { flexDirection: 'row', paddingHorizontal: Spacing.base, alignItems: 'center' },
  tabBtn:          { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:       { borderBottomColor: '#d97706' },
  tabText:         { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  tabTextActive:   { color: '#d97706', fontWeight: '700' },
  scroll:          { flex: 1 },
  scrollContent:   { padding: Spacing.base, paddingBottom: 40 },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText:     { color: Colors.textMuted },
  infoCard:        { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.base, marginBottom: Spacing.md, ...Shadow.sm },
  cardTitle:       { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  infoRow:         { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  infoLabel:       { fontSize: 13, color: Colors.textMuted },
  infoValue:       { fontSize: 13, color: Colors.text, fontWeight: '500' },
  notesText:       { fontSize: 13, color: Colors.textMuted, marginTop: 8, fontStyle: 'italic' },
  addRowBtn:       { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm },
  addRowText:      { fontSize: 14, fontWeight: '600', color: '#d97706' },
  emptyMsg:        { textAlign: 'center', color: Colors.textMuted, paddingVertical: 32 },
  listItem:        { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start', gap: 8, ...Shadow.sm },
  listLeft:        { flex: 1 },
  listTitle:       { fontSize: 14, fontWeight: '600', color: Colors.text },
  listSub:         { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  listAmount:      { fontSize: 14, fontWeight: '700', color: Colors.text, marginTop: 2 },
  badge:           { alignSelf: 'flex-start', backgroundColor: Colors.surfaceSecondary, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4 },
  badgeText:       { fontSize: 11, fontWeight: '600', color: Colors.textMuted, textTransform: 'capitalize' },
});

const ms = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.background },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  title:           { fontSize: 17, fontWeight: '700', color: Colors.text },
  body:            { padding: Spacing.base, paddingBottom: 40 },
  field:           { marginBottom: Spacing.md },
  fieldLabel:      { fontSize: 12, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input:           { backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: 15, color: Colors.text },
  textarea:        { height: 80, textAlignVertical: 'top' },
  chip:            { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  chipActive:      { borderColor: '#d97706', backgroundColor: '#fef3c7' },
  chipText:        { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  chipActiveText:  { color: '#d97706', fontWeight: '700' },
  saveBtn:         { backgroundColor: '#d97706', borderRadius: Radius.lg, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.md },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText:     { color: Colors.white, fontWeight: '700', fontSize: 16 },
});
