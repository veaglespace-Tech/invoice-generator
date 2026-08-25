"use client"
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Printer, Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';

interface InvoiceData {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: string;
  sub_total: string;
  tax_total: string;
  grand_total: string;
  notes: string;
  terms: string;
  payment_details?: string;
  organization: {
    name: string;
    legal_name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    GSTIN: string;
    PAN: string;
    logo: string;
    phone: string;
    website: string;
  };
  customer: {
    customer_name: string;
    company_name: string;
    billing_address: string;
    billing_city: string;
    billing_state: string;
    billing_pincode: string;
    billing_country: string;
    GSTIN: string;
  };
  items: {
    id: string;
    description: string;
    quantity: number;
    unit_price: string;
    tax_rate: string;
    tax_amount: string;
    total_amount: string;
  }[];
}

export default function InvoicePrintView() {
  const params = useParams();
  const id = params?.id as string;
  
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadInvoice();
    }
  }, [id]);

  const loadInvoice = async () => {
    try {
      const res = await fetchApi<{ success: boolean; data: InvoiceData }>(`/invoices/${id}`);
      if (res.success && res.data) {
        setInvoice(res.data);
      }
    } catch (error) {
      console.error("Failed to load invoice", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-xl text-slate-600">Invoice not found</p>
        <Link href="/invoices">
          <Button variant="outline">Back to Invoices</Button>
        </Link>
      </div>
    );
  }

  const formatCurrency = (amount: string | number) => {
    return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Non-printable action bar */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <Link href="/invoices" className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Invoices
        </Link>
        <div className="flex gap-3">
          <Button onClick={handlePrint} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white">
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Printable Invoice Page */}
      <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0 print:m-0 w-full min-h-[297mm] text-slate-900 mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-8 mb-8">
          <div className="flex flex-col max-w-[50%]">
            {invoice.organization.logo ? (
              <img src={invoice.organization.logo} alt="Logo" className="max-h-24 object-contain mb-4" />
            ) : (
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{invoice.organization.name}</h2>
            )}
            
            <p className="text-sm text-slate-600 font-semibold">{invoice.organization.legal_name || invoice.organization.name}</p>
            {invoice.organization.address && <p className="text-sm text-slate-500 whitespace-pre-wrap">{invoice.organization.address}</p>}
            <p className="text-sm text-slate-500">
              {[invoice.organization.city, invoice.organization.state, invoice.organization.pincode].filter(Boolean).join(', ')}
            </p>
            {invoice.organization.country && <p className="text-sm text-slate-500">{invoice.organization.country}</p>}
            
            <div className="mt-3">
              {invoice.organization.GSTIN && <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">GSTIN:</span> {invoice.organization.GSTIN}</p>}
              {invoice.organization.PAN && <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">PAN:</span> {invoice.organization.PAN}</p>}
              {invoice.organization.phone && <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Phone:</span> {invoice.organization.phone}</p>}
              {invoice.organization.website && <p className="text-xs text-slate-500">{invoice.organization.website}</p>}
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <h1 className="text-4xl font-light tracking-widest text-slate-800 mb-4 uppercase">TAX INVOICE</h1>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm max-w-[300px]">
              <div className="font-semibold text-slate-600 text-left">Invoice No:</div>
              <div className="font-medium text-slate-900 text-right">{invoice.invoice_number}</div>
              
              <div className="font-semibold text-slate-600 text-left">Invoice Date:</div>
              <div className="font-medium text-slate-900 text-right">{formatDate(invoice.invoice_date)}</div>
              
              <div className="font-semibold text-slate-600 text-left">Due Date:</div>
              <div className="font-medium text-slate-900 text-right">{formatDate(invoice.due_date)}</div>
            </div>
          </div>
        </div>

        {/* Billed To */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Billed To</h3>
          <p className="text-base font-bold text-slate-900">{invoice.customer.company_name || invoice.customer.customer_name}</p>
          {invoice.customer.company_name && <p className="text-sm text-slate-600">{invoice.customer.customer_name}</p>}
          
          <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{invoice.customer.billing_address}</p>
          <p className="text-sm text-slate-600">
            {[invoice.customer.billing_city, invoice.customer.billing_state, invoice.customer.billing_pincode].filter(Boolean).join(', ')}
          </p>
          <p className="text-sm text-slate-600">{invoice.customer.billing_country}</p>
          
          {invoice.customer.GSTIN && <p className="text-xs text-slate-600 mt-2"><span className="font-semibold">GSTIN:</span> {invoice.customer.GSTIN}</p>}
        </div>

        {/* Item Table */}
        <table className="w-full text-left mb-8 border-collapse">
          <thead>
            <tr className="border-y-2 border-slate-900">
              <th className="py-3 px-2 font-bold text-sm text-slate-900">Description</th>
              <th className="py-3 px-2 font-bold text-sm text-slate-900 text-right w-24">Rate</th>
              <th className="py-3 px-2 font-bold text-sm text-slate-900 text-right w-20">Qty</th>
              <th className="py-3 px-2 font-bold text-sm text-slate-900 text-right w-24">Tax</th>
              <th className="py-3 px-2 font-bold text-sm text-slate-900 text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="border-b border-slate-200">
            {invoice.items.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-slate-50/50' : ''}>
                <td className="py-3 px-2 text-sm text-slate-800">{item.description}</td>
                <td className="py-3 px-2 text-sm text-slate-800 text-right">{formatCurrency(item.unit_price)}</td>
                <td className="py-3 px-2 text-sm text-slate-800 text-right">{item.quantity}</td>
                <td className="py-3 px-2 text-sm text-slate-800 text-right text-xs">
                  {formatCurrency(item.tax_amount)}<br/>
                  <span className="text-slate-400">({item.tax_rate}%)</span>
                </td>
                <td className="py-3 px-2 text-sm text-slate-800 text-right font-medium">{formatCurrency(item.total_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="w-72">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-600">Subtotal</span>
              <span className="text-sm text-slate-900 font-medium">{formatCurrency(invoice.sub_total)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-600">Total Tax</span>
              <span className="text-sm text-slate-900 font-medium">{formatCurrency(invoice.tax_total)}</span>
            </div>
            <div className="flex justify-between py-3 border-y-2 border-slate-900 mt-2">
              <span className="text-lg font-bold text-slate-900">Grand Total</span>
              <span className="text-lg font-bold text-slate-900">{formatCurrency(invoice.grand_total)}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="border-t pt-6 text-sm text-slate-600 mt-auto">
          {invoice.payment_details && (
            <div className="mb-4">
              <span className="font-bold text-slate-900">Payment Details: </span>
              <span className="whitespace-pre-wrap">{invoice.payment_details}</span>
            </div>
          )}
          {invoice.notes && (
            <div className="mb-4">
              <span className="font-bold text-slate-900">Notes: </span>
              <span className="whitespace-pre-wrap">{invoice.notes}</span>
            </div>
          )}
          {invoice.terms && (
            <div>
              <span className="font-bold text-slate-900">Terms & Conditions: </span>
              <span className="whitespace-pre-wrap">{invoice.terms}</span>
            </div>
          )}
        </div>
        
        {/* Authorised Signatory */}
        <div className="mt-16 flex justify-end">
          <div className="text-center w-48">
            <div className="border-b-2 border-slate-300 h-16 mb-2"></div>
            <p className="text-xs font-semibold text-slate-600">Authorised Signatory</p>
            <p className="text-xs text-slate-500">For {invoice.organization.legal_name || invoice.organization.name}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
