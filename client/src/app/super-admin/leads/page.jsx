'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MessageSquare, CheckCircle, Mail, Clock } from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchLeads = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/contact`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
      );
      if (response.data.success) {
        setLeads(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLeads();
  }, []);
  const markAsRead = async (id) => {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/contact/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
      );
      if (response.data.success) {
        toast.success('Marked as read');
        setLeads(
          leads.map((lead) =>
            lead.id === id
              ? {
                  ...lead,
                  status: 'READ'
                }
              : lead
          )
        );
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update status');
    }
  };
  const unreadCount = leads.filter((l) => l.status === 'UNREAD').length;
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Contact Leads
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage inquiries from the public contact page.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 rounded-2xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Inquiries
                </p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {leads.length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 rounded-2xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Unread
                </p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {unreadCount}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <span className="loading loading-spinner text-indigo-600"></span>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center p-12 text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No contact leads found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className={`p-5 rounded-2xl border transition-all ${lead.status === 'UNREAD' ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
                >
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                          {lead.name}
                        </h4>
                        {lead.status === 'UNREAD' && (
                          <span className="badge badge-primary badge-sm">
                            New
                          </span>
                        )}
                      </div>
                      <a
                        href={`mailto:${lead.email}`}
                        className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <Mail className="w-4 h-4 mr-1" /> {lead.email}
                      </a>
                      <p className="text-slate-700 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        {lead.message}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <span className="text-xs text-slate-500 font-medium">
                        {dayjs(lead.createdAt).format('MMM D, YYYY h:mm A')}
                      </span>
                      {lead.status === 'UNREAD' && (
                        <button
                          onClick={() => markAsRead(lead.id)}
                          className="btn btn-sm btn-outline btn-primary rounded-lg"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
