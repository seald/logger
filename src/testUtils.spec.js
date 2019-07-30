import path from 'path'
import { spawn } from 'child_process'
const nodeCommand = process.execPath

export const spawnFile = async (env, file) => {
  const subprocess = spawn(nodeCommand, [path.join(__dirname, './spawnedTests', file)], { env })
  const end = new Promise((resolve, reject) => {
    subprocess.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error('exit code is ' + code))
    })
    subprocess.on('error', (error) => {
      reject(error)
    })
  })
  let stdout = ''
  subprocess.stdout.on('data', (data) => {
    stdout += data
  })
  let stderr = ''
  subprocess.stderr.on('data', (data) => {
    stderr += data
  })
  await end
  return { stdout, stderr }
}
