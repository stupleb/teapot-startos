import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// teapot reads Twitter/X credentials from a JSONL file: one JSON object per
// line (upstream: sessions.example.jsonl). Snake_case field names are
// upstream's wire format. JSONL is not a FileHelper built-in, so this is a
// raw model over an array of sessions.

const sessionShape = z.object({
  id: z.number().int(),
  username: z.string(),
  kind: z.literal('cookie').catch('cookie'),
  auth_token: z.string(),
  ct0: z.string(),
})

const shape = z.array(sessionShape).catch([])

export type Session = z.infer<typeof sessionShape>

function stringify(sessions: Session[]): string {
  if (!sessions.length) return ''
  return sessions.map((s) => JSON.stringify(s)).join('\n') + '\n'
}

function parse(raw: string): unknown {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length)
    .flatMap((line) => {
      try {
        return [JSON.parse(line)]
      } catch {
        return []
      }
    })
}

export const sessionsJsonl = FileHelper.raw(
  { base: sdk.volumes.main, subpath: 'sessions.jsonl' },
  stringify,
  parse,
  (data) => shape.parse(data),
)
