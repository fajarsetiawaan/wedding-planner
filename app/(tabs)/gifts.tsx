import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useWedding, Gift } from '@/lib/wedding-context';
import Colors from '@/constants/colors';

function GiftCard({ gift, onPress, onToggleThankYou }: { gift: Gift; onPress: () => void; onToggleThankYou: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.giftCard, pressed && { opacity: 0.9 }]}
      onPress={onPress}
    >
      <View style={styles.giftIcon}>
        <Ionicons name="gift-outline" size={20} color={Colors.rose} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.giftDescription} numberOfLines={1}>{gift.description}</Text>
        <Text style={styles.giftFrom}>from {gift.guestName}</Text>
        {gift.estimatedValue ? (
          <Text style={styles.giftValue}>${gift.estimatedValue}</Text>
        ) : null}
      </View>
      <View style={styles.giftActions}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggleThankYou();
          }}
          style={[styles.thankYouButton, gift.thankYouSent && styles.thankYouSent]}
        >
          <Ionicons
            name={gift.thankYouSent ? 'checkmark-circle' : 'mail-outline'}
            size={18}
            color={gift.thankYouSent ? Colors.sage : Colors.warmGray}
          />
          <Text style={[styles.thankYouText, gift.thankYouSent && { color: Colors.sage }]}>
            {gift.thankYouSent ? 'Sent' : 'Send'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function GiftsScreen() {
  const insets = useSafeAreaInsets();
  const { gifts, addGift, updateGift, deleteGift } = useWedding();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');

  const totalGifts = gifts.length;
  const thankYousSent = gifts.filter(g => g.thankYouSent).length;
  const pending = totalGifts - thankYousSent;

  const openEdit = (gift: Gift | null) => {
    if (gift) {
      setEditingId(gift.id);
      setGuestName(gift.guestName);
      setDescription(gift.description);
      setValue(gift.estimatedValue);
    } else {
      setEditingId(null);
      setGuestName('');
      setDescription('');
      setValue('');
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!description.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const data = {
      guestName: guestName.trim(),
      description: description.trim(),
      estimatedValue: value.trim(),
      thankYouSent: false,
      dateReceived: new Date().toISOString().split('T')[0],
    };
    if (editingId) {
      updateGift(editingId, data);
    } else {
      addGift(data);
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (editingId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      deleteGift(editingId);
      setShowModal(false);
    }
  };

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const ListHeader = () => (
    <View>
      <Text style={styles.pageTitle}>Gifts</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Ionicons name="gift" size={20} color={Colors.rose} />
          <Text style={styles.summaryNumber}>{totalGifts}</Text>
          <Text style={styles.summaryLabel}>Received</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.sage} />
          <Text style={styles.summaryNumber}>{thankYousSent}</Text>
          <Text style={styles.summaryLabel}>Thanked</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="time-outline" size={20} color={Colors.gold} />
          <Text style={styles.summaryNumber}>{pending}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
      </View>

      {pending > 0 && (
        <View style={styles.reminderCard}>
          <Ionicons name="notifications-outline" size={18} color={Colors.gold} />
          <Text style={styles.reminderText}>
            You have {pending} thank-you {pending === 1 ? 'note' : 'notes'} to send
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={gifts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <GiftCard
            gift={item}
            onPress={() => openEdit(item)}
            onToggleThankYou={() => updateGift(item.id, { thankYouSent: !item.thankYouSent })}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="gift-outline" size={40} color={Colors.roseLight} />
            <Text style={styles.emptyText}>No gifts logged yet</Text>
            <Text style={styles.emptyHint}>Tap + to record a gift</Text>
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: topInset + 16, paddingBottom: Platform.OS === 'web' ? 84 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!gifts.length}
      />

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9, transform: [{ scale: 0.95 }] }]}
        onPress={() => openEdit(null)}
      >
        <LinearGradient colors={[Colors.rose, Colors.roseDark]} style={styles.fabGradient}>
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 16 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editingId ? 'Edit Gift' : 'Log Gift'}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gift Description</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="e.g. Crystal vase set"
                placeholderTextColor={Colors.warmGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>From</Text>
              <TextInput
                style={styles.input}
                value={guestName}
                onChangeText={setGuestName}
                placeholder="Guest name"
                placeholderTextColor={Colors.warmGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Estimated Value (optional)</Text>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={setValue}
                placeholder="$0"
                placeholderTextColor={Colors.warmGray}
                keyboardType="numeric"
              />
            </View>

            <Pressable style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.85 }]} onPress={handleSave}>
              <LinearGradient colors={[Colors.gold, Colors.goldDark]} style={styles.saveButtonGradient}>
                <Text style={styles.saveButtonText}>Save</Text>
              </LinearGradient>
            </Pressable>

            {editingId && (
              <Pressable onPress={handleDelete} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Remove Gift</Text>
              </Pressable>
            )}

            <Pressable onPress={() => setShowModal(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  listContent: { paddingHorizontal: 20 },
  pageTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 28,
    color: Colors.charcoal,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.12)',
  },
  summaryNumber: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 22,
    color: Colors.charcoal,
  },
  summaryLabel: {
    fontFamily: 'Lora_400Regular',
    fontSize: 11,
    color: Colors.warmGray,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold + '12',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gold + '25',
  },
  reminderText: {
    fontFamily: 'Lora_400Regular',
    fontSize: 13,
    color: Colors.goldDark,
    flex: 1,
  },
  giftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.12)',
  },
  giftIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.roseLight + '50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftDescription: {
    fontFamily: 'Lora_500Medium',
    fontSize: 14,
    color: Colors.charcoal,
  },
  giftFrom: {
    fontFamily: 'Lora_400Regular',
    fontSize: 12,
    color: Colors.warmGray,
    marginTop: 2,
  },
  giftValue: {
    fontFamily: 'Lora_500Medium',
    fontSize: 12,
    color: Colors.gold,
    marginTop: 2,
  },
  giftActions: {},
  thankYouButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.15)',
  },
  thankYouSent: {
    backgroundColor: Colors.sage + '15',
    borderColor: Colors.sage + '30',
  },
  thankYouText: {
    fontFamily: 'Lora_400Regular',
    fontSize: 11,
    color: Colors.warmGray,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyText: {
    fontFamily: 'PlayfairDisplay_500Medium',
    fontSize: 16,
    color: Colors.charcoal,
  },
  emptyHint: {
    fontFamily: 'Lora_400Regular',
    fontSize: 13,
    color: Colors.warmGray,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'web' ? 100 : 100,
    borderRadius: 28,
    shadowColor: Colors.rose,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(44,44,46,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.ivory,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.lightGray,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 22,
    color: Colors.charcoal,
    textAlign: 'center',
    marginBottom: 18,
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontFamily: 'Lora_500Medium',
    fontSize: 13,
    color: Colors.charcoal,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.cream,
    borderRadius: 12,
    padding: 14,
    fontFamily: 'Lora_400Regular',
    fontSize: 15,
    color: Colors.charcoal,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.15)',
  },
  saveButton: {
    marginTop: 4,
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
  },
  saveButtonText: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  deleteButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 10,
  },
  deleteButtonText: {
    fontFamily: 'Lora_500Medium',
    fontSize: 14,
    color: Colors.error,
  },
  cancelButton: {
    marginTop: 4,
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelButtonText: {
    fontFamily: 'Lora_400Regular',
    fontSize: 14,
    color: Colors.warmGray,
  },
});
