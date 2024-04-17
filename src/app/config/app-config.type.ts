export type AppConfig = {
  name: string
  env: string
  repoVersion: string
  versioning: {
    enable: boolean
    prefix: string
    version: string
  }
  globalPrefix: string
  http: {
    enable: boolean
    host: string
    port: number
  }
  jobEnable: boolean
};