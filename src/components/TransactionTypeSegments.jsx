import { SegmentedControl } from './SegmentedControl'

const OPTIONS = [
  { value: 'income',   label: 'Income',   to: '/income/new' },
  { value: 'expense',  label: 'Expense',  to: '/expense/new' },
  { value: 'transfer', label: 'Transfer', to: '/transfer/new' },
]

export function TransactionTypeSegments({ active }) {
  return <SegmentedControl options={OPTIONS} value={active} />
}