import { Database } from "../database.js"

const database = new Database()

export function verifyIdExists(id) {
  const [task] = database.select('tasks', { id })

  return { task }
}