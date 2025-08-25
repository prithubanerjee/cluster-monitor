'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Policy = {
  clusterId: string
  frequency: 'hourly' | 'daily' | 'weekly'
  retentionDays: number
  locked: boolean
  window: { start: string; end: string }
}

const defaultPolicy: Policy = {
  clusterId: '',
  frequency: 'daily',
  retentionDays: 7,
  locked: false,
  window: { start: '00:00', end: '06:00' },
}

export default function SnapshotPolicyForm() {
  const [policy, setPolicy] = useState<Policy>(defaultPolicy)
  const [saving, setSaving] = useState(false)
  const clusterId = process.env.NEXT_PUBLIC_CLUSTER_ID!

  useEffect(() => {
    api.get(`/clusters/${clusterId}/snapshot-policy`).then(res => setPolicy(res.data))
      .catch(() => setPolicy({ ...defaultPolicy, clusterId }))
  }, [clusterId])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put(`/clusters/${clusterId}/snapshot-policy`, policy)
      setPolicy(data)
      alert('Policy saved ✔')
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl p-4 shadow">
      <h2 className="text-xl font-semibold">Snapshot Policy</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col">
          <span className="text-sm text-gray-600 mb-1">Frequency</span>
          <select
            className="border rounded-lg p-2"
            value={policy.frequency}
            onChange={e => setPolicy(p => ({ ...p, frequency: e.target.value as Policy['frequency'] }))}
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600 mb-1">Retention (days)</span>
          <input
            type="number"
            className="border rounded-lg p-2"
            value={policy.retentionDays}
            min={1}
            onChange={e => setPolicy(p => ({ ...p, retentionDays: Number(e.target.value) }))}
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600 mb-1">Window Start</span>
          <input
            type="time"
            className="border rounded-lg p-2"
            value={policy.window.start}
            onChange={e => setPolicy(p => ({ ...p, window: { ...p.window, start: e.target.value } }))}
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600 mb-1">Window End</span>
          <input
            type="time"
            className="border rounded-lg p-2"
            value={policy.window.end}
            onChange={e => setPolicy(p => ({ ...p, window: { ...p.window, end: e.target.value } }))}
          />
        </label>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={policy.locked}
          onChange={e => setPolicy(p => ({ ...p, locked: e.target.checked }))}
        />
        <span>Enable Snapshot Locking</span>
      </label>

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save Policy'}
      </button>
    </form>
  )
}
