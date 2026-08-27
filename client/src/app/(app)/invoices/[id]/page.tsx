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
  created_at?: string;
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
    email: string;
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

  const isInterstate = (invoice.organization.state || '').trim().toLowerCase() !== (invoice.customer.billing_state || '').trim().toLowerCase();
  const cgstAmount = isInterstate ? 0 : Number(invoice.tax_total) / 2;
  const sgstAmount = isInterstate ? 0 : Number(invoice.tax_total) / 2;
  const igstAmount = isInterstate ? Number(invoice.tax_total) : 0;
  const assumedTaxRate = invoice.items[0]?.tax_rate || 18; // get from first item or default

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
      </div>      {/* Printable Invoice Page */}
      <div className="w-full pb-12 flex justify-center items-start print:p-0 print:m-0 print:block bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl overflow-x-auto">
        <div id="invoice-preview" className="w-[210mm] min-h-[297mm] bg-white text-black p-8 shadow-2xl relative flex flex-col print:shadow-none print:w-full print:min-h-0 font-sans text-[10px] leading-tight mx-auto">
          
          {/* Main Outer Border Container */}
          <div className="flex-1 border border-black flex flex-col box-border">
            
            {/* Top Section */}
            <div className="flex border-b border-black">
              <div className="w-[25%] p-2 border-r border-black flex items-center justify-center">
                {invoice.organization.logo ? (
                  <img src={invoice.organization.logo} alt="Logo" className="max-w-[120px] max-h-[60px] object-contain" />
                ) : (
                  <span className="font-extrabold text-2xl tracking-tighter">{invoice.organization.name || 'LOGO'}</span>
                )}
              </div>
              <div className="w-[50%] p-2 border-r border-black flex flex-col items-center justify-center text-center">
                <div className="font-medium text-base mb-0.5">{invoice.organization.legal_name || invoice.organization.name || 'Your Company Private Limited'}</div>
                <div className="text-[10px]">{invoice.organization.address || 'Your Company Address Line 1'}</div>
                <div className="text-[10px]">{[invoice.organization.city, invoice.organization.state, invoice.organization.pincode].filter(Boolean).join(', ') || 'City, State, Pincode'}</div>
              </div>
              <div className="w-[25%] p-2 flex items-center justify-center font-bold text-base tracking-wide">
                TAX INVOICE
              </div>
            </div>

            {/* GSTIN / PAN Row */}
            <div className="flex border-b border-black">
              <div className="w-1/3 p-1.5 border-r border-black flex"><span className="w-24">Supplier GSTIN:</span> <span>{invoice.organization.GSTIN || ''}</span></div>
              <div className="w-1/3 p-1.5 border-r border-black flex"><span className="w-12">PAN:</span> <span>{invoice.organization.PAN || ''}</span></div>
              <div className="w-1/3 p-1.5 flex"><span className="w-32">Supplier State Code:</span> <span>{invoice.organization.state ? invoice.organization.state.substring(0, 2).toUpperCase() : '06'}</span></div>
            </div>

            {/* Main Details & QR Code */}
            <div className="flex border-b border-black">
              <div className="flex-1 flex flex-col">
                <div className="flex border-b border-black">
                  <div className="w-1/2 p-1.5 border-r border-black flex justify-between"><span className="text-gray-900">Document No:</span> <span>{invoice.invoice_number}</span></div>
                  <div className="w-1/2 p-1.5 flex justify-between"><span className="text-gray-900">Invoice Date:</span> <span>{new Date(invoice.invoice_date).toLocaleDateString('en-GB')}</span></div>
                </div>
                <div className="flex border-b border-black">
                  <div className="w-1/2 p-1.5 border-r border-black flex justify-between"><span className="text-gray-900">Document Ref No:</span> <span></span></div>
                  <div className="w-1/2 p-1.5 flex justify-between"><span className="text-gray-900">Document Date:</span> <span></span></div>
                </div>
                <div className="flex border-b border-black">
                  <div className="w-1/2 p-1.5 border-r border-black flex justify-between"><span className="text-gray-900">Due Date:</span> <span className="font-medium">{new Date(invoice.due_date).toLocaleDateString('en-GB')}</span></div>
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
                  <div className="w-1/2 p-1.5 flex"><span className="text-gray-900 w-12">PAN:</span> <span></span></div>
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
                  <div className="font-medium uppercase">{invoice.customer.company_name || invoice.customer.customer_name}</div>
                </div>
                <div className="flex">
                  <div className="w-24">Address:</div>
                  <div className="flex-1 whitespace-pre-wrap">{invoice.customer.billing_address}</div>
                </div>
                <div className="flex items-center">
                  <div className="w-24">City:</div>
                  <div className="w-32">{invoice.customer.billing_city}</div>
                  <div className="w-32 pl-4">Place of supply (POS):</div>
                  <div className="w-32">{invoice.customer.billing_state}</div>
                  <div className="w-16 pl-4">Pin code:</div>
                  <div className="w-24">{invoice.customer.billing_pincode}</div>
                </div>
                <div className="flex items-center">
                  <div className="w-24">Gst No:</div>
                  <div className="w-32">{invoice.customer.GSTIN}</div>
                  <div className="w-32 pl-4">Transaction type:</div>
                  <div className="w-32">Services</div>
                  <div className="w-16 pl-4">Merchant Id:</div>
                  <div className="w-24">13290661</div>
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
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-black/20 last:border-b-0">
                    <td className="py-1 px-1 border-r border-black text-center align-top">{idx + 1}</td>
                    <td className="py-1 px-2 border-r border-black align-top">{item.description || '-'}</td>
                    <td className="py-1 px-1 border-r border-black text-center align-top">997159</td>
                    <td className="py-1 px-1 border-r border-black text-center align-top">{item.quantity}</td>
                    <td className="py-1 px-1 border-r border-black text-center align-top"></td>
                    <td className="py-1 px-1 border-r border-black text-right align-top">{Number(item.unit_price).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    <td className="py-1 px-1 text-right align-top">{(item.quantity * Number(item.unit_price)).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="border-t border-black">
                  <td colSpan={3} className="py-1 px-2 border-r border-black">Total</td>
                  <td className="py-1 px-1 border-r border-black text-center">{invoice.items.reduce((acc, i) => acc + i.quantity, 0)}</td>
                  <td colSpan={2} className="py-1 px-2 border-r border-black">Gross Amount</td>
                  <td className="py-1 px-1 text-right">{Number(invoice.sub_total).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                </tr>
              </tbody>
            </table>

            {/* Explanation & Taxes */}
            <div className="flex border-b border-black text-[9px]">
              <div className="flex-1 p-1.5 border-r border-black leading-[1.3] pr-2">
                <div className="mb-1">Explanation:</div>
                {invoice.terms ? (
                  <div className="whitespace-pre-wrap">{invoice.terms}</div>
                ) : invoice.notes ? (
                  <div className="whitespace-pre-wrap">{invoice.notes}</div>
                ) : (
                  <>
                    <div className="mb-1">1. The service fee is inclusive of technology fee, bank charges and or fee for any other value-added services as may be specifically agreed to be provided by {invoice.organization.name || 'PayU India'}.</div>
                    <div className="mb-1">2. The Service fee charged by {invoice.organization.name || 'PayU India'} on rupay debit cards & UPI are reflective of non-levy of MDR by acquiring banks and only represent the amount payable by you to {invoice.organization.name || 'PayU India'} for providing {invoice.organization.name || 'PayU'} services.</div>
                    <div>3. Weather the tax payable on reverse charge basis: No</div>
                  </>
                )}
              </div>
              <div className="w-[280px] flex flex-col">
                <div className="flex border-b border-black">
                  <div className="w-1/2 p-1.5 border-r border-black">Taxable Value</div>
                  <div className="w-1/2 p-1.5 text-right">{Number(invoice.sub_total).toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                </div>
                <div className="flex border-b border-black">
                  <div className="w-1/2 p-1.5 border-r border-black font-bold">TAX AMOUNT</div>
                  <div className="w-1/2 p-1.5"></div>
                </div>
                <div className="flex">
                  <div className="w-1/2 p-1 border-r border-black">CGST ({Number(assumedTaxRate) / 2}%)</div>
                  <div className="w-1/2 p-1 text-right">{cgstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                </div>
                <div className="flex">
                  <div className="w-1/2 p-1 border-r border-black">SGST ({Number(assumedTaxRate) / 2}%)</div>
                  <div className="w-1/2 p-1 text-right">{sgstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                </div>
                <div className="flex">
                  <div className="w-1/2 p-1 border-r border-black">IGST ({assumedTaxRate}%)</div>
                  <div className="w-1/2 p-1 text-right">{igstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                </div>
                <div className="flex border-t border-black mt-auto">
                  <div className="w-1/2 p-1.5 border-r border-black">Total Tax Amount</div>
                  <div className="w-1/2 p-1.5 text-right">{Number(invoice.tax_total).toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                </div>
                <div className="flex border-y border-black">
                  <div className="w-1/2 p-1.5 border-r border-black">TCS@0.1%</div>
                  <div className="w-1/2 p-1.5 text-right">0.00</div>
                </div>
                <div className="flex border-b border-black">
                  <div className="w-1/2 p-1.5 border-r border-black">Total Invoice value</div>
                  <div className="w-1/2 p-1.5 text-right">{Number(invoice.grand_total).toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                </div>
                <div className="flex bg-white">
                  <div className="w-1/2 p-1.5 border-r border-black">Paid</div>
                  <div className="w-1/2 p-1.5 text-right">{invoice.status === 'PAID' ? Number(invoice.grand_total).toLocaleString('en-IN', {minimumFractionDigits: 2}) : '0.00'}</div>
                </div>
              </div>
            </div>

            {/* Words */}
            <div className="border-b border-black p-2 text-[10px]">
              Total invoice value in words: Rupees --- Only
            </div>

            {/* Digital Signature */}
            <div className="border-b border-black p-4 flex-1 flex flex-col items-center justify-center text-center min-h-[90px] text-[10px]">
              <div>Digitally signed by - {`DS ${invoice.organization.legal_name?.toUpperCase() || invoice.organization.name?.toUpperCase()}`}</div>
              <div>Location - {invoice.organization.city || 'Gurgaon'}</div>
              <div>Date - {new Date(invoice.created_at || invoice.invoice_date).toUTCString()}</div>
            </div>

            {/* Footer */}
            <div className="flex text-[9px] mt-auto">
              <div className="flex-1 p-1 border-r border-black">Phone: {invoice.organization.phone || ''}</div>
              <div className="flex-1 p-1 border-r border-black">Fax:</div>
              <div className="flex-1 p-1 border-r border-black">Email: {invoice.organization.email || ''}</div>
              <div className="flex-1 p-1 text-blue-600">Website: {invoice.organization.website || ''}</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
