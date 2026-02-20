import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
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
import { useWedding } from '@/lib/wedding-context';
import Colors from '@/constants/colors';

const CATEGORY_ICONS: Record<string, string> = {
  home: 'home-outline',
  restaurant: 'restaurant-outline',
  camera: 'camera-outline',
  flower: 'flower-outline',
  shirt: 'shirt-outline',
  'musical-notes': 'musical-notes-outline',
  mail: 'mail-outline',
  car: 'car-outline',
  default: 'ellipse-outline',
};

function BudgetCategoryCard({
  category,
  totalBudget,
  onPress,
}: {
  category: { id: string; name: string; allocated: number; spent: number; icon: string };
  totalBudget: number;
  onPress: () => void;
}) {
  const percentage = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0;
  const isOverBudget = category.spent > category.allocated && category.allocated > 0;
  const iconName = CATEGORY_ICONS[category.icon] || CATEGORY_ICONS.default;

  return (
    <Pressable
      style={({ pressed }) => [styles.categoryCard, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
      onPress={onPress}
    >
      <View style={styles.categoryHeader}>
        <View style={styles.categoryIconContainer}>
          <Ionicons name={iconName as any} size={18} color={Colors.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryAllocated}>
            ${category.allocated.toLocaleString()} allocated
          </Text>
        </View>
        <View style={styles.categorySpentContainer}>
          <Text style={[styles.categorySpent, isOverBudget && { color: Colors.error }]}>
            ${category.spent.toLocaleString()}
          </Text>
          <Text style={styles.categorySpentLabel}>spent</Text>
        </View>
      </View>
      <View style={styles.categoryProgressTrack}>
        <View
          style={[
            styles.categoryProgressFill,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: isOverBudget ? Colors.error : percentage > 80 ? Colors.warning : Colors.gold,
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, budgetCategories, addBudgetCategory, updateBudgetCategory, deleteBudgetCategory } = useWedding();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catAllocated, setCatAllocated] = useState('');
  const [catSpent, setCatSpent] = useState('');
  const [totalBudgetStr, setTotalBudgetStr] = useState('');

  const totalAllocated = budgetCategories.reduce((s, c) => s + c.allocated, 0);
  const totalSpent = budgetCategories.reduce((s, c) => s + c.spent, 0);
  const remaining = settings.totalBudget - totalSpent;
  const unallocated = settings.totalBudget - totalAllocated;

  const openEdit = (cat: typeof budgetCategories[0] | null) => {
    if (cat) {
      setEditingCategory(cat.id);
      setCatName(cat.name);
      setCatAllocated(cat.allocated.toString());
      setCatSpent(cat.spent.toString());
    } else {
      setEditingCategory(null);
      setCatName('');
      setCatAllocated('');
      setCatSpent('');
    }
    setShowEditModal(true);
  };

  const handleSaveCategory = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const data = {
      name: catName.trim() || 'Untitled',
      allocated: parseFloat(catAllocated) || 0,
      spent: parseFloat(catSpent) || 0,
      icon: 'default',
    };
    if (editingCategory) {
      updateBudgetCategory(editingCategory, data);
    } else {
      addBudgetCategory(data);
    }
    setShowEditModal(false);
  };

  const handleDeleteCategory = () => {
    if (editingCategory) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      deleteBudgetCategory(editingCategory);
      setShowEditModal(false);
    }
  };

  const handleSaveBudget = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSettings({ totalBudget: parseFloat(totalBudgetStr) || 0 });
    setShowBudgetModal(false);
  };

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: topInset + 16, paddingBottom: Platform.OS === 'web' ? 84 : 100 }]}
      >
        <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(100).duration(600) : undefined}>
          <Text style={styles.pageTitle}>Budget</Text>
        </Animated.View>

        <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(200).duration(600) : undefined}>
          <Pressable
            onPress={() => {
              setTotalBudgetStr(settings.totalBudget.toString());
              setShowBudgetModal(true);
            }}
          >
            <LinearGradient
              colors={[Colors.gold, Colors.goldLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.totalCard}
            >
              <Text style={styles.totalLabel}>Total Budget</Text>
              <Text style={styles.totalAmount}>${settings.totalBudget.toLocaleString()}</Text>
              <View style={styles.totalRow}>
                <View style={styles.totalStatItem}>
                  <Text style={styles.totalStatValue}>${totalSpent.toLocaleString()}</Text>
                  <Text style={styles.totalStatLabel}>Spent</Text>
                </View>
                <View style={styles.totalDivider} />
                <View style={styles.totalStatItem}>
                  <Text style={styles.totalStatValue}>${remaining.toLocaleString()}</Text>
                  <Text style={styles.totalStatLabel}>Remaining</Text>
                </View>
                <View style={styles.totalDivider} />
                <View style={styles.totalStatItem}>
                  <Text style={styles.totalStatValue}>${unallocated.toLocaleString()}</Text>
                  <Text style={styles.totalStatLabel}>Unallocated</Text>
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(300).duration(600) : undefined}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Pressable onPress={() => openEdit(null)}>
              <Ionicons name="add-circle-outline" size={24} color={Colors.gold} />
            </Pressable>
          </View>
        </Animated.View>

        {budgetCategories.map((cat, index) => (
          <Animated.View key={cat.id} entering={Platform.OS !== 'web' ? FadeInDown.delay(350 + index * 50).duration(500) : undefined}>
            <BudgetCategoryCard
              category={cat}
              totalBudget={settings.totalBudget}
              onPress={() => openEdit(cat)}
            />
          </Animated.View>
        ))}

        {budgetCategories.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={40} color={Colors.goldLight} />
            <Text style={styles.emptyText}>No budget categories yet</Text>
            <Text style={styles.emptyHint}>Tap + to add your first category</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 16 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {editingCategory ? 'Edit Category' : 'New Category'}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={catName}
                onChangeText={setCatName}
                placeholder="e.g. Photography"
                placeholderTextColor={Colors.warmGray}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Allocated</Text>
                <TextInput
                  style={styles.input}
                  value={catAllocated}
                  onChangeText={setCatAllocated}
                  placeholder="$0"
                  placeholderTextColor={Colors.warmGray}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Spent</Text>
                <TextInput
                  style={styles.input}
                  value={catSpent}
                  onChangeText={setCatSpent}
                  placeholder="$0"
                  placeholderTextColor={Colors.warmGray}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.85 }]}
              onPress={handleSaveCategory}
            >
              <LinearGradient colors={[Colors.gold, Colors.goldDark]} style={styles.saveButtonGradient}>
                <Text style={styles.saveButtonText}>Save</Text>
              </LinearGradient>
            </Pressable>

            {editingCategory && (
              <Pressable onPress={handleDeleteCategory} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Delete Category</Text>
              </Pressable>
            )}

            <Pressable onPress={() => setShowEditModal(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showBudgetModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 16 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Set Total Budget</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Total Wedding Budget</Text>
              <TextInput
                style={styles.input}
                value={totalBudgetStr}
                onChangeText={setTotalBudgetStr}
                placeholder="e.g. 25000"
                placeholderTextColor={Colors.warmGray}
                keyboardType="numeric"
                autoFocus
              />
            </View>

            <Pressable
              style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.85 }]}
              onPress={handleSaveBudget}
            >
              <LinearGradient colors={[Colors.gold, Colors.goldDark]} style={styles.saveButtonGradient}>
                <Text style={styles.saveButtonText}>Save</Text>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={() => setShowBudgetModal(false)} style={styles.cancelButton}>
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
  scrollContent: { paddingHorizontal: 20 },
  pageTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 28,
    color: Colors.charcoal,
    marginBottom: 20,
  },
  totalCard: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  totalLabel: {
    fontFamily: 'Lora_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalAmount: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 34,
    color: '#FFFFFF',
    marginVertical: 6,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  totalStatItem: { flex: 1, alignItems: 'center' },
  totalStatValue: {
    fontFamily: 'Lora_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  totalStatLabel: {
    fontFamily: 'Lora_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  totalDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 18,
    color: Colors.charcoal,
  },
  categoryCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.12)',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.goldLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontFamily: 'Lora_500Medium',
    fontSize: 15,
    color: Colors.charcoal,
  },
  categoryAllocated: {
    fontFamily: 'Lora_400Regular',
    fontSize: 12,
    color: Colors.warmGray,
  },
  categorySpentContainer: { alignItems: 'flex-end' },
  categorySpent: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 16,
    color: Colors.charcoal,
  },
  categorySpentLabel: {
    fontFamily: 'Lora_400Regular',
    fontSize: 11,
    color: Colors.warmGray,
  },
  categoryProgressTrack: {
    height: 4,
    backgroundColor: Colors.creamDark,
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 2,
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
    fontSize: 22,
    color: Colors.charcoal,
    textAlign: 'center',
    marginBottom: 20,
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
  inputRow: {
    flexDirection: 'row',
    gap: 12,
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
    paddingVertical: 12,
  },
  deleteButtonText: {
    fontFamily: 'Lora_500Medium',
    fontSize: 14,
    color: Colors.error,
  },
  cancelButton: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontFamily: 'Lora_400Regular',
    fontSize: 14,
    color: Colors.warmGray,
  },
});
