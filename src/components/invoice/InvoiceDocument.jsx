import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { calcTotals, lineSubtotal } from '../../lib/calculations.js'
import { documentTitle, complianceFooter } from '../../lib/compliance.js'
import { formatCurrency, formatDate, formatABN } from '../../lib/format.js'

// Heritage Wealth palette as plain hex (react-pdf can't read Tailwind tokens).
const C = {
  forest: '#1B3A2B',
  emerald: '#2F6B4F',
  brass: '#B08D57',
  brown: '#3B2A1E',
  brownLight: '#6B5440',
  sand: '#E4D8BE',
  beige: '#F4EFE3',
  cream: '#FBF7EE',
}

// Built-in PDF fonts only (Times for serif headings, Helvetica for data) —
// no network font registration, so PDFs render reliably everywhere.
const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.brown,
    backgroundColor: '#FFFFFF',
  },
  topBar: { height: 4, backgroundColor: C.forest, marginBottom: 24, borderRadius: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  supplierName: { fontFamily: 'Times-Bold', fontSize: 18, color: C.forest, marginBottom: 4 },
  muted: { color: C.brownLight, fontSize: 9, lineHeight: 1.5 },
  docTitle: { fontFamily: 'Times-Bold', fontSize: 26, color: C.forest, textAlign: 'right' },
  metaLine: { fontSize: 9, color: C.brownLight, textAlign: 'right', marginTop: 4 },
  metaValue: { color: C.brown, fontFamily: 'Helvetica-Bold' },

  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 26 },
  block: { maxWidth: '60%' },
  sectionLabel: {
    fontSize: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: C.brass,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
  },
  strong: { fontFamily: 'Helvetica-Bold', color: C.brown, fontSize: 11 },

  table: { marginBottom: 18 },
  th: {
    flexDirection: 'row',
    backgroundColor: C.forest,
    color: C.cream,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 3,
  },
  thText: { fontSize: 8, letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold' },
  tr: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.sand,
  },
  cDesc: { flex: 1, paddingRight: 8 },
  cQty: { width: 70, textAlign: 'center' },
  cRate: { width: 80, textAlign: 'right' },
  cAmt: { width: 80, textAlign: 'right' },

  totals: { marginLeft: 'auto', width: 220, marginTop: 6 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  totalLabel: { color: C.brownLight },
  grandWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: C.forest,
  },
  grandLabel: { fontFamily: 'Times-Bold', fontSize: 13, color: C.forest },
  grandValue: { fontFamily: 'Times-Bold', fontSize: 13, color: C.forest },

  footer: { marginTop: 28 },
  declaration: {
    backgroundColor: C.beige,
    borderRadius: 4,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: C.brass,
    marginBottom: 16,
  },
  declarationText: { fontSize: 9, color: C.brown, lineHeight: 1.5 },
  payGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 24 },
  payCol: { flex: 1 },
  notes: { fontSize: 9, color: C.brownLight, lineHeight: 1.5 },
})

export default function InvoiceDocument({ state }) {
  const { supplier, client, meta, lineItems, gstRegistered, notes, payment } = state
  const totals = calcTotals(lineItems, gstRegistered)
  const title = documentTitle(gstRegistered)
  const footerLines = complianceFooter({
    gstRegistered,
    supplierName: supplier.name,
    gstAmount: totals.gst,
  })
  const items = lineItems.filter(
    (it) => it.description?.trim() || Number(it.rate) > 0 || Number(it.quantity) > 0,
  )
  const hasPayment =
    payment.bankName ||
    payment.accountName ||
    payment.bsb ||
    payment.accountNumber ||
    payment.payId

  return (
    <Document title={`${title} ${meta.invoiceNumber}`} author={supplier.name || 'Heritage Invoice'}>
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} />

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.block}>
            <Text style={styles.supplierName}>{supplier.name || 'Your business name'}</Text>
            {supplier.abn ? <Text style={styles.muted}>ABN: {formatABN(supplier.abn)}</Text> : null}
            {supplier.address ? <Text style={styles.muted}>{supplier.address}</Text> : null}
            {supplier.email ? <Text style={styles.muted}>{supplier.email}</Text> : null}
            {supplier.phone ? <Text style={styles.muted}>{supplier.phone}</Text> : null}
          </View>
          <View>
            <Text style={styles.docTitle}>{title}</Text>
            <Text style={styles.metaLine}>
              No: <Text style={styles.metaValue}>{meta.invoiceNumber || '—'}</Text>
            </Text>
            <Text style={styles.metaLine}>
              Issued: <Text style={styles.metaValue}>{formatDate(meta.issueDate)}</Text>
            </Text>
            <Text style={styles.metaLine}>
              Due: <Text style={styles.metaValue}>{formatDate(meta.dueDate)}</Text>
            </Text>
          </View>
        </View>

        {/* Bill to */}
        <View style={styles.billRow}>
          <View style={styles.block}>
            <Text style={styles.sectionLabel}>Bill to</Text>
            <Text style={styles.strong}>{client.name || '—'}</Text>
            {client.abn ? <Text style={styles.muted}>ABN: {formatABN(client.abn)}</Text> : null}
            {client.address ? <Text style={styles.muted}>{client.address}</Text> : null}
            {client.email ? <Text style={styles.muted}>{client.email}</Text> : null}
          </View>
          <View>
            <Text style={styles.sectionLabel}>Amount due</Text>
            <Text style={{ fontFamily: 'Times-Bold', fontSize: 18, color: C.emerald, textAlign: 'right' }}>
              {formatCurrency(totals.total)}
            </Text>
          </View>
        </View>

        {/* Items table */}
        <View style={styles.table}>
          <View style={styles.th}>
            <Text style={[styles.thText, styles.cDesc]}>Description</Text>
            <Text style={[styles.thText, styles.cQty]}>Qty</Text>
            <Text style={[styles.thText, styles.cRate]}>Rate</Text>
            <Text style={[styles.thText, styles.cAmt]}>Amount</Text>
          </View>
          {items.length === 0 ? (
            <View style={styles.tr}>
              <Text style={[styles.cDesc, styles.muted]}>No items yet.</Text>
            </View>
          ) : (
            items.map((it) => (
              <View style={styles.tr} key={it.id} wrap={false}>
                <Text style={styles.cDesc}>{it.description || '—'}</Text>
                <Text style={styles.cQty}>
                  {Number(it.quantity) || 0} {it.unit !== 'fixed' ? it.unit : ''}
                </Text>
                <Text style={styles.cRate}>{formatCurrency(Number(it.rate) || 0)}</Text>
                <Text style={styles.cAmt}>{formatCurrency(lineSubtotal(it))}</Text>
              </View>
            ))
          )}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text>{formatCurrency(totals.subtotal)}</Text>
          </View>
          {gstRegistered ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GST (10%)</Text>
              <Text>{formatCurrency(totals.gst)}</Text>
            </View>
          ) : null}
          <View style={styles.grandWrap}>
            <Text style={styles.grandLabel}>Total ({'AUD'})</Text>
            <Text style={styles.grandValue}>{formatCurrency(totals.total)}</Text>
          </View>
        </View>

        {/* Footer: compliance + payment + notes */}
        <View style={styles.footer}>
          <View style={styles.declaration}>
            {footerLines.map((line, i) => (
              <Text key={i} style={styles.declarationText}>
                {line}
              </Text>
            ))}
          </View>

          <View style={styles.payGrid}>
            {hasPayment ? (
              <View style={styles.payCol}>
                <Text style={styles.sectionLabel}>Payment details</Text>
                {payment.bankName ? <Text style={styles.notes}>Bank: {payment.bankName}</Text> : null}
                {payment.accountName ? <Text style={styles.notes}>Account name: {payment.accountName}</Text> : null}
                {payment.bsb ? <Text style={styles.notes}>BSB: {payment.bsb}</Text> : null}
                {payment.accountNumber ? <Text style={styles.notes}>Account no: {payment.accountNumber}</Text> : null}
                {payment.payId ? <Text style={styles.notes}>PayID: {payment.payId}</Text> : null}
              </View>
            ) : null}
            {notes ? (
              <View style={styles.payCol}>
                <Text style={styles.sectionLabel}>Notes</Text>
                <Text style={styles.notes}>{notes}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Page>
    </Document>
  )
}
