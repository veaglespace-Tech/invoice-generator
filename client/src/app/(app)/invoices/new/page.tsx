"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Printer, Plus, Trash2, Hexagon, Loader2, Download, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { fetchApi } from '@/lib/api';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';

interface LineItem {
  id: string;
  description: string;
  qty: number;
  rate: number;
}

interface OrgProfile {
  name: string;
  legal_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  logo: string | null;
  email: string | null;
  phone: string | null;
  fax: string | null;
  GSTIN: string | null;
  PAN: string | null;
  website: string | null;
  settings?: {
    supplier_state_code: string | null;
    transaction_type: string | null;
    merchant_id: string | null;
    hsn_code: string | null;
    signature_name: string | null;
    signature_location: string | null;
    terms_conditions: string | null;
    field_visibility: Record<string, boolean> | null;
  } | null;
}

const numberToWords = (num: number): string => {
  if (num === 0) return 'Zero';
  const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const numStr = Math.floor(num).toString();
  if (numStr.length > 9) return 'Overflow';
  
  const n = ('000000000' + numStr).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ''; 
  
  let str = '';
  str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + ' crore ' : '';
  str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + ' lakh ' : '';
  str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + ' thousand ' : '';
  str += (Number(n[4]) != 0) ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + ' hundred ' : '';
  str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) : '';
  
  return str.trim().replace(/\s+/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function InvoiceGenerator() {
  const [orgProfile, setOrgProfile] = useState<OrgProfile | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerMode, setCustomerMode] = useState<'new' | 'existing'>('new');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [orgRes, productsRes, customersRes, nextNumberRes] = await Promise.all([
          fetchApi<{ success: boolean; data: OrgProfile }>('/organizations/me'),
          fetchApi<{ success: boolean; data: any[] }>('/products'),
          fetchApi<{ success: boolean; data: any[] }>('/customers'),
          fetchApi<{ success: boolean; data: { invoice_number: string } }>('/invoices/next-number')
        ]);
        
        if (orgRes.success && orgRes.data) {
          setOrgProfile(orgRes.data);
          if (orgRes.data.settings) {
            setInvoiceData(prev => ({
              ...prev,
              supplierStateCode: orgRes.data.settings?.supplier_state_code || '',
              transactionType: orgRes.data.settings?.transaction_type || 'Services',
              merchantId: orgRes.data.settings?.merchant_id || '',
              hsnCode: orgRes.data.settings?.hsn_code || '',
              signatureName: orgRes.data.settings?.signature_name || '',
              signatureLocation: orgRes.data.settings?.signature_location || '',
              termsConditions: orgRes.data.settings?.terms_conditions || ''
            }));
          }
        }
        
        if (productsRes.success && productsRes.data) {
          setProducts(productsRes.data);
        }

        if (customersRes.success && customersRes.data) {
          setCustomers(customersRes.data);
        }

        if (nextNumberRes.success && nextNumberRes.data?.invoice_number) {
          setInvoiceData(prev => ({ ...prev, invoiceNumber: nextNumberRes.data.invoice_number }));
        }
      } catch (err) {
        console.error("Failed to load initial data for invoice preview", err);
      }
    };
    loadData();
  }, []);

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: '₹',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    clientCity: '',
    clientState: '',
    clientPincode: '',
    clientGst: '',
    clientPan: '',
    notes: '',
    taxRate: 18,
    discount: 0,
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
    irn: '',
  });

  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: '', qty: 1, rate: 0 },
  ]);

  const updateData = (field: string, value: string | number) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: Math.random().toString(), description: '', qty: 1, rate: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const [isSaving, setIsSaving] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('invoice-preview');
    if (!element) return;
    
    setIsDownloading(true);
    try {
      const htmlToImage = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      // Convert DOM to high quality PNG
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1,
        pixelRatio: 2, // High resolution
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });

      // A4 dimensions at 72 PPI
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate width and height to fit A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceData.invoiceNumber}.pdf`);
      
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Failed to download PDF. Please use the Print button as a fallback.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!invoiceData.clientEmail) {
      alert("Please enter a customer email address first.");
      return;
    }
    
    setIsDownloading(true);
    try {
      // 1. Create Customer silently
      const customerRes = await fetchApi<{ success: boolean; data: { id: string } }>('/customers', {
        method: 'POST',
        data: {
          customer_name: invoiceData.clientName || 'Unknown Client',
          email: invoiceData.clientEmail,
          billing_address: invoiceData.clientAddress
        }
      });

      if (!customerRes.success || !customerRes.data) {
        throw new Error('Failed to create customer record for invoice');
      }

      // 2. Format Items
      const formattedItems = items.map(item => ({
        description: item.description || 'Item',
        quantity: item.qty,
        rate: item.rate,
        tax_rate: invoiceData.taxRate,
        discount: invoiceData.discount / (items.length || 1)
      }));

      // 3. Create Invoice
      const invoiceRes = await fetchApi<{ success: boolean; data: any }>('/invoices', {
        method: 'POST',
        data: {
          customer_id: customerRes.data.id,
          invoice_number: invoiceData.invoiceNumber,
          invoice_date: invoiceData.issueDate,
          due_date: invoiceData.dueDate,
          notes: invoiceData.notes,
          terms: 'Thank you for your business.',
          document_ref_no: invoiceData.documentRef || null,
          document_date: invoiceData.documentDate || null,
          category: invoiceData.category || null,
          document_type_code: invoiceData.documentType || null,
          irn: invoiceData.irn || null,
          items: formattedItems
        }
      });

      if (invoiceRes.success && invoiceRes.data?.id) {
        // 4. Send Email
        const sendRes = await fetchApi<{ success: boolean; message: string }>(`/invoices/${invoiceRes.data.id}/send`, {
          method: 'POST'
        });

        if (sendRes.success) {
          alert('Invoice saved and sent successfully to the registered email!');
          window.location.href = '/invoices';
        } else {
          alert('Invoice saved, but failed to send email: ' + sendRes.message);
          window.location.href = '/invoices';
        }
      } else {
        throw new Error('Failed to create invoice');
      }
      
    } catch (err) {
      console.error("Failed to process share", err);
      alert("Failed to share invoice via email. Please check console for details.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Create Customer silently
      const customerRes = await fetchApi<{ success: boolean; data: { id: string } }>('/customers', {
        method: 'POST',
        data: {
          customer_name: invoiceData.clientName || 'Unknown Client',
          email: invoiceData.clientEmail,
          billing_address: invoiceData.clientAddress
        }
      });

      if (!customerRes.success || !customerRes.data) {
        throw new Error('Failed to create customer record for invoice');
      }

      // 2. Format Items
      const formattedItems = items.map(item => ({
        description: item.description || 'Item',
        quantity: item.qty,
        rate: item.rate,
        tax_rate: invoiceData.taxRate,
        discount: invoiceData.discount / (items.length || 1) // Distribute flat discount roughly
      }));

      // 3. Create Invoice
      const invoiceRes = await fetchApi<{ success: boolean }>('/invoices', {
        method: 'POST',
        data: {
          customer_id: customerRes.data.id,
          invoice_number: invoiceData.invoiceNumber,
          invoice_date: invoiceData.issueDate,
          due_date: invoiceData.dueDate,
          notes: invoiceData.notes,
          terms: 'Thank you for your business.',
          document_ref_no: invoiceData.documentRef || null,
          document_date: invoiceData.documentDate || null,
          category: invoiceData.category || null,
          document_type_code: invoiceData.documentType || null,
          irn: invoiceData.irn || null,
          items: formattedItems
        }
      });

      if (invoiceRes.success) {
        alert('Invoice saved successfully!');
        window.location.href = '/invoices';
      }
    } catch (error) {
      console.error('Save error', error);
      alert('Failed to save invoice. Please check the console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  const taxAmount = (subtotal - invoiceData.discount) * (invoiceData.taxRate / 100);
  const total = subtotal - invoiceData.discount + taxAmount;
  
  const isInterstate = (orgProfile?.state || '').trim().toLowerCase() !== (invoiceData.clientState || '').trim().toLowerCase();
  const cgstAmount = isInterstate ? 0 : taxAmount / 2;
  const sgstAmount = isInterstate ? 0 : taxAmount / 2;
  const igstAmount = isInterstate ? taxAmount : 0;

  return (
    <>
      {/* Header - Not printed */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Invoice Generator</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Live preview & PDF Export</p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={handleShare} disabled={isDownloading || isSaving} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 p-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70">
            <Share2 className="w-5 h-5 md:w-4 md:h-4" /> <span className="hidden md:inline">Share</span>
          </button>
          <button onClick={handleSave} disabled={isSaving} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 p-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Save className="w-5 h-5 md:w-4 md:h-4" /> <span className="hidden md:inline">{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
          <button onClick={handlePrint} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 p-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Printer className="w-5 h-5 md:w-4 md:h-4" /> <span className="hidden md:inline">Print</span>
          </button>
          <button onClick={handleDownloadPDF} disabled={isDownloading} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors shadow-sm shadow-indigo-200 dark:shadow-none flex items-center gap-2 disabled:opacity-70">
            {isDownloading ? <Loader2 className="w-5 h-5 md:w-4 md:h-4 animate-spin" /> : <Download className="w-5 h-5 md:w-4 md:h-4" />}
            <span className="hidden md:inline">{isDownloading ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8 pb-12">
        {/* TOP PANEL: Form Details */}
        <div className="w-full">
          <Card>
            <CardContent className="p-5 space-y-6">
              
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Invoice No.</label>
                    <input type="text" value={invoiceData.invoiceNumber} onChange={e => updateData('invoiceNumber', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Currency Symbol</label>
                    <input type="text" value={invoiceData.currency} onChange={e => updateData('currency', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Issue Date</label>
                    <input type="date" value={invoiceData.issueDate} onChange={e => updateData('issueDate', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Due Date</label>
                    <input type="date" value={invoiceData.dueDate} onChange={e => updateData('dueDate', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                  </div>
                  {orgProfile?.settings?.field_visibility?.documentRef && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">Document Ref No.</label>
                      <input type="text" value={invoiceData.documentRef} onChange={e => updateData('documentRef', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                    </div>
                  )}
                  {orgProfile?.settings?.field_visibility?.documentDate && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">Document Date</label>
                      <input type="date" value={invoiceData.documentDate} onChange={e => updateData('documentDate', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                    </div>
                  )}
                  {orgProfile?.settings?.field_visibility?.category && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">Category</label>
                      <input type="text" value={invoiceData.category} onChange={e => updateData('category', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                    </div>
                  )}
                  {orgProfile?.settings?.field_visibility?.documentType && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">Document Type Code</label>
                      <input type="text" value={invoiceData.documentType} onChange={e => updateData('documentType', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                    </div>
                  )}
                  {orgProfile?.settings?.field_visibility?.irn && (
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-medium text-slate-500">IRN</label>
                      <input type="text" value={invoiceData.irn} onChange={e => updateData('irn', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Client</h3>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
                    <button 
                      onClick={() => {
                        setCustomerMode('new');
                        setInvoiceData(prev => ({...prev, clientName: '', clientEmail: '', clientAddress: '', clientCity: '', clientState: '', clientPincode: '', clientGst: '', clientPan: ''}));
                      }}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${customerMode === 'new' ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      New Customer
                    </button>
                    <button 
                      onClick={() => {
                        setCustomerMode('existing');
                        setInvoiceData(prev => ({...prev, clientName: '', clientEmail: '', clientAddress: '', clientCity: '', clientState: '', clientPincode: '', clientGst: '', clientPan: ''}));
                      }}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${customerMode === 'existing' ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      Existing Customer
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-medium text-slate-500">Name</label>
                    {customerMode === 'new' ? (
                      <input 
                        type="text" 
                        value={invoiceData.clientName} 
                        onChange={e => updateData('clientName', e.target.value)} 
                        placeholder="Enter new customer name"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" 
                      />
                    ) : (
                      <div className="relative">
                        <input 
                          type="text" 
                          value={invoiceData.clientName} 
                          onChange={e => {
                            updateData('clientName', e.target.value);
                            setShowCustomerDropdown(true);
                          }} 
                          onFocus={() => setShowCustomerDropdown(true)}
                          onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                          placeholder="Type to search existing customers..."
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" 
                        />
                        {showCustomerDropdown && customers.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded shadow-lg max-h-48 overflow-y-auto">
                            {customers
                              .filter(c => c.customer_name.toLowerCase().includes(invoiceData.clientName.toLowerCase()))
                              .map(c => (
                                <div 
                                  key={c.id} 
                                  className="p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    setInvoiceData(prev => ({
                                      ...prev,
                                      clientName: c.customer_name,
                                      clientEmail: c.email || '',
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
                                  <div className="font-medium text-slate-900 dark:text-white">{c.customer_name}</div>
                                  {c.email && <div className="text-xs text-slate-500">{c.email}</div>}
                                </div>
                              ))
                            }
                            {invoiceData.clientName && customers.filter(c => c.customer_name.toLowerCase().includes(invoiceData.clientName.toLowerCase())).length === 0 && (
                              <div className="p-2 text-sm text-slate-500 text-center">No customers found</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Email</label>
                    <input type="email" value={invoiceData.clientEmail} onChange={e => updateData('clientEmail', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Address</label>
                    <textarea rows={2} value={invoiceData.clientAddress} onChange={e => updateData('clientAddress', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"></textarea>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">City</label>
                      <input type="text" value={invoiceData.clientCity} onChange={e => updateData('clientCity', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">State / POS</label>
                      <input type="text" value={invoiceData.clientState} onChange={e => updateData('clientState', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">Pincode</label>
                      <input type="text" value={invoiceData.clientPincode} onChange={e => updateData('clientPincode', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">GSTIN</label>
                      <input type="text" value={invoiceData.clientGst} onChange={e => updateData('clientGst', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white uppercase" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">PAN</label>
                      <input type="text" value={invoiceData.clientPan} onChange={e => updateData('clientPan', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white uppercase" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Items</h3>
                  <button onClick={addItem} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2 relative group">
                      <button onClick={() => removeItem(item.id)} className="absolute -top-2 -right-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-20">
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={item.description} 
                          onChange={e => updateItem(item.id, 'description', e.target.value)} 
                          onFocus={() => setFocusedItemId(item.id)}
                          onBlur={() => setTimeout(() => setFocusedItemId(null), 200)}
                          placeholder="Search product by Name or SKU..." 
                          className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" 
                        />
                        {focusedItemId === item.id && products.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded shadow-lg max-h-48 overflow-y-auto">
                            {products
                              .filter(p => p.name.toLowerCase().includes(item.description.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(item.description.toLowerCase())))
                              .map(p => (
                                <div 
                                  key={p.id} 
                                  className="p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                  onClick={() => {
                                    updateItem(item.id, 'description', p.name);
                                    updateItem(item.id, 'rate', Number(p.price || p.unit_price || 0));
                                  }}
                                >
                                  <div className="font-medium text-slate-900 dark:text-white">{p.name}</div>
                                  <div className="text-xs text-slate-500">
                                    {p.sku ? `SKU: ${p.sku} - ` : ''}₹{p.price || p.unit_price || 0}
                                  </div>
                                </div>
                              ))
                            }
                            {products.filter(p => p.name.toLowerCase().includes(item.description.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(item.description.toLowerCase()))).length === 0 && (
                              <div className="p-2 text-sm text-slate-500 text-center">No products found</div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-xs text-slate-500">Qty</span>
                          <input type="number" value={item.qty} onChange={e => updateItem(item.id, 'qty', Number(e.target.value))} className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-xs text-slate-500 whitespace-nowrap">Unit Price (₹)</span>
                          <input type="number" value={item.rate} onChange={e => updateItem(item.id, 'rate', Number(e.target.value))} className="w-full bg-white dark:bg-slate-950 border border-slate-400 dark:border-slate-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Totals & Notes</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Discount ({invoiceData.currency})</label>
                    <input type="number" value={invoiceData.discount} onChange={e => updateData('discount', Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Tax Rate (%)</label>
                    <input type="number" value={invoiceData.taxRate} onChange={e => updateData('taxRate', Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Notes (Visible on Invoice)</label>
                  <textarea rows={2} value={invoiceData.notes} onChange={e => updateData('notes', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"></textarea>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* BOTTOM PANEL: Live A4 Preview */}
        <div className="w-full pb-12 flex justify-center items-start print:p-0 print:m-0 print:block bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl overflow-x-auto">
          <div id="invoice-preview" className="w-[210mm] min-h-[297mm] bg-white text-black p-8 shadow-2xl relative flex flex-col print:shadow-none print:w-full print:min-h-0 font-sans text-[10px] leading-tight">
            
            {/* Main Outer Border Container */}
            <div className="border border-black flex flex-col box-border">
              
              {/* Header */}
            <div className="flex border-b border-black min-h-[120px]">
              <div className="flex-1 p-2 flex border-r border-black items-center">
                <div className="w-40 flex-shrink-0">
                  {orgProfile?.logo ? (
                    <img src={orgProfile.logo} alt="Logo" className="max-h-20 max-w-full object-contain" />
                  ) : (
                    <span className="font-extrabold text-3xl tracking-tight">{orgProfile?.name || 'Company Name'}</span>
                  )}
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="text-base mb-1 font-bold">{orgProfile?.legal_name || orgProfile?.name || 'Company Name'}</div>
                  <div className="text-[11px] leading-tight max-w-[80%] mx-auto whitespace-pre-wrap">{orgProfile?.address || 'Address not provided'}</div>
                </div>
              </div>
              <div className="w-[25%] p-2 flex items-center justify-center font-bold text-base tracking-wide">
                TAX INVOICE
              </div>
            </div>

            {/* Supplier Details */}
            <div className="flex border-b border-black text-[10px]">
              <div className="flex-1 p-1.5 border-r border-black flex"><span className="w-24">Supplier GSTIN:</span> <span>{orgProfile?.GSTIN || 'Not Provided'}</span></div>
              {(orgProfile?.settings?.field_visibility?.supplierPan ?? true) && (
                <div className="flex-1 p-1.5 border-r border-black flex"><span className="w-12">PAN:</span> <span>{orgProfile?.PAN || 'Not Provided'}</span></div>
              )}
              {(orgProfile?.settings?.field_visibility?.supplierStateCode ?? true) && (
                <div className="flex-1 p-1.5 flex"><span className="w-32">Supplier State Code:</span> <span>{invoiceData.supplierStateCode || (orgProfile?.state ? orgProfile.state.substring(0, 2).toUpperCase() : '06')}</span></div>
              )}
            </div>

            {/* Main Details & QR Code */}
            <div className="flex">
              <div className="flex-1 flex flex-col">
                <div className="flex border-b border-black text-[10px]">
                  <div className={(orgProfile?.settings?.field_visibility?.documentDate || orgProfile?.settings?.field_visibility?.documentRef) ? "w-1/2 p-1.5 border-r border-black flex gap-2" : "w-full p-1.5 flex gap-2"}>
                    <span className="text-gray-900">Document No:</span> <span>{invoiceData.invoiceNumber}</span>
                  </div>
                  {(orgProfile?.settings?.field_visibility?.documentDate || orgProfile?.settings?.field_visibility?.documentRef) && (
                    <div className="w-1/2 p-1.5 flex gap-2"><span className="text-gray-900">Invoice Date:</span> <span>{new Date(invoiceData.issueDate).toLocaleDateString('en-GB')}</span></div>
                  )}
                </div>
                
                {(!orgProfile?.settings?.field_visibility?.documentDate && !orgProfile?.settings?.field_visibility?.documentRef) && (
                  <div className="flex border-b border-black text-[10px]">
                    <div className="w-full p-1.5 flex gap-2"><span className="text-gray-900">Invoice Date:</span> <span>{new Date(invoiceData.issueDate).toLocaleDateString('en-GB')}</span></div>
                  </div>
                )}

                {(orgProfile?.settings?.field_visibility?.documentRef || orgProfile?.settings?.field_visibility?.documentDate) && (
                  <div className="flex border-b border-black text-[10px]">
                    {orgProfile?.settings?.field_visibility?.documentRef ? (
                      <div className={orgProfile?.settings?.field_visibility?.documentDate ? "w-1/2 p-1.5 border-r border-black flex gap-2" : "w-full p-1.5 flex gap-2"}><span className="text-gray-900">Document Ref No:</span> <span>{invoiceData.documentRef}</span></div>
                    ) : null}
                    {orgProfile?.settings?.field_visibility?.documentDate ? (
                      <div className={orgProfile?.settings?.field_visibility?.documentRef ? "w-1/2 p-1.5 flex gap-2" : "w-full p-1.5 flex gap-2"}><span className="text-gray-900">Document Date:</span> <span>{invoiceData.documentDate ? new Date(invoiceData.documentDate).toLocaleDateString('en-GB') : ''}</span></div>
                    ) : null}
                  </div>
                )}
                <div className="flex border-b border-black text-[10px]">
                  <div className={orgProfile?.settings?.field_visibility?.category ? "w-1/2 p-1.5 border-r border-black flex gap-2" : "w-full p-1.5 flex gap-2"}><span className="text-gray-900">Due Date:</span> <span>{new Date(invoiceData.dueDate).toLocaleDateString('en-GB')}</span></div>
                  {orgProfile?.settings?.field_visibility?.category && (
                    <div className="w-1/2 p-1.5 flex gap-2"><span className="text-gray-900">Category:</span> <span>{invoiceData.category}</span></div>
                  )}
                </div>
                {orgProfile?.settings?.field_visibility?.documentType && (
                  <div className="flex border-b border-black text-[10px]">
                    <div className="w-full p-1.5 flex gap-2"><span className="text-gray-900 w-[120px]">Document Type Code:</span> <span>{invoiceData.documentType}</span></div>
                  </div>
                )}
                {orgProfile?.settings?.field_visibility?.irn && (
                  <div className="flex border-b border-black text-[10px]">
                    <div className="w-full p-1.5 flex gap-2"><span className="text-gray-900 w-[120px]">IRN:</span> <span>{invoiceData.irn}</span></div>
                  </div>
                )}
                <div className="flex border-b border-black text-[10px]">
                  <div className={(orgProfile?.settings?.field_visibility?.customerPan ?? true) ? "w-1/2 p-1.5 border-r border-black flex gap-2" : "w-full p-1.5 flex gap-2"}><span className="text-gray-900">Details of customer(Billed to):</span></div>
                  {(orgProfile?.settings?.field_visibility?.customerPan ?? true) && (
                    <div className="w-1/2 p-1.5 flex gap-2"><span className="text-gray-900">PAN:</span> <span>{invoiceData.clientPan}</span></div>
                  )}
                </div>
              </div>
              {/* QR Code */}
              <div className="w-[25%] border-l border-b border-black flex items-center justify-center p-2 relative overflow-hidden">
                <QRCodeSVG 
                  value={`Invoice No: ${invoiceData.invoiceNumber}\nAmount: ₹${total}\nDate: ${invoiceData.issueDate}\nCustomer: ${invoiceData.clientName || 'N/A'}`}
                  size={120} 
                  level="M"
                  includeMargin={false}
                  className="w-full h-auto max-h-[140px]"
                />
              </div>
            </div>

            {/* Billed To Details */}
            <div className="flex flex-col border-b border-black text-[10px]">
                <div className="flex p-1.5">
                  <div className="w-24">Legal Name:</div>
                  <div className="flex-1 uppercase">{invoiceData.clientName || 'Select a customer'}</div>
                </div>
                <div className="flex p-1.5 pt-0">
                  <div className="w-24">Address:</div>
                  <div className="flex-1 whitespace-pre-wrap">{invoiceData.clientAddress}</div>
                </div>
                <div className="flex p-1.5 pt-0">
                  <div className="flex flex-1">
                    <div className="w-24">City:</div>
                    <div className="flex-1">{invoiceData.clientCity}</div>
                  </div>
                  <div className="flex flex-1">
                    <div className="w-36">Place of supply (POS):</div>
                    <div className="flex-1">{invoiceData.clientState}</div>
                  </div>
                  <div className="flex flex-1">
                    <div className="w-16">Pin code:</div>
                    <div className="flex-1">{invoiceData.clientPincode}</div>
                  </div>
                </div>
                <div className="flex p-1.5 pt-0">
                  <div className="flex flex-1">
                    <div className="w-24">Gst No:</div>
                    <div className="flex-1">{invoiceData.clientGst}</div>
                  </div>
                  <div className="flex flex-1">
                    <div className="w-36">Transaction type:</div>
                    <div className="flex-1">Services</div>
                  </div>
                  <div className="flex flex-1">
                    <div className="w-20">Merchant Id:</div>
                    <div className="flex-1">{invoiceData.merchantId}</div>
                  </div>
                </div>
            </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse border-b border-black text-[9px]">
                <thead>
                  <tr className="border-b border-black bg-white">
                    <th className="py-1 px-1 font-normal border-r border-black w-8 text-center">S.No.</th>
                    <th className="py-1 px-2 font-normal border-r border-black">Description of service:</th>
                    <th className="py-1 px-1 font-normal border-r border-black w-16 text-center">HSN</th>
                    <th className="py-1 px-1 font-normal border-r border-black w-12 text-center">QTY.</th>
                    <th className="py-1 px-1 font-normal border-r border-black w-12 text-center">UOM</th>
                    <th className="py-1 px-1 font-normal border-r border-black w-24 text-center">Price per unit<br/>Rs. Ps.</th>
                    <th className="py-1 px-1 font-normal w-28 text-center">Total value Rs. Ps.</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-black/20 last:border-b-0">
                      <td className="py-1 px-1 border-r border-black text-center align-top">{idx + 1}</td>
                      <td className="py-1 px-2 border-r border-black align-top">{item.description || '-'}</td>
                      <td className="py-1 px-1 border-r border-black text-center align-top">{invoiceData.hsnCode || '997159'}</td>
                      <td className="py-1 px-1 border-r border-black text-center align-top">{item.qty}</td>
                      <td className="py-1 px-1 border-r border-black text-center align-top"></td>
                      <td className="py-1 px-1 border-r border-black text-right align-top">{item.rate.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td className="py-1 px-1 text-right align-top">{(item.qty * item.rate).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                  ))}
                                  {/* Total Row */}
                  <tr className="border-t border-black">
                    <td colSpan={2} className="py-1 px-2 border-r border-black">Total</td>
                    <td className="py-1 px-1 border-r border-black text-center"></td>
                    <td className="py-1 px-1 border-r border-black text-center">0</td>
                    <td className="py-1 px-1 border-r border-black text-center"></td>
                    <td className="py-1 px-2 border-r border-black text-[10px]">Gross Amount</td>
                    <td className="py-1 px-1 text-right">{subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  </tr>
                </tbody>
              </table>

              {/* Explanation & Taxes */}
              <div className="flex border-b border-black text-[10px]">
                <div className="flex-1 p-1.5 border-r border-black leading-[1.3] pr-2">
                  <div className="mb-1 font-bold">Terms & Conditions / Explanation:</div>
                  {invoiceData.termsConditions ? (
                    <div className="whitespace-pre-wrap">{invoiceData.termsConditions}</div>
                  ) : (
                    <>
                      <div className="mb-1">1. The service fee is inclusive of technology fee, bank charges and or fee for any other value-added services as may be specifically agreed to be provided by {orgProfile?.legal_name || orgProfile?.name}.</div>
                      <div className="mb-1">2. The Service fee charged by {orgProfile?.legal_name || orgProfile?.name} on debit cards & UPI are reflective of non-levy of MDR by acquiring banks and only represent the amount payable by you to {orgProfile?.legal_name || orgProfile?.name} for providing services.</div>
                      <div>3. Whether the tax payable on reverse charge basis: No</div>
                    </>
                  )}
                </div>
                <div className="w-[280px] flex flex-col">
                  <div className="flex border-b border-black">
                    <div className="w-1/2 p-1.5 border-r border-black">Taxable Value</div>
                    <div className="w-1/2 p-1.5 text-right">{subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                  </div>
                  <div className="flex border-b border-black">
                    <div className="w-1/2 p-1.5 border-r border-black font-bold">TAX AMOUNT</div>
                    <div className="w-1/2 p-1.5"></div>
                  </div>
                  <div className="flex">
                    <div className="w-1/2 p-1 border-r border-black">CGST ({invoiceData.taxRate / 2}%)</div>
                    <div className="w-1/2 p-1 text-right">{cgstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/2 p-1 border-r border-black">SGST ({invoiceData.taxRate / 2}%)</div>
                    <div className="w-1/2 p-1 text-right">{sgstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/2 p-1 border-r border-black">IGST ({invoiceData.taxRate}%)</div>
                    <div className="w-1/2 p-1 text-right">{igstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                  </div>
                  <div className="flex border-t border-black mt-auto">
                    <div className="w-1/2 p-1.5 border-r border-black">Total Tax Amount</div>
                    <div className="w-1/2 p-1.5 text-right">{taxAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                  </div>
                  <div className="flex border-y border-black">
                    <div className="w-1/2 p-1.5 border-r border-black">TCS@0.1%</div>
                    <div className="w-1/2 p-1.5 text-right">0.00</div>
                  </div>
                  <div className="flex border-b border-black">
                    <div className="w-1/2 p-1.5 border-r border-black">Total Invoice value</div>
                    <div className="w-1/2 p-1.5 text-right">{total.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                  </div>
                  <div className="flex bg-white">
                    <div className="w-1/2 p-1.5 border-r border-black">Paid</div>
                    <div className="w-1/2 p-1.5 text-right">{total.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                  </div>
                </div>
              </div>

              {/* Words */}
              <div className="border-b border-black p-2 text-[10px]">
                Total invoice value in words: Rupees {numberToWords(Number(total))} Only
              </div>

              {/* Digital Signature */}
              <div className="flex min-h-[90px] text-[10px]">
                <div className="flex-1 border-r border-black p-2"></div>
                <div className="w-[300px] p-2 flex flex-col gap-0.5 pt-2">
                  <div>Digitally signed by - {`DS ${orgProfile?.legal_name?.toUpperCase() || orgProfile?.name?.toUpperCase() || ''}`}</div>
                  <div>Location - {orgProfile?.city || invoiceData.signatureLocation}</div>
                  <div>Date - {new Date().toUTCString()}</div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex text-[9px] mt-auto border-t border-black">
                <div className="flex-1 p-1 border-r border-black pl-2">Phone: {orgProfile?.phone}</div>
                <div className="flex-1 p-1 border-r border-black pl-2">Fax: {orgProfile?.fax}</div>
                <div className="flex-1 p-1 border-r border-black pl-2">Email: {orgProfile?.email}</div>
                <div className="flex-1 p-1 text-blue-600 pl-2">Website: {orgProfile?.website}</div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
