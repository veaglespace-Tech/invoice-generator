"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Printer, Plus, Trash2, Hexagon, Loader2, Download, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { fetchApi } from '@/lib/api';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';

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
  phone: string | null;
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
  } | null;
}

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
        const [orgRes, productsRes, customersRes] = await Promise.all([
          fetchApi<{ success: boolean; data: OrgProfile }>('/organizations/me'),
          fetchApi<{ success: boolean; data: any[] }>('/products'),
          fetchApi<{ success: boolean; data: any[] }>('/customers')
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
    setIsDownloading(true);
    try {
      const element = document.getElementById('invoice-print-area');
      if (!element) return;

      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1,
        pixelRatio: 2,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], `${invoiceData.invoiceNumber || 'Invoice'}.pdf`, { type: 'application/pdf' });

      let shared = false;
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Invoice ${invoiceData.invoiceNumber}`,
            text: 'Please find the attached invoice.',
          });
          shared = true;
        } catch (shareErr: any) {
          console.warn('Native share failed or was cancelled by user:', shareErr);
          // If the error is NotAllowedError (user gesture timeout), we fall through to download
        }
      }

      if (!shared) {
        // Fallback: Download PDF automatically
        pdf.save(`${invoiceData.invoiceNumber || 'Invoice'}.pdf`);
        alert("Direct sharing is not supported on your current browser/device (or it timed out). The PDF has been downloaded automatically so you can attach it to WhatsApp.");
      }
      
    } catch (err) {
      console.error("Failed to process share/download", err);
      alert("Failed to generate PDF. Please use the Print button as a fallback.");
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
          invoice_date: invoiceData.issueDate,
          due_date: invoiceData.dueDate,
          notes: invoiceData.notes,
          terms: 'Thank you for your business.',
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
                    <input type="text" value={invoiceData.invoiceNumber} onChange={e => updateData('invoiceNumber', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Currency Symbol</label>
                    <input type="text" value={invoiceData.currency} onChange={e => updateData('currency', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Issue Date</label>
                    <input type="date" value={invoiceData.issueDate} onChange={e => updateData('issueDate', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Due Date</label>
                    <input type="date" value={invoiceData.dueDate} onChange={e => updateData('dueDate', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                  </div>
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
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" 
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
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" 
                        />
                        {showCustomerDropdown && customers.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-lg max-h-48 overflow-y-auto">
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
                    <input type="email" value={invoiceData.clientEmail} onChange={e => updateData('clientEmail', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Address</label>
                    <textarea rows={2} value={invoiceData.clientAddress} onChange={e => updateData('clientAddress', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"></textarea>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">City</label>
                      <input type="text" value={invoiceData.clientCity} onChange={e => updateData('clientCity', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">State / POS</label>
                      <input type="text" value={invoiceData.clientState} onChange={e => updateData('clientState', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">Pincode</label>
                      <input type="text" value={invoiceData.clientPincode} onChange={e => updateData('clientPincode', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">GSTIN</label>
                      <input type="text" value={invoiceData.clientGst} onChange={e => updateData('clientGst', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white uppercase" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">PAN</label>
                      <input type="text" value={invoiceData.clientPan} onChange={e => updateData('clientPan', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white uppercase" />
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
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" 
                        />
                        {focusedItemId === item.id && products.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-lg max-h-48 overflow-y-auto">
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
                          <input type="number" value={item.qty} onChange={e => updateItem(item.id, 'qty', Number(e.target.value))} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-xs text-slate-500 whitespace-nowrap">Unit Price (₹)</span>
                          <input type="number" value={item.rate} onChange={e => updateItem(item.id, 'rate', Number(e.target.value))} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
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
                    <input type="number" value={invoiceData.discount} onChange={e => updateData('discount', Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Tax Rate (%)</label>
                    <input type="number" value={invoiceData.taxRate} onChange={e => updateData('taxRate', Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Notes (Visible on Invoice)</label>
                  <textarea rows={2} value={invoiceData.notes} onChange={e => updateData('notes', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"></textarea>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* BOTTOM PANEL: Live A4 Preview */}
        <div className="w-full pb-12 flex justify-center items-start print:p-0 print:m-0 print:block bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl overflow-x-auto">
          <div id="invoice-preview" className="w-[210mm] min-h-[297mm] bg-white text-black p-8 shadow-2xl relative flex flex-col print:shadow-none print:w-full print:min-h-0 font-sans text-[10px] leading-tight">
            
            {/* Main Outer Border Container */}
            <div className="flex-1 border border-black flex flex-col box-border">
              
              {/* Top Section */}
              <div className="flex border-b border-black">
                <div className="w-[25%] p-2 border-r border-black flex items-center justify-center">
                  {orgProfile?.logo ? (
                    <img src={orgProfile.logo} alt="Logo" className="max-w-[120px] max-h-[60px] object-contain" />
                  ) : (
                    <span className="font-extrabold text-2xl tracking-tighter">{orgProfile?.name || 'LOGO'}</span>
                  )}
                </div>
                <div className="w-[50%] p-2 border-r border-black flex flex-col items-center justify-center text-center">
                  <div className="font-medium text-base mb-0.5">{orgProfile?.legal_name || orgProfile?.name || 'Your Company Private Limited'}</div>
                  <div className="text-[10px]">{orgProfile?.address || 'Your Company Address Line 1'}</div>
                  <div className="text-[10px]">{[orgProfile?.city, orgProfile?.state, orgProfile?.pincode].filter(Boolean).join(', ') || 'City, State, Pincode'}</div>
                </div>
                <div className="w-[25%] p-2 flex items-center justify-center font-bold text-base tracking-wide">
                  TAX INVOICE
                </div>
              </div>

              {/* GSTIN / PAN Row */}
              <div className="flex border-b border-black">
                <div className="w-1/3 p-1.5 border-r border-black flex"><span className="w-24">Supplier GSTIN:</span> <span>{orgProfile?.GSTIN || ''}</span></div>
                <div className="w-1/3 p-1.5 border-r border-black flex"><span className="w-12">PAN:</span> <span>{orgProfile?.PAN || ''}</span></div>
                <div className="w-1/3 p-1.5 flex"><span className="w-32">Supplier State Code:</span> <span>{invoiceData.supplierStateCode || (orgProfile?.state ? orgProfile.state.substring(0, 2).toUpperCase() : '06')}</span></div>
              </div>

              {/* Main Details & QR Code */}
              <div className="flex border-b border-black">
                <div className="flex-1 flex flex-col">
                  <div className="flex border-b border-black">
                    <div className="w-1/2 p-1.5 border-r border-black flex justify-between"><span className="text-gray-900">Document No:</span> <span>{invoiceData.invoiceNumber}</span></div>
                    <div className="w-1/2 p-1.5 flex justify-between"><span className="text-gray-900">Invoice Date:</span> <span>{new Date(invoiceData.issueDate).toLocaleDateString('en-GB')}</span></div>
                  </div>
                  <div className="flex border-b border-black">
                    <div className="w-1/2 p-1.5 border-r border-black flex justify-between"><span className="text-gray-900">Document Ref No:</span> <span></span></div>
                    <div className="w-1/2 p-1.5 flex justify-between"><span className="text-gray-900">Document Date:</span> <span></span></div>
                  </div>
                  <div className="flex border-b border-black">
                    <div className="w-1/2 p-1.5 border-r border-black flex justify-between"><span className="text-gray-900">Due Date:</span> <span className="font-medium">{new Date(invoiceData.dueDate).toLocaleDateString('en-GB')}</span></div>
                    <div className="w-1/2 p-1.5 flex justify-between"><span className="text-gray-900">Category:</span> <span>B2B</span></div>
                  </div>
                  <div className="flex border-b border-black">
                    <div className="w-full p-1.5 flex"><span className="text-gray-900 w-32">Document Type Code:</span> <span>INV</span></div>
                  </div>
                  <div className="flex border-b border-black">
                    <div className="w-full p-1.5 flex"><span className="text-gray-900 w-32">IRN:</span> <span></span></div>
                  </div>
                  <div className="flex">
                    <div className="w-1/2 p-1.5 border-r border-black flex"><span className="text-gray-900">Details of customer(Billed to):</span></div>
                    <div className="w-1/2 p-1.5 flex"><span className="text-gray-900 w-12">PAN:</span> <span>{invoiceData.clientPan}</span></div>
                  </div>
                </div>
                {/* QR Code Placeholder */}
                <div className="w-[120px] border-l border-black p-2 flex items-center justify-center">
                  <div className="w-full h-full border border-dashed border-gray-400 flex items-center justify-center text-gray-400 bg-gray-50/50">
                    QR Code
                  </div>
                </div>
              </div>

              {/* Billed To Details */}
              <div className="flex border-b border-black text-[9px]">
                <div className="flex-1 flex flex-col p-1.5 space-y-1">
                  <div className="flex">
                    <div className="w-24">Legal Name:</div>
                    <div className="font-medium uppercase">{invoiceData.clientName}</div>
                  </div>
                  <div className="flex">
                    <div className="w-24">Address:</div>
                    <div className="flex-1 whitespace-pre-wrap">{invoiceData.clientAddress}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24">City:</div>
                    <div className="w-32">{invoiceData.clientCity}</div>
                    <div className="w-32 pl-4">Place of supply (POS):</div>
                    <div className="w-32">{invoiceData.clientState}</div>
                    <div className="w-16 pl-4">Pin code:</div>
                    <div className="w-24">{invoiceData.clientPincode}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24">Gst No:</div>
                    <div className="w-32">{invoiceData.clientGst}</div>
                    <div className="w-32 pl-4">Transaction type:</div>
                    <div className="w-32">{invoiceData.transactionType || 'Services'}</div>
                    <div className="w-16 pl-4">Merchant Id:</div>
                    <div className="w-24">{invoiceData.merchantId || '13290661'}</div>
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
                    <td colSpan={3} className="py-1 px-2 border-r border-black">Total</td>
                    <td className="py-1 px-1 border-r border-black text-center">{items.reduce((acc, i) => acc + i.qty, 0)}</td>
                    <td colSpan={2} className="py-1 px-2 border-r border-black">Gross Amount</td>
                    <td className="py-1 px-1 text-right">{subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  </tr>
                </tbody>
              </table>

              {/* Explanation & Taxes */}
              <div className="flex border-b border-black text-[9px]">
                <div className="flex-1 p-1.5 border-r border-black leading-[1.3] pr-2">
                  <div className="mb-1">Explanation:</div>
                  {invoiceData.termsConditions ? (
                    <div className="whitespace-pre-wrap">{invoiceData.termsConditions}</div>
                  ) : invoiceData.notes ? (
                    <div className="whitespace-pre-wrap">{invoiceData.notes}</div>
                  ) : (
                    <>
                      <div className="mb-1">1. The service fee is inclusive of technology fee, bank charges and or fee for any other value-added services as may be specifically agreed to be provided by {orgProfile?.name || 'PayU India'}.</div>
                      <div className="mb-1">2. The Service fee charged by {orgProfile?.name || 'PayU India'} on rupay debit cards & UPI are reflective of non-levy of MDR by acquiring banks and only represent the amount payable by you to {orgProfile?.name || 'PayU India'} for providing {orgProfile?.name || 'PayU'} services.</div>
                      <div>3. Weather the tax payable on reverse charge basis: No</div>
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
                Total invoice value in words: Rupees --- Only
              </div>

              {/* Digital Signature */}
              <div className="border-b border-black p-4 flex-1 flex flex-col items-center justify-center text-center min-h-[90px] text-[10px]">
                <div>Digitally signed by - {invoiceData.signatureName || `DS ${orgProfile?.legal_name?.toUpperCase() || orgProfile?.name?.toUpperCase()}`}</div>
                <div>Location - {invoiceData.signatureLocation || 'Gurgaon'}</div>
                <div>Date - {new Date().toUTCString()}</div>
              </div>

              {/* Footer */}
              <div className="flex text-[9px] mt-auto">
                <div className="flex-1 p-1 border-r border-black">Phone: {orgProfile?.phone}</div>
                <div className="flex-1 p-1 border-r border-black">Fax:</div>
                <div className="flex-1 p-1 border-r border-black">Email:</div>
                <div className="flex-1 p-1 text-blue-600">Website: {orgProfile?.website}</div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
