import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Colors, Spacing } from '@/constants/colors';
import { BASE_URL } from '@/lib/api/client';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface Props {
  plotId?: string;
  type?: 'report' | 'backup';
  variant?: 'icon' | 'button';
}

export default function ReportButton({ plotId, type = 'report', variant = 'icon' }: Props) {
  const [loading, setLoading] = useState(false);

  async function downloadAndShare() {
    setLoading(true);
    try {
      const token = Platform.OS === 'web'
        ? localStorage.getItem('shamba_pro_token')
        : await SecureStore.getItemAsync('shamba_pro_token');
      const now = new Date().toISOString().slice(0, 10);

      let url: string;
      let filename: string;
      let mimeType: string;
      let dialogTitle: string;
      let UTI: string;

      if (type === 'backup') {
        url = `${BASE_URL}/api/backup`;
        filename = `Farm_Backup_${now}.json`;
        mimeType = 'application/json';
        dialogTitle = 'Farm Data Backup';
        UTI = 'public.json';
      } else {
        url = plotId
          ? `${BASE_URL}/api/reports/expenditure?plotId=${plotId}`
          : `${BASE_URL}/api/reports/expenditure`;
        filename = plotId
          ? `Expenditure_Report_${now}.pdf`
          : `Farm_Expenditure_Report_${now}.pdf`;
        mimeType = 'application/pdf';
        dialogTitle = 'Expenditure Report';
        UTI = 'com.adobe.pdf';
      }

      const dest = `${FileSystem.cacheDirectory}${filename}`;
      const result = await FileSystem.downloadAsync(url, dest, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (result.status !== 200) {
        throw new Error(type === 'backup' ? 'Backup failed' : 'Report generation failed');
      }

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Not supported', 'Sharing is not available on this device.');
        return;
      }

      await Sharing.shareAsync(result.uri, { mimeType, dialogTitle, UTI });
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  const iconName = type === 'backup' ? 'cloud-download-outline' : 'document-text-outline';
  const label = type === 'backup' ? 'Download Backup' : 'Expenditure Report';
  const loadingLabel = type === 'backup' ? 'Backing up…' : 'Generating…';

  if (variant === 'button') {
    return (
      <TouchableOpacity
        style={styles.button}
        onPress={downloadAndShare}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Ionicons name={iconName} size={16} color={Colors.primary} />
        )}
        <Text style={styles.buttonText}>
          {loading ? loadingLabel : label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.iconBtn}
      onPress={downloadAndShare}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={Colors.textMuted} />
      ) : (
        <Ionicons name={iconName} size={20} color={Colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
  },
});
