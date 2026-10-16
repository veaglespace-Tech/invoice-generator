'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Printer,
  Plus,
  Trash2,
  Hexagon,
  Loader2,
  Download,
  Share2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

const numberToWords = (num) => {
  if (num === 0) return 'Zero';
  const a = [
    '',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen'
  ];
  const b = [
    '',
    '',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety'
  ];
  const numStr = Math.floor(num).toString();
  if (numStr.length > 9) return 'Overflow';
  const n = ('000000000' + numStr)
    .slice(-9)
    .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str +=
    Number(n[1]) != 0
      ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) +
        ' crore '
      : '';
  str +=
    Number(n[2]) != 0
      ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) +
        ' lakh '
      : '';
  str +=
    Number(n[3]) != 0
      ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) +
        ' thousand '
      : '';
  str +=
    Number(n[4]) != 0
      ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) +
        ' hundred '
      : '';
  str +=
    Number(n[5]) != 0
      ? (str != '' ? 'and ' : '') +
        (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])])
      : '';
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [isLoadingInvoice, setIsLoadingInvoice] = useState(true);
  const [orgProfile, setOrgProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [focusedItemId, setFocusedItemId] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerMode, setCustomerMode] = useState('existing');

  const [invoiceData, setInvoiceData] = useState({
    type: 'SALES',
    status: 'GENERATED',
    paymentDetails: '',
    invoiceNumber: '',
    customerId: null,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    currency: '₹',
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientCity: '',
    clientState: '',
    clientPincode: '',
    clientGst: '',
    clientPan: '',
    notes: '',
    taxRate: 18,
    discount: 0,
    discountType: 'amount',
    taxType: 'AUTO',
    supplierStateCode: '',
    transactionType: 'Services',
    merchantId: '',
    hsnCode: '',
    signatureName: '',
    signatureLocation: '',
    termsConditions: '',
    documentRef: '',
    documentDate: '',
    category: 'B2B',
    documentType: 'INV',
    irn: ''
  });

  const [items, setItems] = useState([
    {
      id: '1',
      description: '',
      hsn: '',
      qty: 1,
      rate: ''
    }
  ]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [orgRes, productsRes, customersRes] = await Promise.all([
          fetchApi('/organizations/me'),
          fetchApi('/products'),
          fetchApi('/customers')
        ]);

        if (orgRes.success && orgRes.data) {
          setOrgProfile(orgRes.data);
        }
        if (productsRes.success && productsRes.data) {
          setProducts(productsRes.data);
        }
        if (customersRes.success && customersRes.data) {
          setCustomers(customersRes.data);
        }

        if (id) {
          const invRes = await fetchApi(`/invoices/${id}`);
          if (invRes.success && invRes.data) {
            const inv = invRes.data;
            const cust = inv.customer || {};

            setInvoiceData((prev) => ({
              ...prev,
              type: inv.type || 'SALES',
              status: inv.status || 'GENERATED',
              invoiceNumber: inv.invoice_number,
              customerId: inv.customer_id,
              paymentDetails: inv.payment_details || '',
              issueDate: inv.invoice_date
                ? new Date(inv.invoice_date).toISOString().split('T')[0]
                : prev.issueDate,
              dueDate: inv.due_date
                ? new Date(inv.due_date).toISOString().split('T')[0]
                : prev.dueDate,
              clientName: cust.customer_name || '',
              clientCompany: cust.company_name || '',
              clientEmail: cust.email || '',
              clientPhone: cust.phone || '',
              clientAddress: cust.billing_address || '',
              clientCity: cust.city || '',
              clientState: cust.state || '',
              clientPincode: cust.pincode || '',
              clientGst: cust.GSTIN || '',
              clientPan: cust.PAN || '',
              notes: inv.notes || '',
              termsConditions: inv.terms || '',
              documentRef: inv.document_ref_no || '',
              documentDate: inv.document_date
                ? new Date(inv.document_date).toISOString().split('T')[0]
                : '',
              category: inv.category || 'B2B',
              documentType: inv.document_type_code || 'INV',
              irn: inv.irn || '',
              taxType: inv.tax_type || 'AUTO',
              discount: Number(inv.discount) || 0
            }));

            if (inv.items && inv.items.length > 0) {
              setItems(
                inv.items.map((it, idx) => ({
                  id: it.id || String(idx + 1),
                  description: it.description || '',
                  hsn: it.hsn_code || '',
                  qty: Number(it.quantity) || 1,
                  rate: Number(it.rate) || 0
                }))
              );
              if (inv.items[0]?.tax_rate !== undefined) {
                setInvoiceData((prev) => ({
                  ...prev,
                  taxRate: Number(inv.items[0].tax_rate)
                }));
              }
            }
          } else {
            toast.error('Failed to load invoice details');
          }
        }
      } catch (err) {
        console.error('Failed to load invoice for editing', err);
        toast.error('Failed to load invoice');
      } finally {
        setIsLoadingInvoice(false);
      }
    };

    loadInitialData();
  }, [id]);

  const updateData = (field, value) => {
    setInvoiceData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        description: '',
        hsn: '',
        qty: 1,
        rate: ''
      }
    ]);
  };

  const removeItem = (itemId) => {
    if (items.length <= 1) {
      toast.error('At least one item is required');
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateItem = (itemId, field, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: value
            }
          : item
      )
    );
  };

  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('invoice-preview');
    if (!element) return;
    setIsDownloading(true);
    try {
      const htmlToImage = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      const captureWidth = element.scrollWidth;
      const captureHeight = element.scrollHeight;

      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1,
        pixelRatio: 2,
        width: captureWidth,
        height: captureHeight,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });

      const pdfWidth = 210;
      const pdfHeight = (captureHeight * pdfWidth) / captureWidth;
      const finalPdfHeight = Math.max(297, pdfHeight);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, finalPdfHeight]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceData.invoiceNumber || 'invoice'}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      toast.error('Failed to download PDF. Please use Print as fallback.');
    } finally {
      setIsDownloading(false);
    }
  };

  const validateInvoiceInputs = () => {
    if (customerMode === 'new') {
      if (!invoiceData.clientName || !invoiceData.clientName.trim()) {
        toast.error(
          invoiceData.type === 'PURCHASE'
            ? 'Please enter a vendor name.'
            : 'Please enter customer name.'
        );
        return false;
      }
      if (invoiceData.clientEmail && invoiceData.clientEmail.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(invoiceData.clientEmail.trim())) {
          toast.error('Please enter a valid customer email address.');
          return false;
        }
      }
    } else {
      if (!invoiceData.customerId) {
        toast.error(
          invoiceData.type === 'PURCHASE'
            ? 'Please select an existing vendor.'
            : 'Please select an existing customer from dropdown.'
        );
        return false;
      }
    }

    if (!items || items.length === 0) {
      toast.error('Please add at least one item.');
      return false;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.description || !item.description.trim()) {
        toast.error(`Please enter a description for Item #${i + 1}.`);
        return false;
      }
      const qty = Number(item.qty);
      if (isNaN(qty) || qty <= 0) {
        toast.error(`Quantity must be greater than 0 for Item #${i + 1}.`);
        return false;
      }
      const rate = Number(item.rate);
      if (item.rate === '' || item.rate === null || isNaN(rate) || rate < 0) {
        toast.error(`Please enter a valid rate for Item #${i + 1}.`);
        return false;
      }
    }

    return true;
  };

  const buildInvoicePayload = () => {
    const subtotalCalc = items.reduce(
      (sum, item) => sum + item.qty * item.rate,
      0
    );
    const totalDiscountAmount =
      invoiceData.discountType === 'percentage'
        ? (subtotalCalc * invoiceData.discount) / 100
        : Number(invoiceData.discount);

    const formattedItems = items.map((item) => ({
      description: item.description.trim(),
      hsn_code: item.hsn || invoiceData.hsnCode || null,
      quantity: Number(item.qty),
      rate: Number(item.rate),
      tax_rate: Number(invoiceData.taxRate) || 0,
      discount: totalDiscountAmount / (items.length || 1)
    }));

    const payload = {
      type: invoiceData.type,
      invoice_number: invoiceData.invoiceNumber || null,
      invoice_date: invoiceData.issueDate,
      due_date: invoiceData.dueDate,
      notes: invoiceData.notes,
      terms: invoiceData.termsConditions || 'Thank you for your business.',
      document_ref_no: invoiceData.documentRef || null,
      document_date: invoiceData.documentDate || null,
      category: invoiceData.category || null,
      document_type_code: invoiceData.documentType || null,
      irn: invoiceData.irn || null,
      tax_type: invoiceData.taxType,
      status: invoiceData.status,
      payment_details: invoiceData.paymentDetails || null,
      items: formattedItems
    };

    if (customerMode === 'existing' && invoiceData.customerId) {
      payload.customer_id = invoiceData.customerId;
    } else {
      payload.customer = {
        customer_name: (invoiceData.clientName || 'Unknown Client').trim(),
        company_name: invoiceData.clientCompany?.trim() || null,
        email: invoiceData.clientEmail?.trim() || null,
        phone: invoiceData.clientPhone?.trim() || null,
        billing_address: invoiceData.clientAddress?.trim() || null,
        city: invoiceData.clientCity?.trim() || null,
        state: invoiceData.clientState?.trim() || null,
        country: 'India',
        pincode: invoiceData.clientPincode?.trim() || null,
        GSTIN: invoiceData.clientGst?.trim() || null,
        PAN: invoiceData.clientPan?.trim() || null
      };
    }

    return payload;
  };

  const handleSave = async () => {
    if (!validateInvoiceInputs()) return;

    setIsSaving(true);
    try {
      const payload = buildInvoicePayload();
      const invoiceRes = await fetchApi(`/invoices/${id}`, {
        method: 'PUT',
        data: payload
      });

      if (invoiceRes.success) {
        toast.success('Invoice updated successfully!');
        router.push(`/invoices/${id}`);
      } else {
        throw new Error(invoiceRes.message || 'Failed to update invoice.');
      }
    } catch (error) {
      console.error('Save error', error);
      toast.error(error.message || 'Failed to update invoice.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!invoiceData.clientEmail) {
      toast.error('Please enter a customer email address first.');
      return;
    }
    if (!validateInvoiceInputs()) return;

    setIsDownloading(true);
    try {
      const payload = buildInvoicePayload();
      const invoiceRes = await fetchApi(`/invoices/${id}`, {
        method: 'PUT',
        data: payload
      });

      if (invoiceRes.success) {
        const element = document.getElementById('invoice-preview');
        let pdfBase64 = '';
        if (element) {
          const htmlToImage = await import('html-to-image');
          const { jsPDF } = await import('jspdf');
          const captureWidth = element.scrollWidth;
          const captureHeight = element.scrollHeight;
          const dataUrl = await htmlToImage.toPng(element, {
            quality: 1,
            pixelRatio: 2,
            width: captureWidth,
            height: captureHeight,
            style: { transform: 'scale(1)', transformOrigin: 'top left' }
          });
          const pdfWidth = 210;
          const pdfHeight = (captureHeight * pdfWidth) / captureWidth;
          const finalPdfHeight = Math.max(297, pdfHeight);
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [pdfWidth, finalPdfHeight]
          });
          pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdfBase64 = pdf.output('datauristring').split(',')[1];
        }

        const sendRes = await fetchApi(`/invoices/${id}/send`, {
          method: 'POST',
          data: { pdfBase64 }
        });
        if (sendRes.success) {
          toast.success('Invoice updated and sent successfully to the email!');
          router.push(`/invoices/${id}`);
        } else {
          toast.error(
            'Invoice updated, but failed to send email: ' + (sendRes.message || '')
          );
          router.push(`/invoices/${id}`);
        }
      } else {
        throw new Error(invoiceRes.message || 'Failed to update invoice');
      }
    } catch (err) {
      console.error('Failed to process share', err);
      toast.error(err.message || 'Failed to share invoice via email.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Calculations for live preview
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const totalDiscountAmount =
    invoiceData.discountType === 'percentage'
      ? (subtotal * invoiceData.discount) / 100
      : Number(invoiceData.discount);

  const taxAmount =
    (subtotal - totalDiscountAmount) * (invoiceData.taxRate / 100);
  const total = subtotal - totalDiscountAmount + taxAmount;

  let isInterstate = false;
  if (invoiceData.taxType === 'IGST') {
    isInterstate = true;
  } else if (invoiceData.taxType === 'CGST_SGST') {
    isInterstate = false;
  } else {
    const orgState = (orgProfile?.state || '').trim().toLowerCase();
    const clientState = (invoiceData.clientState || '').trim().toLowerCase();
    if (clientState === '') {
      isInterstate = false;
    } else {
      isInterstate = orgState !== '' && orgState !== clientState;
    }
  }

  const cgst = isInterstate ? 0 : taxAmount / 2;
  const sgst = isInterstate ? 0 : taxAmount / 2;
  const igst = isInterstate ? taxAmount : 0;

  if (isLoadingInvoice) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href={`/invoices/${id}`}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Edit Invoice #{invoiceData.invoiceNumber}
            </h1>
            <p className="text-xs text-slate-500">
              Update details and preview live changes
            </p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleShare}
            disabled={isDownloading || isSaving}
            className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 p-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            <Share2 className="w-5 h-5 md:w-4 md:h-4" />{' '}
            <span className="hidden md:inline">Save & Email</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5 md:w-4 md:h-4" />{' '}
            <span className="hidden md:inline">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 p-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Printer className="w-5 h-5 md:w-4 md:h-4" />{' '}
            <span className="hidden md:inline">Print</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="bg-slate-900 hover:bg-slate-800 text-white p-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {isDownloading ? (
              <Loader2 className="w-5 h-5 md:w-4 md:h-4 animate-spin" />
            ) : (
              <Download className="w-5 h-5 md:w-4 md:h-4" />
            )}
            <span className="hidden md:inline">Download PDF</span>
          </button>
        </div>
      </div>

      {/* Form and Preview Layout */}
      <div className="flex flex-col gap-8">
        {/* Editor Form Card */}
        <div className="w-full">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Type and Status */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  Invoice Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">
                      Invoice Type
                    </label>
                    <select
                      value={invoiceData.type}
                      onChange={(e) => updateData('type', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                    >
                      <option value="SALES">Sales Invoice</option>
                      <option value="PURCHASE">Purchase Invoice</option>
                      <option value="EXPENSE">Expense Invoice</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">
                      Status
                    </label>
                    <select
                      value={invoiceData.status}
                      onChange={(e) => updateData('status', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="GENERATED">Generated</option>
                      <option value="SENT">Sent</option>
                      <option value="PAID">Paid</option>
                      <option value="PARTIALLY_PAID">Partially Paid</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">
                      Invoice No.
                    </label>
                    <input
                      type="text"
                      value={invoiceData.invoiceNumber}
                      onChange={(e) =>
                        updateData('invoiceNumber', e.target.value)
                      }
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={invoiceData.issueDate}
                      onChange={(e) => updateData('issueDate', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={invoiceData.dueDate}
                      onChange={(e) => updateData('dueDate', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">
                      Payment Details
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UPI, NEFT, Cheque..."
                      value={invoiceData.paymentDetails}
                      onChange={(e) =>
                        updateData('paymentDetails', e.target.value)
                      }
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Customer / Client Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {invoiceData.type === 'PURCHASE' || invoiceData.type === 'EXPENSE'
                      ? 'Supplier / Vendor Details'
                      : 'Customer Details'}
                  </h3>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
                    <button
                      type="button"
                      onClick={() => setCustomerMode('existing')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        customerMode === 'existing'
                          ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      Existing Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerMode('new')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        customerMode === 'new'
                          ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      Edit Customer Info
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-medium text-slate-500">
                      Customer Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={invoiceData.clientName}
                        onChange={(e) => {
                          updateData('clientName', e.target.value);
                          if (customerMode === 'existing') {
                            setShowCustomerDropdown(true);
                          }
                        }}
                        onFocus={() => {
                          if (customerMode === 'existing') {
                            setShowCustomerDropdown(true);
                          }
                        }}
                        onBlur={() =>
                          setTimeout(() => setShowCustomerDropdown(false), 200)
                        }
                        placeholder="Search or enter customer name..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                      />

                      {showCustomerDropdown && customers.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded shadow-lg max-h-48 overflow-y-auto">
                          {customers
                            .filter((c) =>
                              c.customer_name
                                .toLowerCase()
                                .includes(invoiceData.clientName.toLowerCase())
                            )
                            .map((c) => (
                              <div
                                key={c.id}
                                className="p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setInvoiceData((prev) => ({
                                    ...prev,
                                    customerId: c.id,
                                    clientName: c.customer_name,
                                    clientCompany: c.company_name || '',
                                    clientEmail: c.email || '',
                                    clientPhone: c.phone || '',
                                    clientAddress: c.billing_address || '',
                                    clientCity: c.city || '',
                                    clientState: c.state || '',
                                    clientPincode: c.pincode || '',
                                    clientGst: c.GSTIN || '',
                                    clientPan: c.PAN || ''
                                  }));
                                  setShowCustomerDropdown(false);
                                }}
                              >
                                <div className="font-medium text-slate-900 dark:text-white">
                                  {c.customer_name}
                                </div>
                                {c.email && (
                                  <div className="text-xs text-slate-500">
                                    {c.email}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={invoiceData.clientCompany}
                        onChange={(e) =>
                          updateData('clientCompany', e.target.value)
                        }
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">
                        Email
                      </label>
                      <input
                        type="email"
                        value={invoiceData.clientEmail}
                        onChange={(e) =>
                          updateData('clientEmail', e.target.value)
                        }
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={invoiceData.clientPhone}
                        onChange={(e) =>
                          updateData('clientPhone', e.target.value)
                        }
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">
                      Address (No length limit)
                    </label>
                    <textarea
                      rows={2}
                      value={invoiceData.clientAddress}
                      onChange={(e) =>
                        updateData('clientAddress', e.target.value)
                      }
                      placeholder="Enter full address..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">
                        City
                      </label>
                      <input
                        type="text"
                        value={invoiceData.clientCity}
                        onChange={(e) =>
                          updateData('clientCity', e.target.value)
                        }
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">
                        State / POS
                      </label>
                      <input
                        type="text"
                        value={invoiceData.clientState}
                        onChange={(e) =>
                          updateData('clientState', e.target.value)
                        }
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={invoiceData.clientPincode}
                        onChange={(e) =>
                          updateData('clientPincode', e.target.value)
                        }
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">
                        GSTIN
                      </label>
                      <input
                        type="text"
                        value={invoiceData.clientGst}
                        onChange={(e) =>
                          updateData('clientGst', e.target.value)
                        }
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white uppercase"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">
                        PAN
                      </label>
                      <input
                        type="text"
                        value={invoiceData.clientPan}
                        onChange={(e) =>
                          updateData('clientPan', e.target.value)
                        }
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Items
                  </h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2 relative group"
                    >
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="absolute -top-2 -right-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-20"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      <div className="relative">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, 'description', e.target.value)
                          }
                          onFocus={() => setFocusedItemId(item.id)}
                          onBlur={() =>
                            setTimeout(() => setFocusedItemId(null), 200)
                          }
                          placeholder="Item name / description"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {focusedItemId === item.id && products.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded shadow-lg max-h-40 overflow-y-auto">
                            {products
                              .filter((p) =>
                                p.name
                                  .toLowerCase()
                                  .includes((item.description || '').toLowerCase())
                              )
                              .map((p) => (
                                <div
                                  key={p.id}
                                  className="p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex justify-between"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    updateItem(item.id, 'description', p.name);
                                    updateItem(
                                      item.id,
                                      'rate',
                                      Number(p.price) || 0
                                    );
                                    if (p.HSN) {
                                      updateItem(item.id, 'hsn', p.HSN);
                                    }
                                    setFocusedItemId(null);
                                  }}
                                >
                                  <span className="font-medium text-slate-900 dark:text-white">
                                    {p.name}
                                  </span>
                                  <span className="text-slate-500">
                                    ₹{Number(p.price).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500">
                            HSN Code
                          </label>
                          <input
                            type="text"
                            value={item.hsn}
                            onChange={(e) =>
                              updateItem(item.id, 'hsn', e.target.value)
                            }
                            placeholder="Optional"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                'qty',
                                e.target.value === ''
                                  ? ''
                                  : Number(e.target.value)
                              )
                            }
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">
                            Rate (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                'rate',
                                e.target.value === ''
                                  ? ''
                                  : Number(e.target.value)
                              )
                            }
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax & Discount */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  Tax & Adjustments
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">
                      GST Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={invoiceData.taxRate}
                      onChange={(e) =>
                        updateData(
                          'taxRate',
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">
                      Tax Treatment
                    </label>
                    <select
                      value={invoiceData.taxType}
                      onChange={(e) => updateData('taxType', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                    >
                      <option value="AUTO">Auto (Based on State)</option>
                      <option value="IGST">Force IGST</option>
                      <option value="CGST_SGST">Force CGST/SGST</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">
                      Discount
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        value={invoiceData.discount}
                        onChange={(e) =>
                          updateData(
                            'discount',
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                        className="w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                      />
                      <select
                        value={invoiceData.discountType}
                        onChange={(e) =>
                          updateData('discountType', e.target.value)
                        }
                        className="w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                      >
                        <option value="amount">₹ (Fixed)</option>
                        <option value="percentage">% (Percentage)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={invoiceData.notes}
                      onChange={(e) => updateData('notes', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live A4 Preview Section */}
        <div className="w-full pb-12 flex justify-start sm:justify-center items-start print:p-0 print:m-0 print:block bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl overflow-x-auto">
          <div
            id="invoice-preview"
            className="w-[210mm] min-w-[210mm] min-h-[297mm] bg-white text-black p-8 shadow-2xl relative flex flex-col print:shadow-none print:w-full print:min-h-0 font-sans text-[10px] leading-tight"
          >
            {/* Outer Box */}
            <div className="border border-black flex flex-col box-border">
              {/* Header */}
              <div className="flex border-b border-black min-h-[120px]">
                <div className="flex-1 p-2 flex border-r border-black items-center">
                  <div className="w-40 flex-shrink-0">
                    {orgProfile?.logo ? (
                      <img
                        src={orgProfile.logo}
                        alt="Logo"
                        className="max-h-20 max-w-full object-contain"
                      />
                    ) : (
                      <span className="font-extrabold text-3xl tracking-tight">
                        {orgProfile?.name || 'Company Name'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="text-base mb-1 font-bold">
                      {orgProfile?.legal_name ||
                        orgProfile?.name ||
                        'Company Name'}
                    </div>
                    <div className="text-[10px] text-gray-700 leading-tight">
                      {orgProfile?.address || ''}
                    </div>
                    <div className="text-[10px] text-gray-700">
                      {[orgProfile?.city, orgProfile?.state, orgProfile?.pincode]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                    {orgProfile?.GSTIN && (
                      <div className="text-[10px] font-semibold mt-0.5">
                        GSTIN: {orgProfile.GSTIN}
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-[180px] p-2 flex flex-col items-center justify-center text-center">
                  <div className="text-xs font-bold uppercase tracking-wider mb-2">
                    {invoiceData.type === 'PURCHASE'
                      ? 'Purchase Invoice'
                      : invoiceData.type === 'EXPENSE'
                        ? 'Expense Voucher'
                        : 'Tax Invoice'}
                  </div>
                  <QRCodeSVG
                    value={`UPI://PAY?PA=${orgProfile?.settings?.merchant_id || ''}&PN=${encodeURIComponent(orgProfile?.name || '')}&AM=${total.toFixed(2)}&CU=INR`}
                    size={64}
                  />
                  <div className="text-[8px] text-gray-500 mt-1">Scan to Pay</div>
                </div>
              </div>

              {/* Meta details */}
              <div className="grid grid-cols-2 border-b border-black text-[10px]">
                <div className="border-r border-black p-2 flex flex-col gap-1">
                  <div>
                    <span className="font-semibold">Invoice No:</span>{' '}
                    {invoiceData.invoiceNumber}
                  </div>
                  <div>
                    <span className="font-semibold">Invoice Date:</span>{' '}
                    {new Date(invoiceData.issueDate).toLocaleDateString('en-GB')}
                  </div>
                  <div>
                    <span className="font-semibold">Due Date:</span>{' '}
                    {new Date(invoiceData.dueDate).toLocaleDateString('en-GB')}
                  </div>
                </div>
                <div className="p-2 flex flex-col gap-1">
                  <div>
                    <span className="font-semibold">Place of Supply:</span>{' '}
                    {invoiceData.clientState || orgProfile?.state || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span>{' '}
                    <span className="font-bold">{invoiceData.status}</span>
                  </div>
                  {invoiceData.paymentDetails && (
                    <div>
                      <span className="font-semibold">Payment:</span>{' '}
                      {invoiceData.paymentDetails}
                    </div>
                  )}
                </div>
              </div>

              {/* Bill To / Billed By */}
              <div className="grid grid-cols-2 border-b border-black text-[10px]">
                <div className="border-r border-black p-2">
                  <div className="font-bold mb-1">Details of Receiver (Billed To):</div>
                  <div className="font-semibold text-xs uppercase">
                    {invoiceData.clientName || 'N/A'}
                  </div>
                  {invoiceData.clientCompany && (
                    <div className="text-gray-700">{invoiceData.clientCompany}</div>
                  )}
                  {invoiceData.clientAddress && (
                    <div className="text-gray-700 whitespace-pre-wrap break-words mt-0.5">
                      {invoiceData.clientAddress}
                    </div>
                  )}
                  <div>
                    {[
                      invoiceData.clientCity,
                      invoiceData.clientState,
                      invoiceData.clientPincode
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                  {invoiceData.clientPhone && (
                    <div>Phone: {invoiceData.clientPhone}</div>
                  )}
                  {invoiceData.clientEmail && (
                    <div>Email: {invoiceData.clientEmail}</div>
                  )}
                  {invoiceData.clientGst && (
                    <div className="font-semibold mt-0.5">
                      GSTIN: {invoiceData.clientGst}
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <div className="font-bold mb-1">Details of Consignee (Shipped To):</div>
                  <div className="text-gray-600 italic">
                    Same as Billing Address
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr className="border-b border-black bg-slate-50 font-semibold">
                    <th className="border-r border-black p-1 text-center w-8">#</th>
                    <th className="border-r border-black p-1 text-left">Description</th>
                    <th className="border-r border-black p-1 text-center w-16">HSN</th>
                    <th className="border-r border-black p-1 text-center w-12">Qty</th>
                    <th className="border-r border-black p-1 text-right w-20">Rate (₹)</th>
                    <th className="p-1 text-right w-24">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-black">
                      <td className="border-r border-black p-1 text-center">
                        {idx + 1}
                      </td>
                      <td className="border-r border-black p-1 font-medium">
                        {item.description || 'Item Description'}
                      </td>
                      <td className="border-r border-black p-1 text-center text-gray-600">
                        {item.hsn || '-'}
                      </td>
                      <td className="border-r border-black p-1 text-center">
                        {item.qty}
                      </td>
                      <td className="border-r border-black p-1 text-right">
                        {Number(item.rate || 0).toFixed(2)}
                      </td>
                      <td className="p-1 text-right font-medium">
                        {(Number(item.qty || 0) * Number(item.rate || 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Section */}
              <div className="flex border-t border-black text-[10px]">
                <div className="flex-1 p-2 border-r border-black flex flex-col justify-between">
                  <div>
                    <span className="font-bold">Total in Words:</span>{' '}
                    <span className="italic">
                      {numberToWords(Math.round(total))} Rupees Only
                    </span>
                  </div>
                  {invoiceData.notes && (
                    <div className="mt-2 text-gray-600">
                      <span className="font-semibold">Notes:</span>{' '}
                      {invoiceData.notes}
                    </div>
                  )}
                </div>
                <div className="w-64 p-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Sub Total:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {totalDiscountAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount:</span>
                      <span>-₹{totalDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {isInterstate ? (
                    <div className="flex justify-between">
                      <span>IGST ({invoiceData.taxRate}%):</span>
                      <span>₹{igst.toFixed(2)}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>CGST ({invoiceData.taxRate / 2}%):</span>
                        <span>₹{cgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST ({invoiceData.taxRate / 2}%):</span>
                        <span>₹{sgst.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-black mt-1">
                    <span>Grand Total:</span>
                    <span>₹{Math.round(total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
