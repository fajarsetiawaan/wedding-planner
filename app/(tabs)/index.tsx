import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useWedding } from '@/lib/wedding-context';
import Colors from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.countdownUnit}>
      <View style={styles.countdownValueBox}>
        <Text style={styles.countdownValue}>{value}</Text>
      </View>
      <Text style={styles.countdownLabel}>{label}</Text>
    </View>
  );
}

function QuickStatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={styles.quickStatCard}>
      <View style={[styles.quickStatIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.quickStatValue}>{value}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { setWeddingId, settings, updateSettings, budgetCategories, guests, tasks, gifts, isLoading, isSetup } = useWedding();
  const [showSetup, setShowSetup] = useState(false);
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [budgetStr, setBudgetStr] = useState('');

  const pulseValue = useSharedValue(1);

  useEffect(() => {
    pulseValue.value = withRepeat(
      withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  useEffect(() => {
    if (!isLoading && !isSetup) {
      setShowSetup(true);
    }
  }, [isLoading, isSetup]);

  const handleSetup = () => {
    if (!name1.trim() || !name2.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateSettings({
      partner1Name: name1.trim(),
      partner2Name: name2.trim(),
      weddingDate: dateStr.trim(),
      totalBudget: parseFloat(budgetStr) || 0,
    });
    setShowSetup(false);
  };

  const getDaysUntilWedding = () => {
    if (!settings.weddingDate) return null;
    const wedding = new Date(settings.weddingDate);
    const now = new Date();
    const diff = wedding.getTime() - now.getTime();
    if (diff < 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, minutes };
  };

  const countdown = getDaysUntilWedding();
  const totalSpent = budgetCategories.reduce((sum, c) => sum + c.spent, 0);
  const totalAllocated = budgetCategories.reduce((sum, c) => sum + c.allocated, 0);
  const confirmedGuests = guests.filter(g => g.rsvpStatus === 'confirmed').length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingThankYous = gifts.filter(g => !g.thankYouSent).length;

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="heart" size={32} color={Colors.gold} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topInset + 16, paddingBottom: Platform.OS === 'web' ? 84 : 100 }
        ]}
      >
        <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(100).duration(600) : undefined}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>
                {isSetup ? `${settings.partner1Name} & ${settings.partner2Name}` : 'Welcome'}
              </Text>
              <Text style={styles.subtitle}>Your wedding journey</Text>
            </View>
            {isSetup && (
              <View style={styles.headerActions}>
                <Pressable
                  style={styles.headerIconButton}
                  onPress={() => {
                    setWeddingId(null);
                  }}
                >
                  <Ionicons name="log-out-outline" size={22} color={Colors.roseDark} />
                </Pressable>
                <Pressable
                  style={styles.headerIconButton}
                  onPress={() => {
                    setName1(settings.partner1Name);
                    setName2(settings.partner2Name);
                    setDateStr(settings.weddingDate);
                    setBudgetStr(settings.totalBudget.toString());
                    setShowSetup(true);
                  }}
                >
                  <Ionicons name="settings-outline" size={22} color={Colors.warmGray} />
                </Pressable>
              </View>
            )}
          </View>
        </Animated.View>

        {countdown && (
          <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(200).duration(600) : undefined}>
            <LinearGradient
              colors={['#C9A96E', '#E8D5A8', '#C9A96E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.countdownCard}
            >
              <Animated.View style={pulseStyle}>
                <Ionicons name="heart" size={28} color="rgba(255,255,255,0.9)" />
              </Animated.View>
              <Text style={styles.countdownTitle}>Days Until Forever</Text>
              <View style={styles.countdownRow}>
                <CountdownUnit value={countdown.days} label="Days" />
                <Text style={styles.countdownSeparator}>:</Text>
                <CountdownUnit value={countdown.hours} label="Hours" />
                <Text style={styles.countdownSeparator}>:</Text>
                <CountdownUnit value={countdown.minutes} label="Min" />
              </View>
              {settings.weddingDate && (
                <Text style={styles.weddingDateText}>
                  {new Date(settings.weddingDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              )}
            </LinearGradient>
          </Animated.View>
        )}

        {!countdown && isSetup && (
          <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(200).duration(600) : undefined}>
            <LinearGradient
              colors={['#C9A96E', '#E8D5A8', '#C9A96E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.countdownCard}
            >
              <Ionicons name="heart" size={28} color="rgba(255,255,255,0.9)" />
              <Text style={styles.countdownTitle}>Set Your Wedding Date</Text>
              <Text style={styles.weddingDateText}>Tap the settings icon to add your date</Text>
            </LinearGradient>
          </Animated.View>
        )}

        <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(300).duration(600) : undefined}>
          <View style={styles.statsGrid}>
            <QuickStatCard
              icon="card"
              label="Budget Spent"
              value={settings.totalBudget > 0 ? `${Math.round((totalSpent / settings.totalBudget) * 100)}%` : '$0'}
              color={Colors.gold}
            />
            <QuickStatCard
              icon="people"
              label="Confirmed"
              value={`${confirmedGuests}`}
              color={Colors.dustyBlue}
            />
            <QuickStatCard
              icon="checkbox"
              label="Tasks Done"
              value={`${completedTasks}/${tasks.length}`}
              color={Colors.sage}
            />
            <QuickStatCard
              icon="gift"
              label="Thank Yous"
              value={pendingThankYous > 0 ? `${pendingThankYous} left` : 'All sent'}
              color={Colors.rose}
            />
          </View>
        </Animated.View>

        {settings.totalBudget > 0 && (
          <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(400).duration(600) : undefined}>
            <View style={styles.budgetOverview}>
              <Text style={styles.sectionTitle}>Budget Overview</Text>
              <View style={styles.budgetProgressContainer}>
                <View style={styles.budgetProgressTrack}>
                  <LinearGradient
                    colors={[Colors.gold, Colors.goldLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.budgetProgressFill,
                      { width: `${Math.min((totalSpent / settings.totalBudget) * 100, 100)}%` },
                    ]}
                  />
                </View>
                <View style={styles.budgetNumbers}>
                  <Text style={styles.budgetSpent}>${totalSpent.toLocaleString()} spent</Text>
                  <Text style={styles.budgetTotal}>${settings.totalBudget.toLocaleString()} total</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(500).duration(600) : undefined}>
          <View style={styles.guestOverview}>
            <Text style={styles.sectionTitle}>Guest Summary</Text>
            <View style={styles.guestStatsRow}>
              <View style={styles.guestStatItem}>
                <View style={[styles.guestDot, { backgroundColor: Colors.sage }]} />
                <Text style={styles.guestStatText}>
                  {guests.filter(g => g.rsvpStatus === 'confirmed').length} Confirmed
                </Text>
              </View>
              <View style={styles.guestStatItem}>
                <View style={[styles.guestDot, { backgroundColor: Colors.goldLight }]} />
                <Text style={styles.guestStatText}>
                  {guests.filter(g => g.rsvpStatus === 'pending').length} Pending
                </Text>
              </View>
              <View style={styles.guestStatItem}>
                <View style={[styles.guestDot, { backgroundColor: Colors.roseDark }]} />
                <Text style={styles.guestStatText}>
                  {guests.filter(g => g.rsvpStatus === 'declined').length} Declined
                </Text>
              </View>
            </View>
            <Text style={styles.totalGuests}>{guests.length} total guests</Text>
          </View>
        </Animated.View>

        <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(600).duration(600) : undefined}>
          <View style={styles.upcomingTasks}>
            <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
            {tasks.filter(t => !t.completed).slice(0, 3).map(task => (
              <View key={task.id} style={styles.taskPreview}>
                <View style={[styles.priorityDot, {
                  backgroundColor: task.priority === 'high' ? Colors.roseDark : task.priority === 'medium' ? Colors.gold : Colors.sage,
                }]} />
                <Text style={styles.taskPreviewText} numberOfLines={1}>{task.title}</Text>
                <Text style={styles.taskPreviewCategory}>{task.category}</Text>
              </View>
            ))}
            {tasks.filter(t => !t.completed).length === 0 && (
              <Text style={styles.emptyHint}>All tasks completed!</Text>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      <Modal visible={showSetup} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalContent, { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 16 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {isSetup ? 'Edit Details' : 'Welcome to EverAfter'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {isSetup ? 'Update your wedding details' : 'Begin your forever journey'}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Partner 1</Text>
              <TextInput
                style={styles.input}
                value={name1}
                onChangeText={setName1}
                placeholder="First name"
                placeholderTextColor={Colors.warmGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Partner 2</Text>
              <TextInput
                style={styles.input}
                value={name2}
                onChangeText={setName2}
                placeholder="First name"
                placeholderTextColor={Colors.warmGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Wedding Date</Text>
              <TextInput
                style={styles.input}
                value={dateStr}
                onChangeText={setDateStr}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.warmGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Total Budget</Text>
              <TextInput
                style={styles.input}
                value={budgetStr}
                onChangeText={setBudgetStr}
                placeholder="e.g. 25000"
                placeholderTextColor={Colors.warmGray}
                keyboardType="numeric"
              />
            </View>

            <Pressable
              style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
              onPress={handleSetup}
            >
              <LinearGradient
                colors={[Colors.gold, Colors.goldDark]}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>
                  {isSetup ? 'Save Changes' : 'Begin Planning'}
                </Text>
              </LinearGradient>
            </Pressable>

            {isSetup && (
              <Pressable onPress={() => setShowSetup(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Changed to center to align the buttons vertically with the text
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconButton: {
    padding: 4,
  },
  greeting: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 26,
    color: Colors.charcoal,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Lora_400Regular',
    fontSize: 14,
    color: Colors.warmGray,
  },
  countdownCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  countdownTitle: {
    fontFamily: 'PlayfairDisplay_500Medium',
    fontSize: 16,
    color: 'rgba(255,255,255,0.95)',
    marginTop: 8,
    marginBottom: 16,
    letterSpacing: 1,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countdownUnit: {
    alignItems: 'center',
  },
  countdownValueBox: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 64,
    alignItems: 'center',
  },
  countdownValue: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 28,
    color: '#FFFFFF',
  },
  countdownLabel: {
    fontFamily: 'Lora_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countdownSeparator: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 18,
  },
  weddingDateText: {
    fontFamily: 'Lora_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  quickStatCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 14,
    width: (SCREEN_WIDTH - 52) / 2,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.12)',
  },
  quickStatIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickStatValue: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 20,
    color: Colors.charcoal,
    marginBottom: 2,
  },
  quickStatLabel: {
    fontFamily: 'Lora_400Regular',
    fontSize: 12,
    color: Colors.warmGray,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 18,
    color: Colors.charcoal,
    marginBottom: 14,
  },
  budgetOverview: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.12)',
  },
  budgetProgressContainer: {
    gap: 8,
  },
  budgetProgressTrack: {
    height: 8,
    backgroundColor: Colors.creamDark,
    borderRadius: 4,
    overflow: 'hidden',
  },
  budgetProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetSpent: {
    fontFamily: 'Lora_500Medium',
    fontSize: 13,
    color: Colors.gold,
  },
  budgetTotal: {
    fontFamily: 'Lora_400Regular',
    fontSize: 13,
    color: Colors.warmGray,
  },
  guestOverview: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.12)',
  },
  guestStatsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  guestStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guestDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  guestStatText: {
    fontFamily: 'Lora_400Regular',
    fontSize: 13,
    color: Colors.charcoal,
  },
  totalGuests: {
    fontFamily: 'Lora_400Regular',
    fontSize: 12,
    color: Colors.warmGray,
    marginTop: 4,
  },
  upcomingTasks: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.12)',
  },
  taskPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,169,110,0.08)',
    gap: 10,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskPreviewText: {
    fontFamily: 'Lora_400Regular',
    fontSize: 14,
    color: Colors.charcoal,
    flex: 1,
  },
  taskPreviewCategory: {
    fontFamily: 'Lora_400Regular',
    fontSize: 11,
    color: Colors.warmGray,
    backgroundColor: Colors.creamDark,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  emptyHint: {
    fontFamily: 'Lora_400Regular',
    fontSize: 14,
    color: Colors.warmGray,
    textAlign: 'center',
    paddingVertical: 16,
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
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 24,
    color: Colors.charcoal,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontFamily: 'Lora_400Regular',
    fontSize: 14,
    color: Colors.warmGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
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
    marginTop: 8,
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
    letterSpacing: 0.5,
  },
  cancelButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontFamily: 'Lora_400Regular',
    fontSize: 14,
    color: Colors.warmGray,
  },
});
