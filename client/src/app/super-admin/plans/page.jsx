'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  CreditCard,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
export default function PlansAdminPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    interval: 'month',
    features: [''],
    is_popular: false,
    is_active: true
  });
  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/plans/admin');
      if (res.success) {
        setPlans(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadPlans();
  }, []);
  const handleOpenModal = (plan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description || '',
        price: Number(plan.price),
        interval: plan.interval,
        features: plan.features.length > 0 ? plan.features : [''],
        is_popular: plan.is_popular,
        is_active: plan.is_active
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        interval: 'month',
        features: [''],
        is_popular: false,
        is_active: true
      });
    }
    setIsModalOpen(true);
  };
  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({
      ...formData,
      features: newFeatures
    });
  };
  const addFeatureRow = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };
  const removeFeatureRow = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      features: newFeatures.length ? newFeatures : ['']
    });
  };
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        features: formData.features.filter((f) => f.trim() !== '')
      };
      if (editingPlan) {
        await fetchApi(`/plans/${editingPlan.id}`, {
          method: 'PUT',
          data: payload
        });
      } else {
        await fetchApi('/plans', {
          method: 'POST',
          data: payload
        });
      }
      setIsModalOpen(false);
      loadPlans();
    } catch (err) {
      alert(err.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (id) => {
    if (
      !confirm(
        'Are you sure you want to delete this plan? If it is in use, it will be deactivated instead.'
      )
    )
      return;
    try {
      await fetchApi(`/plans/${id}`, {
        method: 'DELETE'
      });
      loadPlans();
    } catch (err) {
      alert(err.message || 'Failed to delete plan');
    }
  };
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-500" />
            Subscription Plans
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage public plans and their features.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add New Plan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border ${plan.is_popular ? 'border-indigo-500 shadow-indigo-500/10' : 'border-slate-200 dark:border-slate-800'} shadow-sm relative`}
            >
              {!plan.is_active && (
                <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-bl-xl rounded-tr-3xl font-semibold">
                  Inactive
                </div>
              )}
              {plan.is_popular && (
                <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-bl-xl rounded-tr-3xl font-semibold">
                  Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                {plan.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10 line-clamp-2">
                {plan.description}
              </p>

              <div className="mb-4">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  ₹{plan.price}
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  /{plan.interval}
                </span>
              </div>

              <ul className="space-y-2 mb-6 h-40 overflow-y-auto">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleOpenModal(plan)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              No plans found. Create your first plan!
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingPlan ? 'Edit Plan' : 'Add New Plan'}
              </h2>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="plan-form" onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2"
                      placeholder="e.g. Starter"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number(e.target.value)
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                    <span>Features (Contents)</span>
                    <button
                      type="button"
                      onClick={addFeatureRow}
                      className="text-indigo-600 text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Feature
                    </button>
                  </label>
                  <div className="space-y-2">
                    {formData.features.map((feat, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) =>
                            handleFeatureChange(index, e.target.value)
                          }
                          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm"
                          placeholder="e.g. Up to 50 Invoices / Month"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeatureRow(index)}
                          className="p-2 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_popular}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_popular: e.target.checked
                        })
                      }
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Mark as Popular
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked
                        })
                      }
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Active
                    </span>
                  </label>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                form="plan-form"
                type="submit"
                disabled={saving}
                className="btn btn-primary text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
