'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, UploadCloud, Save, CheckCircle2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import BillingPage from './billing/page';
import AdminProfile from './AdminProfile';
export default function SettingsPage() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef(null);
  useEffect(() => {
    loadProfile();
  }, []);
  const loadProfile = async () => {
    try {
      const res = await fetchApi('/organizations/me');
      if (res.success && res.data) {
        setProfile(res.data);
      }
    } catch (error) {
      console.error('Failed to load organization profile', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleInputChange = (e) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };
  const handleSettingsChange = (e) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({
      ...profile,
      settings: {
        ...(profile.settings || {
          supplier_state_code: null,
          transaction_type: null,
          merchant_id: null,
          hsn_code: null,
          signature_name: null,
          signature_location: null,
          terms_conditions: null,
          prefix: null
        }),
        [name]: value
      }
    });
  };
  const handleFieldVisibilityChange = (field, checked) => {
    if (!profile) return;
    const currentSettings = profile.settings || {};
    const visibility = currentSettings.field_visibility || {};
    setProfile({
      ...profile,
      settings: {
        ...currentSettings,
        field_visibility: {
          ...visibility,
          [field]: checked
        }
      }
    });
  };
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be smaller than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                logo: reader.result
              }
            : null
        );
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    setSaveMessage('');
    try {
      const res = await fetchApi(`/organizations/${profile.id}`, {
        method: 'PUT',
        data: profile
      });
      if (res.success) {
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings', error);
      alert('Failed to save settings. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="text-red-500">Failed to load organization settings.</div>
    );
  }
  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Organization Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your company's profile, billing details, and logo.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {saveMessage && (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-5 h-5" />
              {saveMessage}
            </span>
          )}
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="tabs tabs-boxed mb-6 bg-base-200/50 p-1 w-fit">
        <button
          className={`tab tab-lg transition-all ${activeTab === 'profile' ? 'tab-active font-semibold shadow-sm' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Organization Profile
        </button>
        <button
          className={`tab tab-lg transition-all ${activeTab === 'invoice' ? 'tab-active font-semibold shadow-sm' : ''}`}
          onClick={() => setActiveTab('invoice')}
        >
          Invoice Settings
        </button>
        <button
          className={`tab tab-lg transition-all ${activeTab === 'billing' ? 'tab-active font-semibold shadow-sm' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          Billing & Plans
        </button>
        <button
          className={`tab tab-lg transition-all ${activeTab === 'admin' ? 'tab-active font-semibold shadow-sm' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          Admin Profile
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Left Column */}
          <div className="md:col-span-1 space-y-6">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Company Logo</CardTitle>
                <CardDescription>
                  This logo will appear on your downloaded invoices.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="w-48 h-48 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center mb-6 overflow-hidden relative group">
                  {profile.logo ? (
                    <img
                      src={profile.logo}
                      alt="Company Logo"
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <div className="text-slate-400 dark:text-slate-500 flex flex-col items-center">
                      <UploadCloud className="w-10 h-10 mb-2" />
                      <span className="text-sm">No logo uploaded</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white text-slate-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-100 transition-colors"
                    >
                      Change Logo
                    </button>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png, image/jpeg, image/svg+xml"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  Upload New Logo
                </Button>
                <p className="text-xs text-slate-500 mt-4 text-center">
                  Max 2MB. Recommended 500x500px transparent PNG.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Details Settings */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Display Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name || ''}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Legal Name
                    </label>
                    <input
                      type="text"
                      name="legal_name"
                      value={profile.legal_name || ''}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email || ''}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={profile.phone || ''}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Fax
                    </label>
                    <input
                      type="text"
                      name="fax"
                      value={profile.fax || ''}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Website
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={profile.website || ''}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax & Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      GSTIN
                    </label>
                    <input
                      type="text"
                      name="GSTIN"
                      value={profile.GSTIN || ''}
                      onChange={handleInputChange}
                      className="input input-bordered w-full uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      PAN
                    </label>
                    <input
                      type="text"
                      name="PAN"
                      value={profile.PAN || ''}
                      onChange={handleInputChange}
                      className="input input-bordered w-full uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Full Address
                  </label>
                  <textarea
                    name="address"
                    value={profile.address || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="textarea textarea-bordered w-full"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={profile.city || ''}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={profile.state || ''}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={profile.pincode || ''}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={profile.country || ''}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {activeTab === 'invoice' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Defaults</CardTitle>
              <CardDescription>
                Set up default values that will auto-fill when you create a new
                invoice.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Supplier State Code
                  </label>
                  <input
                    type="text"
                    name="supplier_state_code"
                    value={profile.settings?.supplier_state_code || ''}
                    onChange={handleSettingsChange}
                    className="input input-bordered w-full"
                    placeholder="e.g. 27 for Maharashtra"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Transaction Type
                  </label>
                  <input
                    type="text"
                    name="transaction_type"
                    value={profile.settings?.transaction_type || ''}
                    onChange={handleSettingsChange}
                    className="input input-bordered w-full"
                    placeholder="e.g. Services / Goods"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Merchant ID
                  </label>
                  <input
                    type="text"
                    name="merchant_id"
                    value={profile.settings?.merchant_id || ''}
                    onChange={handleSettingsChange}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Default HSN/SAC Code
                  </label>
                  <input
                    type="text"
                    name="hsn_code"
                    value={profile.settings?.hsn_code || ''}
                    onChange={handleSettingsChange}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Invoice Number Prefix
                  </label>
                  <input
                    type="text"
                    name="prefix"
                    value={profile.settings?.prefix || ''}
                    onChange={handleSettingsChange}
                    className="input input-bordered w-full uppercase"
                    placeholder="e.g. VEA- (Leave blank for auto-generation)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visible Fields</CardTitle>
              <CardDescription>
                Select which fields should be visible and fillable when creating
                invoices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: 'documentRef',
                    label: 'Document Ref No'
                  },
                  {
                    id: 'documentDate',
                    label: 'Document Date'
                  },
                  {
                    id: 'category',
                    label: 'Category'
                  },
                  {
                    id: 'documentType',
                    label: 'Document Type Code'
                  },
                  {
                    id: 'irn',
                    label: 'IRN'
                  },
                  {
                    id: 'supplierPan',
                    label: 'Supplier PAN'
                  },
                  {
                    id: 'supplierStateCode',
                    label: 'Supplier State Code'
                  },
                  {
                    id: 'customerPan',
                    label: 'Customer PAN'
                  }
                ].map((field) => (
                  <label
                    key={field.id}
                    className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary"
                      checked={
                        profile.settings?.field_visibility?.[field.id] ?? false
                      }
                      onChange={(e) =>
                        handleFieldVisibilityChange(field.id, e.target.checked)
                      }
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
                      Show {field.label}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Signature & Terms</CardTitle>
              <CardDescription>
                Configure your authorized signature details and standard terms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Signature Name
                  </label>
                  <input
                    type="text"
                    name="signature_name"
                    value={profile.settings?.signature_name || ''}
                    onChange={handleSettingsChange}
                    className="input input-bordered w-full"
                    placeholder="Name for authorized signatory"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Signature Location
                  </label>
                  <input
                    type="text"
                    name="signature_location"
                    value={profile.settings?.signature_location || ''}
                    onChange={handleSettingsChange}
                    className="input input-bordered w-full"
                    placeholder="e.g. Pune"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Default Terms & Conditions
                </label>
                <textarea
                  name="terms_conditions"
                  value={profile.settings?.terms_conditions || ''}
                  onChange={handleSettingsChange}
                  rows={4}
                  className="textarea textarea-bordered w-full"
                ></textarea>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <BillingPage />
        </div>
      )}

      {activeTab === 'admin' && <AdminProfile />}
    </div>
  );
}
