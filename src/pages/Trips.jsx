import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils';
import { CheckSquare, XSquare, FileText, Search, MoreHorizontal } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const sampleTrips = [
  { id: 'T-001', title: 'Client Meeting - NYC', requester: 'Alice', project: 'Acme Corp', start: '2026-02-10', end: '2026-02-12', amount: 420.0, status: 'Pending', receipts: 1 },
  { id: 'T-002', title: 'Conference - LA', requester: 'Bob', project: 'Marketing', start: '2026-03-05', end: '2026-03-08', amount: 980.5, status: 'Approved', receipts: 3 },
  { id: 'T-003', title: 'Site Visit - Chicago', requester: 'Charlie', project: 'Field Ops', start: '2026-01-20', end: '2026-01-22', amount: 310.0, status: 'Rejected', receipts: 0 },
  { id: 'T-004', title: 'Training - Boston', requester: 'Dana', project: 'HR', start: '2026-02-18', end: '2026-02-20', amount: 250.0, status: 'Pending', receipts: 2 },
];

const STATUS_ORDER = ['All', 'Pending', 'Approved', 'Rejected'];

const badgeColor = (status) => {
  if (status === 'Approved') return '#10b981';
  if (status === 'Rejected') return '#f43f5e';
  return '#f59e0b';
};

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 8;
  const [detail, setDetail] = useState(null); // modal detail

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/trips/');
      // assume API returns array in res.data
      setTrips(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      // fallback to sample data if API missing
      console.warn('Trips API not available, using sample data.', err?.message || err);
      setTrips(sampleTrips);
      setError('Unable to fetch trips from API — using sample data');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return trips.filter(t => {
      if (filter !== 'All' && t.status !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        return [t.id, t.title, t.requester, t.project].some(field => String(field).toLowerCase().includes(q));
      }
      return true;
    });
  }, [trips, filter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id); else copy.add(id);
      return copy;
    });
  };

  const selectAll = (checked) => {
    if (checked) {
      setSelected(new Set(filtered.map(t => t.id)));
    } else {
      setSelected(new Set());
    }
  };

  const bulkUpdate = async (status) => {
    // Attempt API bulk update if available, otherwise local update
    try {
      // Example bulk endpoint: POST /trips/bulk_update/ { ids: [...], status }
      await api.post('/trips/bulk_update/', { ids: Array.from(selected), status });
      toast.success('Bulk update applied');
      fetchTrips();
    } catch (err) {
      // fallback local change
      setTrips(prev => prev.map(t => selected.has(t.id) ? { ...t, status } : t));
      toast.info('Bulk update applied locally (API unavailable)');
    } finally {
      setSelected(new Set());
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/trips/${id}/`, { status });
      toast.success(`Trip ${id} ${status}`);
      fetchTrips();
    } catch (err) {
      // fallback local update
      setTrips(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      setSelected(prev => { const copy = new Set(prev); copy.delete(id); return copy; });
      toast.info('Updated locally (API unavailable)');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Trips Approval</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>Manage trip requests and approvals</p>
        </div>
        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.4rem 0.6rem', borderRadius: 6 }}>Prev</button>
          <div style={{ alignSelf: 'center', color: 'var(--text-secondary)' }}>{page} / {totalPages}</div>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '0.4rem 0.6rem', borderRadius: 6 }}>Next</button>
        </div>
      </div>

      {/* Detail modal */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }} onClick={() => setDetail(null)}>
          <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 12, width: 720, maxWidth: '95%', boxShadow: '0 8px 30px rgba(2,6,23,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>{detail.title}</h3>
              <div style={{ color: 'var(--text-secondary)' }}>{detail.id}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Requester</div>
                <div style={{ fontWeight: 600 }}>{detail.requester}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Project</div>
                <div style={{ fontWeight: 600 }}>{detail.project}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Dates</div>
                <div>{detail.start} → {detail.end}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Amount</div>
                <div style={{ fontWeight: 600 }}>{formatCurrency(detail.amount)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <button onClick={() => { updateStatus(detail.id, 'Rejected'); setDetail(null); }} style={{ padding: '0.4rem 0.6rem', borderRadius: 8, background: '#ef4444', color: 'white', border: 'none' }}>Reject</button>
              <button onClick={() => { updateStatus(detail.id, 'Approved'); setDetail(null); }} style={{ padding: '0.4rem 0.6rem', borderRadius: 8, background: '#10b981', color: 'white', border: 'none' }}>Approve</button>
            </div>
          </motion.div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              placeholder="Search by ID, title, requester, project"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ padding: '0.5rem 0.75rem 0.5rem 2.2rem', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', color: 'white', width: 360 }}
            />
          </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
        {STATUS_ORDER.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: '0.5rem 0.75rem', borderRadius: 10, border: 'none', background: s === filter ? 'var(--accent-blue)' : 'rgba(255,255,255,0.02)', color: s === filter ? 'white' : 'var(--text-secondary)', cursor: 'pointer' }}>{s}</button>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" onChange={(e) => selectAll(e.target.checked)} checked={filtered.length > 0 && selected.size === filtered.length} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => bulkUpdate('Approved')} style={{ padding: '0.35rem 0.6rem', borderRadius: 8, background: '#10b981', color: 'white', border: 'none' }}><CheckSquare size={14} /> Approve</button>
              <button onClick={() => bulkUpdate('Rejected')} style={{ padding: '0.35rem 0.6rem', borderRadius: 8, background: '#f43f5e', color: 'white', border: 'none' }}><XSquare size={14} /> Reject</button>
            </div>
          </div>

          <div style={{ color: 'var(--text-secondary)' }}>{filtered.length} requests • Page {page}/{totalPages}</div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <th style={{ padding: '0.75rem' }}></th>
                <th>ID</th>
                <th>Trip</th>
                <th>Requester</th>
                <th>Project</th>
                <th>Dates</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(loading ? Array.from({ length: perPage }) : pageItems).map((trip, idx) => (
                <tr key={trip?.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', verticalAlign: 'middle' }}>
                  <td style={{ padding: '0.6rem' }}>{loading ? <div style={{ width: 16, height: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 2 }} /> : <input type="checkbox" checked={selected.has(trip.id)} onChange={() => toggleSelect(trip.id)} />}</td>
                  <td style={{ padding: '0.6rem', fontWeight: 600 }}>{loading ? <div style={{ width: 80, height: 14, background: 'rgba(255,255,255,0.03)' }} /> : trip.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{loading ? <div style={{ width: 180, height: 14, background: 'rgba(255,255,255,0.03)' }} /> : trip.title}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{loading ? <div style={{ width: 80, height: 12, background: 'rgba(255,255,255,0.03)' }} /> : `${trip.receipts} receipts`}</div>
                  </td>
                  <td>{loading ? <div style={{ width: 60, height: 12, background: 'rgba(255,255,255,0.03)' }} /> : trip.requester}</td>
                  <td>{loading ? <div style={{ width: 60, height: 12, background: 'rgba(255,255,255,0.03)' }} /> : trip.project}</td>
                  <td>{loading ? <div style={{ width: 120, height: 12, background: 'rgba(255,255,255,0.03)' }} /> : `${trip.start} → ${trip.end}`}</td>
                  <td>{loading ? <div style={{ width: 60, height: 12, background: 'rgba(255,255,255,0.03)' }} /> : formatCurrency(trip.amount)}</td>
                  <td>
                    {loading ? <div style={{ width: 80, height: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 999 }} /> : (
                      <span style={{ padding: '0.35rem 0.6rem', borderRadius: 999, background: 'rgba(0,0,0,0.15)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: badgeColor(trip.status) }}>
                        <span style={{ width: 8, height: 8, borderRadius: 8, background: badgeColor(trip.status), display: 'inline-block' }}></span>
                        <span style={{ color: 'inherit' }}>{trip.status}</span>
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {loading ? (
                      <div style={{ width: 140, height: 30, background: 'rgba(255,255,255,0.03)', display: 'inline-block', borderRadius: 8 }} />
                    ) : (
                      <>
                        {trip.status !== 'Approved' && (
                          <button onClick={() => updateStatus(trip.id, 'Approved')} style={{ marginRight: '0.5rem', padding: '0.35rem 0.6rem', borderRadius: 8, background: '#0ea5a0', color: 'white', border: 'none' }}>Approve</button>
                        )}
                        {trip.status !== 'Rejected' && (
                          <button onClick={() => updateStatus(trip.id, 'Rejected')} style={{ marginRight: '0.5rem', padding: '0.35rem 0.6rem', borderRadius: 8, background: '#ef4444', color: 'white', border: 'none' }}>Reject</button>
                        )}
                        <button onClick={() => setDetail(trip)} style={{ padding: '0.35rem 0.6rem', borderRadius: 8, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.03)' }}><FileText size={14} /></button>
                        <button style={{ marginLeft: '0.5rem', padding: '0.35rem 0.45rem', borderRadius: 8, background: 'transparent', color: 'var(--text-secondary)', border: 'none' }}><MoreHorizontal size={16} /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Trips;
