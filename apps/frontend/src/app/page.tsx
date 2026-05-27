'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listAssignments } from '@/lib/api';
import type { AssignmentDocument } from '@vedaai/shared';
import Skeleton from '@/components/Skeleton';

export default function HomePage() {
  const [items, setItems] = useState<AssignmentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    listAssignments(1, 20)
      .then((r) => {
        if (!active) return;
        setItems(r.items);
        setLoading(false);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Failed to load');
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = items.filter((item) => {
    const needle = search.trim().toLowerCase();
    if (!needle) return true;
    return [item.title, item.subject, item.className, item.school].some((value) => value?.toLowerCase().includes(needle));
  });

  return (
    <section className="space-y-4 lg:space-y-5">
      <div className="flex items-start gap-3 px-1">
        <span className="mt-3 h-3.5 w-3.5 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(74,222,128,0.25)]" />
        <div>
          <h1 className="text-[1.35rem] sm:text-[1.5rem] font-semibold text-slate-800">Assignments</h1>
          <p className="text-sm text-slate-400">Manage and create assignments for your classes.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[24px] bg-white/90 p-4 shadow-[0_14px_36px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center sm:justify-between">
        <button className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400" type="button">
          <FilterIcon />
          Filter By
        </button>
        <label className="flex min-h-[50px] flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <SearchIcon />
          <span className="sr-only">Search assignments</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Assignment"
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </label>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-40 rounded-[24px]" />
          <Skeleton className="h-40 rounded-[24px]" />
          <Skeleton className="h-40 rounded-[24px]" />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center rounded-[32px] bg-white px-6 py-14 text-center shadow-[0_18px_40px_rgba(0,0,0,0.06)]">
          <svg role="img" aria-label="Empty assignments illustration" width="220" height="160" viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-5" focusable="false">
            <circle cx="110" cy="76" r="56" fill="#F5F5F5" />
            <rect x="76" y="47" width="68" height="70" rx="12" fill="white" />
            <rect x="86" y="58" width="32" height="6" rx="3" fill="#0F172A" />
            <rect x="86" y="76" width="48" height="6" rx="3" fill="#D4D4D8" />
            <rect x="86" y="90" width="42" height="6" rx="3" fill="#D4D4D8" />
            <circle cx="126" cy="92" r="30" fill="white" stroke="#D8D0EA" strokeWidth="6" />
            <path d="M116 92l8 8 16-16" stroke="#F43F5E" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2 className="text-[1.4rem] font-semibold text-slate-700">No assignments yet</h2>
          <p className="mt-2 max-w-xl text-[15px] leading-7 text-slate-400">
            Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
          </p>
          <Link href="/assignments/new" className="mt-8 inline-flex items-center justify-center rounded-full bg-[#171717] px-6 py-3 text-[15px] font-medium text-white shadow-[0_12px_30px_rgba(0,0,0,0.26)] btn">
            <PlusIcon />
            Create Your First Assignment
          </Link>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((a) => (
            <article key={a._id} className="group rounded-[26px] bg-white px-5 py-5 shadow-[0_16px_35px_rgba(0,0,0,0.07)] transition-transform duration-150 hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link href={`/assignments/${a._id}`} className="block text-[1.3rem] font-semibold leading-tight text-slate-800 underline decoration-slate-300 decoration-2 underline-offset-4 transition-colors group-hover:text-slate-950">
                    {a.title}
                  </Link>
                </div>
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={`Open actions for ${a.title}`}>
                  <DotsIcon />
                </button>
              </div>
              <div className="mt-10 flex items-end justify-between gap-3 text-[15px] text-slate-600">
                <p>
                  <span className="font-semibold text-slate-700">Assigned on :</span> {new Date(a.createdAt ?? a._id).toLocaleDateString('en-GB')}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Due :</span> {a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-GB') : '—'}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function statusClass(status: string): string {
  const base = 'text-xs px-2 py-1 rounded-full font-medium';
  switch (status) {
    case 'completed':
      return `${base} bg-emerald-100 text-emerald-700`;
    case 'failed':
      return `${base} bg-red-100 text-red-700`;
    case 'active':
      return `${base} bg-amber-100 text-amber-700`;
    default:
      return `${base} bg-slate-100 text-slate-700`;
  }
}

function PlusIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DotsIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <circle cx="12" cy="5" r="1.8" fill="currentColor" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <circle cx="12" cy="19" r="1.8" fill="currentColor" />
    </svg>
  );
}

function FilterIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path d="M4 6h16l-6 7v5l-4 2v-7L4 6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 text-slate-400">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
