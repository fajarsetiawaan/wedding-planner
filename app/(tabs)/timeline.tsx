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
import { useWedding, Task } from '@/lib/wedding-context';
import Colors from '@/constants/colors';

const PRIORITY_COLORS = {
  high: Colors.roseDark,
  medium: Colors.gold,
  low: Colors.sage,
};

const CATEGORIES = ['Planning', 'Venue', 'Vendors', 'Guests', 'Food', 'Attire', 'Decoration', 'Travel', 'Other'];

function TaskItem({ task, onToggle, onPress }: { task: Task; onToggle: () => void; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.taskCard, pressed && { opacity: 0.9 }]}
      onPress={onPress}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle();
        }}
        style={styles.checkboxArea}
      >
        <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
          {task.completed && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </View>
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]} numberOfLines={2}>
          {task.title}
        </Text>
        <View style={styles.taskMeta}>
          <View style={[styles.categoryTag, { backgroundColor: PRIORITY_COLORS[task.priority] + '15' }]}>
            <View style={[styles.priorityIndicator, { backgroundColor: PRIORITY_COLORS[task.priority] }]} />
            <Text style={[styles.categoryTagText, { color: PRIORITY_COLORS[task.priority] }]}>
              {task.priority}
            </Text>
          </View>
          <Text style={styles.categoryText}>{task.category}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.lightGray} />
    </Pressable>
  );
}

export default function TimelineScreen() {
  const insets = useSafeAreaInsets();
  const { tasks, addTask, updateTask, deleteTask } = useWedding();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Planning');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [showCompleted, setShowCompleted] = useState(false);

  const incompleteTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.completed), [tasks]);
  const completionPercent = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const openEdit = (task: Task | null) => {
    if (task) {
      setEditingId(task.id);
      setTitle(task.title);
      setCategory(task.category);
      setPriority(task.priority);
    } else {
      setEditingId(null);
      setTitle('');
      setCategory('Planning');
      setPriority('medium');
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const data = {
      title: title.trim(),
      category,
      priority,
      completed: false,
      dueDate: '',
    };
    if (editingId) {
      updateTask(editingId, data);
    } else {
      addTask(data);
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (editingId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      deleteTask(editingId);
      setShowModal(false);
    }
  };

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const displayTasks = showCompleted ? completedTasks : incompleteTasks;

  const ListHeader = () => (
    <View>
      <Text style={styles.pageTitle}>Tasks</Text>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Overall Progress</Text>
          <Text style={styles.progressPercent}>{completionPercent}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[Colors.gold, Colors.sage]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${completionPercent}%` }]}
          />
        </View>
        <Text style={styles.progressDetail}>
          {completedTasks.length} of {tasks.length} tasks completed
        </Text>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, !showCompleted && styles.tabActive]}
          onPress={() => {
            Haptics.selectionAsync();
            setShowCompleted(false);
          }}
        >
          <Text style={[styles.tabText, !showCompleted && styles.tabTextActive]}>
            To Do ({incompleteTasks.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, showCompleted && styles.tabActive]}
          onPress={() => {
            Haptics.selectionAsync();
            setShowCompleted(true);
          }}
        >
          <Text style={[styles.tabText, showCompleted && styles.tabTextActive]}>
            Done ({completedTasks.length})
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={displayTasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggle={() => updateTask(item.id, { completed: !item.completed })}
            onPress={() => openEdit(item)}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkbox-outline" size={40} color={Colors.goldLight} />
            <Text style={styles.emptyText}>
              {showCompleted ? 'No completed tasks yet' : 'All caught up!'}
            </Text>
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: topInset + 16, paddingBottom: Platform.OS === 'web' ? 84 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!displayTasks.length}
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
            <Text style={styles.modalTitle}>{editingId ? 'Edit Task' : 'New Task'}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Task</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="What needs to be done?"
                placeholderTextColor={Colors.warmGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.chipRow}>
                {CATEGORIES.map(c => (
                  <Pressable
                    key={c}
                    style={[styles.chip, category === c && styles.chipActive]}
                    onPress={() => setCategory(c)}
                  >
                    <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.segmentRow}>
                {(['high', 'medium', 'low'] as const).map(p => (
                  <Pressable
                    key={p}
                    style={[styles.segmentButton, priority === p && { backgroundColor: PRIORITY_COLORS[p] + '18', borderColor: PRIORITY_COLORS[p] }]}
                    onPress={() => setPriority(p)}
                  >
                    <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[p] }]} />
                    <Text style={[styles.segmentText, priority === p && { color: PRIORITY_COLORS[p] }]}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.85 }]} onPress={handleSave}>
              <LinearGradient colors={[Colors.gold, Colors.goldDark]} style={styles.saveButtonGradient}>
                <Text style={styles.saveButtonText}>Save</Text>
              </LinearGradient>
            </Pressable>

            {editingId && (
              <Pressable onPress={handleDelete} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Delete Task</Text>
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
  progressCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.12)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontFamily: 'PlayfairDisplay_500Medium',
    fontSize: 15,
    color: Colors.charcoal,
  },
  progressPercent: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 18,
    color: Colors.gold,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.creamDark,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressDetail: {
    fontFamily: 'Lora_400Regular',
    fontSize: 12,
    color: Colors.warmGray,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.12)',
  },
  tabActive: {
    backgroundColor: Colors.gold + '15',
    borderColor: Colors.gold,
  },
  tabText: {
    fontFamily: 'Lora_400Regular',
    fontSize: 13,
    color: Colors.warmGray,
  },
  tabTextActive: {
    fontFamily: 'Lora_500Medium',
    color: Colors.gold,
  },
  taskCard: {
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
  checkboxArea: {
    padding: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.goldLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.sage,
    borderColor: Colors.sage,
  },
  taskTitle: {
    fontFamily: 'Lora_500Medium',
    fontSize: 14,
    color: Colors.charcoal,
    marginBottom: 4,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: Colors.warmGray,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  priorityIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryTagText: {
    fontFamily: 'Lora_400Regular',
    fontSize: 10,
    textTransform: 'capitalize',
  },
  categoryText: {
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
    maxHeight: '80%',
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.15)',
  },
  chipActive: {
    backgroundColor: Colors.gold + '18',
    borderColor: Colors.gold,
  },
  chipText: {
    fontFamily: 'Lora_400Regular',
    fontSize: 12,
    color: Colors.warmGray,
  },
  chipTextActive: {
    fontFamily: 'Lora_500Medium',
    color: Colors.gold,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.15)',
    backgroundColor: Colors.cream,
  },
  segmentText: {
    fontFamily: 'Lora_400Regular',
    fontSize: 12,
    color: Colors.warmGray,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
