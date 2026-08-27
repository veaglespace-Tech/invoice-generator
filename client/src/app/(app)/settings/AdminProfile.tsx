"use client"
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, UploadCloud, Save, CheckCircle2, User } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
}

export default function AdminProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetchApi<{ success: boolean; data: UserProfile }>('/auth/me');
      if (res.success && res.data) {
        setProfile(res.data);
      }
    } catch (error) {
      console.error("Failed to load user profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be smaller than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => prev ? { ...prev, avatar: reader.result as string } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    setSaveMessage('');
    try {
      const res = await fetchApi<{ success: boolean; message: string }>(`/users/${profile.id}`, {
        method: 'PUT',
        data: {
          name: profile.name,
          avatar: profile.avatar
        }
      });
      if (res.success) {
        setSaveMessage('Profile saved successfully!');
        window.dispatchEvent(new Event('profileUpdated'));
        setTimeout(() => setSaveMessage(''), 5000);
      }
    } catch (error) {
      console.error("Failed to save profile", error);
      alert("Failed to save profile. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-red-500">Failed to load admin profile.</div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Admin Profile</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your personal details and profile picture.</p>
        </div>
        <div className="flex items-center gap-4">
          {saveMessage && (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium text-sm animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-4 h-4" />
              {saveMessage}
            </span>
          )}
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar */}
        <div className="md:col-span-1 space-y-6">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-40 h-40 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center mb-6 overflow-hidden relative group">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-400 dark:text-slate-500 flex flex-col items-center">
                    <User className="w-12 h-12 mb-2" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white text-slate-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-100 transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/png, image/jpeg" 
                className="hidden" 
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                Upload New Photo
              </Button>
              <p className="text-xs text-slate-500 mt-4 text-center">Max 2MB. Recommended 256x256px.</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                  <input type="text" name="name" value={profile.name || ''} onChange={handleInputChange} className="input input-bordered w-full" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                  <input type="email" value={profile.email || ''} readOnly className="input input-bordered w-full bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed" title="Email cannot be changed" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                  <input type="text" value={profile.role || ''} readOnly className="input input-bordered w-full bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed uppercase" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
