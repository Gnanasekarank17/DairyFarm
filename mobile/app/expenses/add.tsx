import { Redirect, useLocalSearchParams } from 'expo-router';

// Expenses moved to the shared finance ledger screens; keep the old deep link working.
export default function AddExpenseRedirect() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <Redirect href={(id ? `/finance/expenses/add?id=${id}` : '/finance/expenses/add') as any} />;
}
