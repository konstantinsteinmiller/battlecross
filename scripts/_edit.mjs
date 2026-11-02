import fs from 'node:fs'

/** Replace one exact piece of a file (its line ends, LF or CRLF, are the file's own); throws when it is not there. */
export const edit = (f, a, b) => {
  const s = fs.readFileSync(f, 'utf8')
  const crlf = s.includes('\r\n')
  const fix = (x) => (crlf ? x.replace(/\r?\n/g, '\r\n') : x)
  const from = fix(a)
  if (!s.includes(from)) throw new Error(f + ': ' + a.slice(0, 70))
  fs.writeFileSync(f, s.replace(from, () => fix(b)))
}
