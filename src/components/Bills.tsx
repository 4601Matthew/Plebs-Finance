import { useState, useEffect } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { api } from '../api';
import { Bill } from '../types';
import { parseISO, isPast, isToday } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [profile, setProfile] = useState<any>({ currency: 'NZD', timezone: 'Pacific/Auckland' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [b, p] = await Promise.all([api.getBills(), api.getProfile()]);
      setBills(b);
      setProfile(p);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: profile.currency || 'NZD',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return formatInTimeZone(parseISO(dateStr), profile.timezone || 'Pacific/Auckland', 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addBill({
        ...formData,
        amount: parseFloat(formData.amount),
        paid: false,
      });
      setShowAddModal(false);
      setFormData({
        description: '',
        amount: '',
        dueDate: new Date().toISOString().split('T')[0],
      });
      loadData();
    } catch (error) {
      alert('Failed to add bill');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bill?')) return;
    try {
      await api.deleteBill(id);
      loadData();
    } catch (error) {
      alert('Failed to delete bill');
    }
  };

  const handleTogglePaid = async (bill: Bill) => {
    try {
      // Since we don't have an update endpoint, we'll delete and recreate
      await api.deleteBill(bill.id);
      await api.addBill({
        ...bill,
        paid: !bill.paid,
      });
      loadData();
    } catch (error) {
      alert('Failed to update bill');
    }
  };

  const sortedBills = [...bills].sort((a, b) => {
    if (a.paid !== b.paid) return a.paid ? 1 : -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const unpaidBills = bills.filter((b) => !b.paid);
  const totalUnpaid = unpaidBills.reduce((sum, b) => sum + b.amount, 0);
  const overdueBills = unpaidBills.filter((b) => {
    const dueDate = parseISO(b.dueDate);
    return isPast(dueDate) && !isToday(dueDate);
  });

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Bills</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Bill
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Unpaid Bills</p>
          <p className="text-2xl font-bold text-red-600">{unpaidBills.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Unpaid</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalUnpaid)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Overdue</p>
          <p className="text-2xl font-bold text-orange-600">{overdueBills.length}</p>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedBills.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No bills yet
                  </td>
                </tr>
              ) : (
                sortedBills.map((bill) => {
                  const dueDate = parseISO(bill.dueDate);
                  const isOverdue = !bill.paid && isPast(dueDate) && !isToday(dueDate);
                  const isDueToday = !bill.paid && isToday(dueDate);

                  return (
                    <tr key={bill.id} className={bill.paid ? 'opacity-60' : ''}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{bill.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={isOverdue ? 'text-red-600 font-semibold' : isDueToday ? 'text-orange-600 font-semibold' : ''}>
                          {formatDate(bill.dueDate)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-red-600">
                        {formatCurrency(bill.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {bill.paid ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Paid
                          </span>
                        ) : isOverdue ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Overdue
                          </span>
                        ) : isDueToday ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                            Due Today
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleTogglePaid(bill)}
                            className={`${bill.paid ? 'text-green-600' : 'text-gray-400'} hover:text-green-600`}
                            title={bill.paid ? 'Mark as unpaid' : 'Mark as paid'}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(bill.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add Bill</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Car Mechanic Bill"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

