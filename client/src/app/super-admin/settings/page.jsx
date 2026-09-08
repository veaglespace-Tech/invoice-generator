'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import {
  Lock,
  User,
  UploadCloud,
  CheckCircle2,
  Loader2,
  Save
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
export default function SuperAdminSettings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const fileInputRef = useRef(null);
  useEffect(() => {
    loadProfile();
  }, []);
  const loadProfile = async () => {
    try {
      const res = await fetchApi('/auth/me');
      if (res.success && res.data) {
        setProfile({
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
          avatar: res.data.avatar || null
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      setProfile({
        ...profile,
        avatar: base64
      });
    };
    reader.readAsDataURL(file);
  };
  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setSaveMessage('');
    try {
      const res = await fetchApi(`/users/${profile.id}`, {
        method: 'PUT',
        data: {
          name: profile.name,
          avatar: profile.avatar
        }
      });
      if (res.success) {
        setSaveMessage('Profile saved successfully!');
        window.dispatchEvent(new Event('profileUpdated'));
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }
  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your super admin account preferences.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {saveMessage && (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-5 h-5" />
              {saveMessage}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary text-white px-6 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-4xl">
        {/* Profile Settings */}
        <Card>
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Profile Information
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Update your account profile details and photo.
              </p>
            </div>
          </div>
          <div className="p-6 space-y-8 flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-32 h-32 rounded-full border-4 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center overflow-hidden relative group">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-400 dark:text-slate-500 flex flex-col items-center">
                    <User className="w-12 h-12 mb-2 text-slate-300 dark:text-slate-600" />
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white text-slate-900 p-2 rounded-full font-medium hover:bg-slate-100 transition-colors shadow-lg"
                    title="Upload Photo"
                  >
                    <UploadCloud className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <span className="text-xs text-slate-500">Allowed: JPG, PNG</span>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Name
                </label>
                <input
                  type="text"
                  value={profile?.name || ''}
                  onChange={(e) =>
                    setProfile((prev) =>
                      prev
                        ? {
                            ...prev,
                            name: e.target.value
                          }
                        : null
                    )
                  }
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  onChange={(e) =>
                    setProfile((prev) =>
                      prev
                        ? {
                            ...prev,
                            email: e.target.value
                          }
                        : null
                    )
                  }
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card>
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Security & Password
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Update your password to keep your account secure.
              </p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2 max-w-md">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                />
              </div>
              <div className="space-y-2 max-w-md">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                />
              </div>
            </div>
            <button className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
              Update Password
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
