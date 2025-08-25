/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const dataDir = path.join(process.cwd(), 'data')

// GET time series data
router.get('/clusters/:id/timeseries', async ({ params, response }) => {
  const id = params.id
  const tsPath = path.join(dataDir, 'cluster_timeseries.json')
  const raw = await fs.readFile(tsPath, 'utf-8')
  const payload = JSON.parse(raw)

  if (payload.clusterId !== id) {
    return response.notFound({ error: 'Cluster not found' })
  }

  return {
    clusterId: payload.clusterId,
    points: payload.points // [{t, iops, throughput}]
  }
})

// GET snapshot policy
router.get('/clusters/:id/snapshot-policy', async ({ params, response }) => {
  const id = params.id
  const policyPath = path.join(dataDir, `snapshot_policy_${id}.json`)
  try {
    const raw = await fs.readFile(policyPath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return response.notFound({ error: 'Policy not found' })
  }
})

// PUT snapshot policy
router.put('/clusters/:id/snapshot-policy', async ({ params, request }) => {
  const id = params.id
  const body = request.body()
  const policyPath = path.join(dataDir, `snapshot_policy_${id}.json`)
  const next = { clusterId: id, ...body }
  await fs.writeFile(policyPath, JSON.stringify(next, null, 2), 'utf-8')
  return next
})
