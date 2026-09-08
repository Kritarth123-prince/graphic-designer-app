import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../../services/adminDashboard.service';
import StatusBadge from '../../components/admin/StatusBadge';

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-neutral-400">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-neutral-400">Loading…</p>;
  if (!data) return <p className="text-sm text-red-600">Couldn't load dashboard data.</p>;

  const { stats, recentActivity } = data;

  return (
    <div>
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={stats.products.total} sub={`${stats.products.published} published`} />
        <StatCard label="Featured Products" value={stats.products.featured} />
        <StatCard label="Total Orders" value={stats.orders.total} sub={`${stats.orders.pending} pending`} />
        <StatCard label="Delivered Orders" value={stats.orders.delivered} />
        <StatCard label="Payment Verified" value={stats.orders.paymentVerified} />
        <StatCard label="Unread Inquiries" value={stats.inquiries.unread} sub={`${stats.inquiries.total} total`} />
        <StatCard label="Custom Requests" value={stats.customRequests.total} />
        <StatCard
          label="Recorded Revenue"
          value={`₹${stats.recordedRevenue}`}
          sub="Manually verified orders only"
        />
      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-neutral-500 hover:text-neutral-900">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {recentActivity.orders.length === 0 && <p className="text-xs text-neutral-400">No orders yet.</p>}
            {recentActivity.orders.map((o) => (
              <li key={o._id} className="text-sm flex justify-between items-center">
                <span className="truncate">{o.productName}</span>
                <StatusBadge status={o.status} />
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold">Recent Inquiries</h2>
          <ul className="mt-4 space-y-3">
            {recentActivity.inquiries.length === 0 && <p className="text-xs text-neutral-400">No inquiries yet.</p>}
            {recentActivity.inquiries.map((i) => (
              <li key={i._id} className="text-sm flex justify-between items-center">
                <span className="truncate">{i.subject}</span>
                {!i.read && <span className="text-xs text-blue-600">New</span>}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold">Custom Requests</h2>
          <ul className="mt-4 space-y-3">
            {recentActivity.customRequests.length === 0 && (
              <p className="text-xs text-neutral-400">No requests yet.</p>
            )}
            {recentActivity.customRequests.map((c) => (
              <li key={c._id} className="text-sm flex justify-between items-center">
                <span className="truncate">{c.designType}</span>
                <span className="text-xs text-neutral-400">{c.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
