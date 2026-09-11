export type DiffType = 'added' | 'removed' | 'changed' | 'unchanged'

export interface DiffEntry {
  path: string
  type: DiffType
  before?: unknown
  after?: unknown
}
