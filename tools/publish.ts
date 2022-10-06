import 'zx/globals'
import path from 'path'
import fs from 'fs/promises'
import { createInterface } from 'readline'

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
})

let otpCache: string

main()
async function main() {
  const packages = await fs.readdir(path.join(process.cwd(), 'packages'))

  $.log = () => {}

  for (const packageName of packages) {
    const packagePath = path.join(process.cwd(), 'packages', packageName)
    const packageJSONPath = path.join(packagePath, 'package.json')

    const packageJSON = JSON.parse(await fs.readFile(packageJSONPath, 'utf8'))

    try {
      var npmVersion = (
        await $`npm view @reatom/${packageName}@alpha version`
      ).stdout.trim()
    } catch (error) {
      console.warn(`"${packageName}" is not published yet`)
      continue
    }

    if (packageJSON.version !== npmVersion) {
      const otp = (otpCache = await new Promise((r) => {
        let message = `Enter OTP code for "${packageName}@${packageJSON.version}"`
        if (otpCache) message += ` (${otpCache})`
        rl.question(`${message}: `, (otp) => r(otp || otpCache))
      }))

      if (!otp) throw new Error('OTP code missed')

      await $`cd ${packagePath} && npm publish --otp=${otp}`
    }
  }

  process.exit()
}
