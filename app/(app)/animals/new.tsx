import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { createHerd, CreateHerdPayload } from '@/lib/api/animals';
import { ANIMAL_TYPES, ANIMAL_LABELS, ANIMAL_EMOJI, ANIMAL_BREEDS, ANIMAL_PURPOSES, ANIMAL_PURPOSE_LABELS } from '@/constants/animals';
import { AnimalType } from '@/types';
import { Colors, Spacing, Radius } from '@/constants/colors';

export default function NewAnimalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [animalType, setAnimalType] = useState<AnimalType>('poultry');
  const [breed, setBreed] = useState('');
  const [purpose, setPurpose] = useState('');
  const [name, setName] = useState('');
  const [initialCount, setInitialCount] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState(new Date().toISOString().split('T')[0]);
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [housingType, setHousingType] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  async function handleSubmit() {
    if (!name.trim()) return Alert.alert('Error', 'Herd name is required.');
    if (!breed) return Alert.alert('Error', 'Please select a breed.');
    if (!purpose) return Alert.alert('Error', 'Please select a purpose.');
    if (!initialCount || parseInt(initialCount) < 1) return Alert.alert('Error', 'Initial count must be at least 1.');
    setLoading(true);
    try {
      const payload: CreateHerdPayload = {
        name: name.trim(), animalType, breed, purpose,
        initialCount: parseInt(initialCount),
        acquisitionDate,
        acquisitionCost: acquisitionCost ? parseFloat(acquisitionCost) : undefined,
        housingType: housingType.trim() || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      };
      const herd = await createHerd(payload);
      qc.invalidateQueries({ queryKey: ['herds'] });
      router.replace(`/(app)/animals/${herd._id}` as any);
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create herd');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>New Herd</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        {/* Animal Type */}
        <Text style={s.label}>Animal Type *</Text>
        <View style={s.typeGrid}>
          {ANIMAL_TYPES.map((at) => (
            <TouchableOpacity key={at} style={[s.typeBtn, animalType === at && s.typeBtnActive]}
              onPress={() => { setAnimalType(at); setBreed(''); setPurpose(''); }}>
              <Text style={s.typeEmoji}>{ANIMAL_EMOJI[at]}</Text>
              <Text style={[s.typeText, animalType === at && s.typeTextActive]}>{ANIMAL_LABELS[at]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Name *</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder="e.g. Layer Flock A" placeholderTextColor={Colors.textLight} />

        <Text style={s.label}>Breed *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
          <View style={s.chipRow}>
            {ANIMAL_BREEDS[animalType].map((b) => (
              <TouchableOpacity key={b} style={[s.chip, breed === b && s.chipActive]} onPress={() => setBreed(b)}>
                <Text style={[s.chipText, breed === b && s.chipActiveText]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={s.label}>Purpose *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
          <View style={s.chipRow}>
            {ANIMAL_PURPOSES[animalType].map((p) => (
              <TouchableOpacity key={p} style={[s.chip, purpose === p && s.chipActive]} onPress={() => setPurpose(p)}>
                <Text style={[s.chipText, purpose === p && s.chipActiveText]}>{ANIMAL_PURPOSE_LABELS[p] ?? p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={s.row}>
          <View style={s.half}>
            <Text style={s.label}>Initial Count *</Text>
            <TextInput style={s.input} value={initialCount} onChangeText={setInitialCount} placeholder="e.g. 500" keyboardType="numeric" placeholderTextColor={Colors.textLight} />
          </View>
          <View style={s.half}>
            <Text style={s.label}>Acquisition Date</Text>
            <TextInput style={s.input} value={acquisitionDate} onChangeText={setAcquisitionDate} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textLight} />
          </View>
        </View>

        <View style={s.row}>
          <View style={s.half}>
            <Text style={s.label}>Cost (KSH)</Text>
            <TextInput style={s.input} value={acquisitionCost} onChangeText={setAcquisitionCost} placeholder="0.00" keyboardType="decimal-pad" placeholderTextColor={Colors.textLight} />
          </View>
          <View style={s.half}>
            <Text style={s.label}>Housing Type</Text>
            <TextInput style={s.input} value={housingType} onChangeText={setHousingType} placeholder="e.g. Deep litter" placeholderTextColor={Colors.textLight} />
          </View>
        </View>

        <Text style={s.label}>Location</Text>
        <TextInput style={s.input} value={location} onChangeText={setLocation} placeholder="e.g. Unit 1" placeholderTextColor={Colors.textLight} />

        <Text style={s.label}>Notes</Text>
        <TextInput style={[s.input, s.textarea]} value={notes} onChangeText={setNotes} placeholder="Any notes…" placeholderTextColor={Colors.textLight} multiline numberOfLines={3} />

        <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleSubmit} disabled={loading}>
          <Text style={s.btnText}>{loading ? 'Creating…' : 'Create Herd'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  backBtn:        { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title:          { fontSize: 17, fontWeight: '700', color: Colors.text },
  content:        { padding: Spacing.base, paddingBottom: 40 },
  label:          { fontSize: 12, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: Spacing.md },
  input:          { backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: 15, color: Colors.text },
  textarea:       { height: 80, textAlignVertical: 'top' },
  row:            { flexDirection: 'row', gap: Spacing.md },
  half:           { flex: 1 },
  typeGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  typeBtn:        { alignItems: 'center', padding: 10, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface, minWidth: 70 },
  typeBtnActive:  { borderColor: '#d97706', backgroundColor: '#fef3c7' },
  typeEmoji:      { fontSize: 20, marginBottom: 2 },
  typeText:       { fontSize: 10, fontWeight: '600', color: Colors.textMuted, textAlign: 'center' },
  typeTextActive: { color: '#d97706' },
  chipScroll:     { marginLeft: -Spacing.base, marginRight: -Spacing.base },
  chipRow:        { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.base, paddingVertical: 4 },
  chip:           { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  chipActive:     { borderColor: '#d97706', backgroundColor: '#fef3c7' },
  chipText:       { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  chipActiveText: { color: '#d97706', fontWeight: '700' },
  btn:            { backgroundColor: '#d97706', borderRadius: Radius.lg, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.lg },
  btnDisabled:    { opacity: 0.6 },
  btnText:        { color: Colors.white, fontWeight: '700', fontSize: 16 },
});
