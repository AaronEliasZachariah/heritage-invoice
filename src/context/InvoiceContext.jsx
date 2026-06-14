import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { calcTotals } from '../lib/calculations.js'
import { validateInvoice } from '../lib/compliance.js'
import { todayISO, addDays } from '../lib/format.js'

const STORAGE_KEY = 'heritage-invoice:v1'

const InvoiceContext = createContext(null)

function newItem(overrides = {}) {
  return {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `item-${Math.random().toString(36).slice(2)}`,
    description: '',
    quantity: 1,
    unit: 'hours',
    rate: 0,
    ...overrides,
  }
}

function createInitialState() {
  const issueDate = todayISO()
  return {
    meta: {
      invoiceNumber: 'INV-0001',
      issueDate,
      dueDate: addDays(issueDate, 14),
    },
    gstRegistered: false,
    supplier: { name: '', abn: '', email: '', phone: '', address: '' },
    client: { name: '', abn: '', email: '', address: '' },
    lineItems: [newItem()],
    notes: '',
    payment: { bankName: '', accountName: '', bsb: '', accountNumber: '', payId: '' },
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SECTION_FIELD': {
      const { section, field, value } = action
      return { ...state, [section]: { ...state[section], [field]: value } }
    }
    case 'SET_NOTES':
      return { ...state, notes: action.value }
    case 'SET_GST':
      return { ...state, gstRegistered: action.value }
    case 'ADD_ITEM':
      return { ...state, lineItems: [...state.lineItems, newItem()] }
    case 'UPDATE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.map((it) =>
          it.id === action.id ? { ...it, [action.field]: action.value } : it,
        ),
      }
    case 'REMOVE_ITEM': {
      const remaining = state.lineItems.filter((it) => it.id !== action.id)
      return { ...state, lineItems: remaining.length ? remaining : [newItem()] }
    }
    case 'APPLY_PARSE':
      return mergeParse(state, action.data)
    case 'LOAD':
      return action.state
    case 'RESET':
      return createInitialState()
    default:
      return state
  }
}

/** Merge AI/local parser output into state, only overwriting provided fields. */
function mergeParse(state, data) {
  if (!data || typeof data !== 'object') return state
  const next = { ...state }

  next.meta = { ...state.meta }
  if (data.invoiceNumber) next.meta.invoiceNumber = data.invoiceNumber
  if (data.issueDate) next.meta.issueDate = data.issueDate
  if (data.dueDate) next.meta.dueDate = data.dueDate

  if (typeof data.gstRegistered === 'boolean') next.gstRegistered = data.gstRegistered

  next.supplier = mergeFields(state.supplier, data.supplier)
  next.client = mergeFields(state.client, data.client)
  next.payment = mergeFields(state.payment, data.payment)

  if (typeof data.notes === 'string' && data.notes.trim()) next.notes = data.notes

  if (Array.isArray(data.lineItems) && data.lineItems.length) {
    next.lineItems = data.lineItems.map((raw) =>
      newItem({
        description: str(raw.description),
        quantity: num(raw.quantity, 1),
        unit: str(raw.unit) || 'hours',
        rate: num(raw.rate, 0),
      }),
    )
  }

  return next
}

function mergeFields(current, incoming) {
  if (!incoming || typeof incoming !== 'object') return current
  const merged = { ...current }
  for (const [k, v] of Object.entries(incoming)) {
    if (v != null && String(v).trim() !== '' && k in merged) merged[k] = String(v)
  }
  return merged
}

const str = (v) => (v == null ? '' : String(v))
const num = (v, fallback) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function init() {
  if (typeof window === 'undefined') return createInitialState()
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Shallow sanity check so a corrupt/old shape can't crash the app.
      if (parsed?.meta && parsed?.supplier && Array.isArray(parsed?.lineItems)) {
        return { ...createInitialState(), ...parsed }
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return createInitialState()
}

export function InvoiceProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage may be unavailable (private mode); non-fatal */
    }
  }, [state])

  const totals = useMemo(
    () => calcTotals(state.lineItems, state.gstRegistered),
    [state.lineItems, state.gstRegistered],
  )

  const validation = useMemo(() => validateInvoice(state), [state])

  const value = useMemo(
    () => ({
      state,
      totals,
      validation,
      setField: (section, field, value) =>
        dispatch({ type: 'SET_SECTION_FIELD', section, field, value }),
      setNotes: (value) => dispatch({ type: 'SET_NOTES', value }),
      setGst: (value) => dispatch({ type: 'SET_GST', value }),
      addItem: () => dispatch({ type: 'ADD_ITEM' }),
      updateItem: (id, field, value) => dispatch({ type: 'UPDATE_ITEM', id, field, value }),
      removeItem: (id) => dispatch({ type: 'REMOVE_ITEM', id }),
      applyParse: (data) => dispatch({ type: 'APPLY_PARSE', data }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [state, totals, validation],
  )

  return <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>
}

export function useInvoice() {
  const ctx = useContext(InvoiceContext)
  if (!ctx) throw new Error('useInvoice must be used within an InvoiceProvider')
  return ctx
}
