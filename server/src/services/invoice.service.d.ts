interface InvoiceItemInput {
    product_id?: string | null;
    description: string;
    quantity: number;
    unit?: string | null;
    rate: number;
    discount: number;
    tax_rate: number;
}
export declare const calculateInvoice: (organizationId: string, customerId: string, items: InvoiceItemInput[]) => Promise<{
    calculatedItems: {
        product_id: string | null | undefined;
        description: string;
        quantity: number;
        unit: string | null | undefined;
        rate: number;
        discount: number;
        tax_rate: number;
        tax_amount: number;
        amount: number;
    }[];
    totals: {
        subtotal: number;
        discount: number;
        taxable_amount: number;
        tax_total: number;
        CGST: number;
        SGST: number;
        IGST: number;
        round_off: number;
        grand_total: number;
    };
}>;
export declare const generateInvoiceNumber: (organizationId: string) => Promise<string>;
export {};
//# sourceMappingURL=invoice.service.d.ts.map