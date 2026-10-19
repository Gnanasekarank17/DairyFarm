import { Redirect } from 'expo-router';

// Expenses moved to the shared finance ledger screens; keep the old deep link working.
export default function ExpensesRedirect() {
  return <Redirect href={'/finance/expenses' as any} />;
}
