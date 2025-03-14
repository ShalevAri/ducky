import { writeFileSync } from 'node:fs'
import { bangs } from './bang.ts'

/* Developer script that converts ./bang.ts' array to hashmap.
 *   In your terminal of choice enter: cd src && node --experimental-strip-types .\hashbanggen.ts && cd ../
 *   If you should happen to enjoy PowerShell: cd src; node --experimental-strip-types .\hashbanggen.ts; cd ../
 * */

const hashbang: Record<string, { c?: string; d: string; r: number; s: string; sc?: string; t: string; u: string }> = {}
bangs.forEach((bang) => (hashbang[bang.t] = bang))

writeFileSync(
  './hashbang.ts',
  `export const bangs: {[key: string]: ({c?:string, d: string, r: number, s:string, sc?: string, t: string, u: string })} = ${JSON.stringify(
    hashbang
  )};`,
  'utf-8'
)
