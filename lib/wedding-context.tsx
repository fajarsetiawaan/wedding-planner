import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export interface WeddingSettings {
  partner1Name: string;
  partner2Name: string;
  weddingDate: string;
  totalBudget: number;
  venueName: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  icon: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  side: 'partner1' | 'partner2' | 'mutual';
  plusOne: boolean;
  tableNumber: string;
  dietaryNotes: string;
}

export interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Gift {
  id: string;
  guestName: string;
  description: string;
  estimatedValue: string;
  thankYouSent: boolean;
  dateReceived: string;
}

interface WeddingContextValue {
  settings: WeddingSettings;
  updateSettings: (s: Partial<WeddingSettings>) => void;
  budgetCategories: BudgetCategory[];
  addBudgetCategory: (c: Omit<BudgetCategory, 'id'>) => void;
  updateBudgetCategory: (id: string, c: Partial<BudgetCategory>) => void;
  deleteBudgetCategory: (id: string) => void;
  guests: Guest[];
  addGuest: (g: Omit<Guest, 'id'>) => void;
  updateGuest: (id: string, g: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;
  tasks: Task[];
  addTask: (t: Omit<Task, 'id'>) => void;
  updateTask: (id: string, t: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  gifts: Gift[];
  addGift: (g: Omit<Gift, 'id'>) => void;
  updateGift: (id: string, g: Partial<Gift>) => void;
  deleteGift: (id: string) => void;
  isLoading: boolean;
  isSetup: boolean;
  weddingId: string | null;
  setWeddingId: (id: string | null) => void;
}

const WeddingContext = createContext<WeddingContextValue | null>(null);

const STORAGE_KEYS = {
  settings: '@everafter_settings',
  budget: '@everafter_budget',
  guests: '@everafter_guests',
  tasks: '@everafter_tasks',
  gifts: '@everafter_gifts',
  weddingId: '@everafter_wedding_id',
};

const DEFAULT_SETTINGS: WeddingSettings = {
  partner1Name: '',
  partner2Name: '',
  weddingDate: '',
  totalBudget: 0,
  venueName: '',
};

const DEFAULT_CATEGORIES: BudgetCategory[] = [
  { id: '1', name: 'Venue', allocated: 0, spent: 0, icon: 'home' },
  { id: '2', name: 'Catering', allocated: 0, spent: 0, icon: 'restaurant' },
  { id: '3', name: 'Photography', allocated: 0, spent: 0, icon: 'camera' },
  { id: '4', name: 'Decoration', allocated: 0, spent: 0, icon: 'flower' },
  { id: '5', name: 'Attire', allocated: 0, spent: 0, icon: 'shirt' },
  { id: '6', name: 'Music & Entertainment', allocated: 0, spent: 0, icon: 'musical-notes' },
  { id: '7', name: 'Invitations', allocated: 0, spent: 0, icon: 'mail' },
  { id: '8', name: 'Transportation', allocated: 0, spent: 0, icon: 'car' },
];

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Set wedding date', category: 'Planning', completed: false, dueDate: '', priority: 'high' },
  { id: '2', title: 'Create guest list', category: 'Guests', completed: false, dueDate: '', priority: 'high' },
  { id: '3', title: 'Book venue', category: 'Venue', completed: false, dueDate: '', priority: 'high' },
  { id: '4', title: 'Hire photographer', category: 'Vendors', completed: false, dueDate: '', priority: 'medium' },
  { id: '5', title: 'Choose wedding dress/suit', category: 'Attire', completed: false, dueDate: '', priority: 'medium' },
  { id: '6', title: 'Book catering', category: 'Food', completed: false, dueDate: '', priority: 'medium' },
  { id: '7', title: 'Send invitations', category: 'Guests', completed: false, dueDate: '', priority: 'medium' },
  { id: '8', title: 'Plan honeymoon', category: 'Travel', completed: false, dueDate: '', priority: 'low' },
  { id: '9', title: 'Order wedding cake', category: 'Food', completed: false, dueDate: '', priority: 'low' },
  { id: '10', title: 'Arrange flowers', category: 'Decoration', completed: false, dueDate: '', priority: 'low' },
];

export function WeddingProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<WeddingSettings>(DEFAULT_SETTINGS);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(DEFAULT_CATEGORIES);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [weddingId, setWeddingIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [s, b, g, t, gi, wid] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.settings),
        AsyncStorage.getItem(STORAGE_KEYS.budget),
        AsyncStorage.getItem(STORAGE_KEYS.guests),
        AsyncStorage.getItem(STORAGE_KEYS.tasks),
        AsyncStorage.getItem(STORAGE_KEYS.gifts),
        AsyncStorage.getItem(STORAGE_KEYS.weddingId),
      ]);
      if (s) setSettings(JSON.parse(s));
      if (b) setBudgetCategories(JSON.parse(b));
      if (g) setGuests(JSON.parse(g));
      if (t) setTasks(JSON.parse(t));
      if (gi) setGifts(JSON.parse(gi));
      if (wid) setWeddingIdState(JSON.parse(wid));
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const save = async (key: string, data: unknown) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save:', e);
    }
  };

  const setWeddingId = useCallback((id: string | null) => {
    setWeddingIdState(id);
    save(STORAGE_KEYS.weddingId, id);
  }, []);

  const updateSettings = useCallback((partial: Partial<WeddingSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      save(STORAGE_KEYS.settings, next);
      return next;
    });
  }, []);

  const addBudgetCategory = useCallback((c: Omit<BudgetCategory, 'id'>) => {
    setBudgetCategories(prev => {
      const next = [...prev, { ...c, id: Crypto.randomUUID() }];
      save(STORAGE_KEYS.budget, next);
      return next;
    });
  }, []);

  const updateBudgetCategory = useCallback((id: string, c: Partial<BudgetCategory>) => {
    setBudgetCategories(prev => {
      const next = prev.map(cat => cat.id === id ? { ...cat, ...c } : cat);
      save(STORAGE_KEYS.budget, next);
      return next;
    });
  }, []);

  const deleteBudgetCategory = useCallback((id: string) => {
    setBudgetCategories(prev => {
      const next = prev.filter(c => c.id !== id);
      save(STORAGE_KEYS.budget, next);
      return next;
    });
  }, []);

  const addGuest = useCallback((g: Omit<Guest, 'id'>) => {
    setGuests(prev => {
      const next = [...prev, { ...g, id: Crypto.randomUUID() }];
      save(STORAGE_KEYS.guests, next);
      return next;
    });
  }, []);

  const updateGuest = useCallback((id: string, g: Partial<Guest>) => {
    setGuests(prev => {
      const next = prev.map(guest => guest.id === id ? { ...guest, ...g } : guest);
      save(STORAGE_KEYS.guests, next);
      return next;
    });
  }, []);

  const deleteGuest = useCallback((id: string) => {
    setGuests(prev => {
      const next = prev.filter(g => g.id !== id);
      save(STORAGE_KEYS.guests, next);
      return next;
    });
  }, []);

  const addTask = useCallback((t: Omit<Task, 'id'>) => {
    setTasks(prev => {
      const next = [...prev, { ...t, id: Crypto.randomUUID() }];
      save(STORAGE_KEYS.tasks, next);
      return next;
    });
  }, []);

  const updateTask = useCallback((id: string, t: Partial<Task>) => {
    setTasks(prev => {
      const next = prev.map(task => task.id === id ? { ...task, ...t } : task);
      save(STORAGE_KEYS.tasks, next);
      return next;
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const next = prev.filter(t => t.id !== id);
      save(STORAGE_KEYS.tasks, next);
      return next;
    });
  }, []);

  const addGift = useCallback((g: Omit<Gift, 'id'>) => {
    setGifts(prev => {
      const next = [...prev, { ...g, id: Crypto.randomUUID() }];
      save(STORAGE_KEYS.gifts, next);
      return next;
    });
  }, []);

  const updateGift = useCallback((id: string, g: Partial<Gift>) => {
    setGifts(prev => {
      const next = prev.map(gift => gift.id === id ? { ...gift, ...g } : gift);
      save(STORAGE_KEYS.gifts, next);
      return next;
    });
  }, []);

  const deleteGift = useCallback((id: string) => {
    setGifts(prev => {
      const next = prev.filter(g => g.id !== id);
      save(STORAGE_KEYS.gifts, next);
      return next;
    });
  }, []);

  const isSetup = settings.partner1Name.length > 0 && settings.partner2Name.length > 0;

  const value = useMemo(() => ({
    settings,
    updateSettings,
    budgetCategories,
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
    guests,
    addGuest,
    updateGuest,
    deleteGuest,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    gifts,
    addGift,
    updateGift,
    deleteGift,
    isLoading,
    isSetup,
    weddingId,
    setWeddingId,
  }), [settings, budgetCategories, guests, tasks, gifts, isLoading, isSetup, weddingId, updateSettings, addBudgetCategory, updateBudgetCategory, deleteBudgetCategory, addGuest, updateGuest, deleteGuest, addTask, updateTask, deleteTask, addGift, updateGift, deleteGift, setWeddingId]);

  return (
    <WeddingContext.Provider value={value}>
      {children}
    </WeddingContext.Provider>
  );
}

export function useWedding() {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
}
