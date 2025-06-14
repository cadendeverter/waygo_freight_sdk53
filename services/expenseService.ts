// $ProjectName/services/expenseService.ts
// Service functions for Expense reports

import { db } from '../firebase/config';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { ExpenseReport } from '../utils/types';

const functions = getFunctions();

// Callable Cloud Functions (if you have them deployed, replace string names as needed)
const adminAddExpenseCallable = httpsCallable<Omit<ExpenseReport, 'id'>, { success: boolean; expenseId?: string; message?: string }>(
  functions,
  'adminAddExpense'
);
const adminUpdateExpenseCallable = httpsCallable<{ expenseId: string; updates: Partial<ExpenseReport> }, { success: boolean; message?: string }>(
  functions,
  'adminUpdateExpense'
);

/**
 * Fetch all expenses for an admin user given their companyId.
 * Falls back to Firestore direct query if the callable function is not available.
 */
export const fetchAllExpensesForAdmin = async (companyId: string): Promise<ExpenseReport[]> => {
  try {
    const expensesRef = collection(db, 'expensesFreight');
    const q = query(expensesRef, where('companyId', '==', companyId), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ExpenseReport));
  } catch (error: any) {
    console.error(`Error fetching expenses for company ${companyId}:`, error?.message);
    return [];
  }
};

/**
 * Add a new expense (admin only). Uses a callable Cloud Function if available, otherwise writes directly to Firestore.
 */
export const adminAddExpense = async (expense: Omit<ExpenseReport, 'id'>): Promise<{ success: boolean; expenseId?: string; message?: string }> => {
  try {
    // Prefer Cloud Function
    const result = await adminAddExpenseCallable(expense);
    return result.data;
  } catch (fnErr) {
    try {
      // Fallback to Firestore direct write
      const expensesRef = collection(db, 'expensesFreight');
      const docRef = await addDoc(expensesRef, { ...expense, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      return { success: true, expenseId: docRef.id };
    } catch (fsErr: any) {
      console.error('Error adding expense:', fsErr?.message);
      return { success: false, message: fsErr?.message || 'Failed to add expense.' };
    }
  }
};

/**
 * Update an expense report (admin only).
 */
export const adminUpdateExpense = async (
  expenseId: string,
  updates: Partial<ExpenseReport>
): Promise<{ success: boolean; message?: string }> => {
  try {
    const result = await adminUpdateExpenseCallable({ expenseId, updates });
    return result.data;
  } catch (fnErr) {
    try {
      const expenseDoc = doc(db, 'expensesFreight', expenseId);
      await updateDoc(expenseDoc, { ...updates, updatedAt: serverTimestamp() });
      return { success: true };
    } catch (fsErr: any) {
      console.error(`Error updating expense ${expenseId}:`, fsErr?.message);
      return { success: false, message: fsErr?.message || 'Failed to update expense.' };
    }
  }
};
