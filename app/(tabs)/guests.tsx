import React, { useState, useMemo } from 'react';
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
import { useWedding, Guest } from '@/lib/wedding-context';
import Colors from '@/constants/colors';

const RSVP_COLORS = {
  confirmed: Colors.sage,
  pending: Colors.goldLight,
  declined: Colors.roseDark,
};

const RSVP_LABELS = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  declined: 'Declined',
};

function GuestCard({ guest, onPress }: { guest: Guest; onPress: () => void }) {
  const initials = guest.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Pressable
      style={({ pressed }) => [styles.guestCard, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
      onPress={onPress}
    >
      <View style={styles.guestAvatar}>
        <Text style={styles.guestInitials}>{initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.guestName}>{guest.name}</Text>
        <Text style={styles.guestDetail}>
          {guest.side === 'partner1' ? 'Side A' : guest.side === 'partner2' ? 'Side B' : 'Mutual'}
          {guest.plusOne ? ' +1' : ''}
          {guest.tableNumber ? ` | Table ${guest.tableNumber}` : ''}
        </Text>
      </View>
      <View style={[styles.rsvpBadge, { backgroundColor: RSVP_COLORS[guest.rsvpStatus] + '20' }]}>
        <View style={[styles.rsvpDot, { backgroundColor: RSVP_COLORS[guest.rsvpStatus] }]} />
        <Text style={[styles.rsvpText, { color: RSVP_COLORS[guest.rsvpStatus] }]}>
          {RSVP_LABELS[guest.rsvpStatus]}
        </Text>
      </View>
    </Pressable>
  );
}

export default function GuestsScreen() {
  const insets = useSafeAreaInsets();
  const { guests, addGuest, updateGuest, deleteGuest } = useWedding();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'declined'>('all');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rsvp, setRsvp] = useState<Guest['rsvpStatus']>('pending');
  const [side, setSide] = useState<Guest['side']>('mutual');
  const [plusOne, setPlusOne] = useState(false);
  const [table, setTable] = useState('');
  const [dietary, setDietary] = useState('');

  const filteredGuests = useMemo(() => {
    return guests.filter(g => {
      const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || g.rsvpStatus === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [guests, searchQuery, filterStatus]);

  const openEdit = (guest: Guest | null) => {
    if (guest) {
      setEditingId(guest.id);
      setName(guest.name);
      setEmail(guest.email);
      setPhone(guest.phone);
      setRsvp(guest.rsvpStatus);
      setSide(guest.side);
      setPlusOne(guest.plusOne);
      setTable(guest.tableNumber);
      setDietary(guest.dietaryNotes);
    } else {
      setEditingId(null);
      setName('');
      setEmail('');
      setPhone('');
      setRsvp('pending');
      setSide('mutual');
      setPlusOne(false);
      setTable('');
      setDietary('');
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const data = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      rsvpStatus: rsvp,
      side,
      plusOne,
      tableNumber: table.trim(),
      dietaryNotes: dietary.trim(),
    };
    if (editingId) {
      updateGuest(editingId, data);
    } else {
      addGuest(data);
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (editingId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      deleteGuest(editingId);
      setShowModal(false);
    }
  };

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const confirmed = guests.filter(g => g.rsvpStatus === 'confirmed').length;
  const pending = guests.filter(g => g.rsvpStatus === 'pending').length;
  const declined = guests.filter(g => g.rsvpStatus === 'declined').length;

  const ListHeader = () => (
    <View>
      <Text style={styles.pageTitle}>Guests</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{guests.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: Colors.sage }]}>{confirmed}</Text>
          <Text style={styles.summaryLabel}>Confirmed</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: Colors.gold }]}>{pending}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: Colors.roseDark }]}>{declined}</Text>
          <Text style={styles.summaryLabel}>Declined</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.warmGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search guests..."
          placeholderTextColor={Colors.warmGray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {!!searchQuery && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.warmGray} />
          </Pressable>
        )}
      </View>

      <View style={styles.filterRow}>
        {(['all', 'confirmed', 'pending', 'declined'] as const).map(status => (
          <Pressable
            key={status}
            style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
            onPress={() => {
              Haptics.selectionAsync();
              setFilterStatus(status);
            }}
          >
            <Text style={[styles.filterChipText, filterStatus === status && styles.filterChipTextActive]}>
              {status === 'all' ? 'All' : RSVP_LABELS[status]}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredGuests}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <GuestCard guest={item} onPress={() => openEdit(item)} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={40} color={Colors.goldLight} />
            <Text style={styles.emptyText}>
              {searchQuery || filterStatus !== 'all' ? 'No guests match your search' : 'No guests added yet'}
            </Text>
            <Text style={styles.emptyHint}>Tap + to add your first guest</Text>
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: topInset + 16, paddingBottom: Platform.OS === 'web' ? 84 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filteredGuests.length || !!searchQuery}
      />

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9, transform: [{ scale: 0.95 }] }]}
        onPress={() => openEdit(null)}
      >
        <LinearGradient colors={[Colors.gold, Colors.goldDark]} style={styles.fabGradient}>
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 16 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editingId ? 'Edit Guest' : 'Add Guest'}</Text>

            <View style={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Jane Doe" placeholderTextColor={Colors.warmGray} />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email" placeholderTextColor={Colors.warmGray} keyboardType="email-address" />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Phone</Text>
                  <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="phone" placeholderTextColor={Colors.warmGray} keyboardType="phone-pad" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>RSVP Status</Text>
                <View style={styles.segmentRow}>
                  {(['pending', 'confirmed', 'declined'] as const).map(s => (
                    <Pressable
                      key={s}
                      style={[styles.segmentButton, rsvp === s && { backgroundColor: RSVP_COLORS[s] + '20', borderColor: RSVP_COLORS[s] }]}
                      onPress={() => setRsvp(s)}
                    >
                      <Text style={[styles.segmentText, rsvp === s && { color: RSVP_COLORS[s] }]}>
                        {RSVP_LABELS[s]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Side</Text>
                  <View style={styles.segmentRow}>
                    {(['partner1', 'partner2', 'mutual'] as const).map(s => (
                      <Pressable
                        key={s}
                        style={[styles.segmentButton, side === s && styles.segmentActive]}
                        onPress={() => setSide(s)}
                      >
                        <Text style={[styles.segmentText, side === s && styles.segmentTextActive]}>
                          {s === 'partner1' ? 'A' : s === 'partner2' ? 'B' : 'Both'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Table</Text>
                  <TextInput style={styles.input} value={table} onChangeText={setTable} placeholder="#" placeholderTextColor={Colors.warmGray} />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Pressable
                    style={[styles.toggleButton, plusOne && styles.toggleActive]}
                    onPress={() => setPlusOne(!plusOne)}
                  >
                    <Ionicons name={plusOne ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={plusOne ? Colors.gold : Colors.warmGray} />
                    <Text style={[styles.toggleText, plusOne && { color: Colors.gold }]}>Plus One</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dietary Notes</Text>
                <TextInput style={styles.input} value={dietary} onChangeText={setDietary} placeholder="Any restrictions..." placeholderTextColor={Colors.warmGray} />
              </View>
            </View>

            <Pressable style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.85 }]} onPress={handleSave}>
              <LinearGradient colors={[Colors.gold, Colors.goldDark]} style={styles.saveButtonGradient}>
                <Text style={styles.saveButtonText}>Save</Text>
              </LinearGradient>
            </Pressable>

            {editingId && (
              <Pressable onPress={handleDelete} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Remove Guest</Text>
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
    gap: 8,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.12)',
  },
  summaryNumber: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 20,
    color: Colors.charcoal,
  },
  summaryLabel: {
    fontFamily: 'Lora_400Regular',
    fontSize: 11,
    color: Colors.warmGray,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.12)',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Lora_400Regular',
    fontSize: 14,
    color: Colors.charcoal,
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.12)',
  },
  filterChipActive: {
    backgroundColor: Colors.gold + '18',
    borderColor: Colors.gold,
  },
  filterChipText: {
    fontFamily: 'Lora_400Regular',
    fontSize: 12,
    color: Colors.warmGray,
  },
  filterChipTextActive: {
    color: Colors.gold,
    fontFamily: 'Lora_500Medium',
  },
  guestCard: {
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
  guestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.goldLight + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestInitials: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 14,
    color: Colors.gold,
  },
  guestName: {
    fontFamily: 'Lora_500Medium',
    fontSize: 15,
    color: Colors.charcoal,
  },
  guestDetail: {
    fontFamily: 'Lora_400Regular',
    fontSize: 12,
    color: Colors.warmGray,
    marginTop: 2,
  },
  rsvpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  rsvpDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  rsvpText: {
    fontFamily: 'Lora_400Regular',
    fontSize: 11,
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
    shadowColor: Colors.gold,
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
    maxHeight: '85%',
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
  modalScroll: {},
  inputGroup: { marginBottom: 14 },
  inputLabel: {
    fontFamily: 'Lora_500Medium',
    fontSize: 13,
    color: Colors.charcoal,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.cream,
    borderRadius: 12,
    padding: 13,
    fontFamily: 'Lora_400Regular',
    fontSize: 14,
    color: Colors.charcoal,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.15)',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 6,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.15)',
    backgroundColor: Colors.cream,
  },
  segmentActive: {
    backgroundColor: Colors.gold + '18',
    borderColor: Colors.gold,
  },
  segmentText: {
    fontFamily: 'Lora_400Regular',
    fontSize: 12,
    color: Colors.warmGray,
  },
  segmentTextActive: {
    color: Colors.gold,
    fontFamily: 'Lora_500Medium',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.15)',
    marginTop: 20,
  },
  toggleActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.gold + '10',
  },
  toggleText: {
    fontFamily: 'Lora_400Regular',
    fontSize: 13,
    color: Colors.warmGray,
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
