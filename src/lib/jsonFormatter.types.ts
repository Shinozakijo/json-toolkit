export interface ValidationError {
  message: string
  line: number
  column: number
  snippet: string
}

export interface ValidationResult {
  valid: boolean
  error?: ValidationError
}

export interface Scanner {
  raw: string
  pos: number
  line: number
  column: number
}
