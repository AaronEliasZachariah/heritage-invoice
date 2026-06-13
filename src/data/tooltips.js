// Educational guardrails. Short, plain-English explanations of *why* a field
// matters — surfaced as non-intrusive tooltips beside each input. Sourced from
// current ATO and business.gov.au guidance (see src/lib/compliance.js SOURCES).

export const tooltips = {
  gstToggle: {
    title: 'Are you registered for GST?',
    body: "GST registration is mandatory once your annual turnover reaches $75,000 (or $150,000 for non-profits). Below that it's optional. If you're registered you charge 10% GST and issue a “Tax Invoice”; if not, you charge no GST and issue a plain “Invoice”. Using the words “tax invoice” when you aren't registered isn't allowed.",
  },
  documentTitle: {
    title: 'Invoice vs Tax Invoice',
    body: 'The title changes automatically based on your GST status. Only a GST-registered business may issue a document titled “Tax Invoice”. This isn\'t cosmetic — your client needs a valid tax invoice to claim a GST credit.',
  },
  supplierAbn: {
    title: 'What is an ABN?',
    body: 'An Australian Business Number is a unique 11-digit ID for your business. It must appear on your invoices. If you leave it off, a business client is generally required to withhold 47% of any payment over $75 and send it to the ATO — so always include it.',
  },
  supplierName: {
    title: 'Your identity',
    body: 'Your name or registered business/trading name must appear on every invoice so the ATO and your client can identify the supplier.',
  },
  supplierAddress: {
    title: 'Business contact',
    body: 'Not strictly mandated by the ATO, but an address and contact details make your invoice look professional and help clients reach you about payment.',
  },
  clientName: {
    title: "Your client's details",
    body: 'For invoices of $1,000 or more, the ATO requires the buyer to be identified — by name or ABN. For smaller invoices it\'s optional but recommended so your client can match the payment.',
  },
  clientAbn: {
    title: "Client's ABN (optional)",
    body: "If your client is a business, recording their ABN is good practice and helps identify them on invoices of $1,000 or more.",
  },
  issueDate: {
    title: 'Date of issue',
    body: 'The date you issue the invoice is a required field. It starts the clock on your payment terms.',
  },
  dueDate: {
    title: 'Payment due date',
    body: "A clear due date sets expectations and strengthens your position if a payment is late. Common terms are 7, 14, or 30 days from the issue date.",
  },
  invoiceNumber: {
    title: 'Invoice number',
    body: 'A unique, sequential number per invoice keeps your records clean and makes it easy to reference a specific invoice with your client or accountant.',
  },
  lineItems: {
    title: 'Itemising your work',
    body: 'The ATO requires a brief description of what you sold, with quantity (e.g. hours) and price. Clear line items reduce disputes and make the total easy to verify.',
  },
  rate: {
    title: 'Rate (excluding GST)',
    body: 'Enter your rate before GST. If you\'re registered for GST, 10% is added automatically on top of the subtotal so GST is exactly 1/11th of the total — exactly how the ATO expects it.',
  },
  notes: {
    title: 'Notes & payment terms',
    body: 'Use this space for payment instructions, bank details, or a thank-you. Anything here appears at the bottom of the invoice.',
  },
  aiPrompt: {
    title: 'Describe the job in plain English',
    body: 'Tell the assistant what you did, for whom, and your rate — e.g. “40 hours of web development at $90/hr for Acme Pty Ltd”. It fills in the invoice for you; you review and refine before exporting.',
  },
}
