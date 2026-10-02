import config from '../../payload.config.js'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import { importMap } from './admin/importMap.js'
import '@payloadcms/next/css'

export default function Layout({ children }) {
  return <RootLayout config={config} importMap={importMap} serverFunction={handleServerFunctions}>{children}</RootLayout>
}
