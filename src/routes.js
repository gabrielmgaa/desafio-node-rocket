import { randomUUID } from 'node:crypto'

import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'
import { verifyIdExists } from './utils/verify-id-exists.js'

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title } = req.query

      const tasks = database.select('tasks', title ? {
        title: title,
      } : null)

      res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body

      if (!title && !description) {
        return res.writeHead(400).end(JSON.stringify('Campo de title e description se fazem ' +
          'necessários para criação da task'))
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      }

      database.insert('tasks', task)

      res.writeHead(201).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const { task } = verifyIdExists(id)

      if (!task) {
        return res.writeHead(400).end()
      }

      database.delete('tasks', id)

      res.writeHead(204).end()
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const { title, description } = req.body

      if (!title || !description) {
        return res.writeHead(400).end(
          JSON.stringify({ message: 'title or description are required' })
        )
      }

      const { task } = verifyIdExists(id)
      
      if (!task) {
        return res.writeHead(400).end()
      }

      database.update('tasks', id, {
        title,
        description,
        updated_at: new Date(),
      })

      res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      const [task] = database.select('tasks', { id })

      if (!task) {
        return res.writeHead(404).end()
      }

      const completed_at = task.completed_at ? null : new Date()

      database.update('tasks', id, {
        completed_at,
      })

      return res.writeHead(204).end()
    }
  }
]