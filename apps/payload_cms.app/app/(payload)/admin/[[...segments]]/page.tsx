import config from '../../../../payload.config.js'
import { generatePageMetadata, RootPage } from '@payloadcms/next/views'
import { importMap } from '../importMap.js'

export const generateMetadata = ({ params, searchParams }) =>
  generatePageMetadata({ config, params, searchParams })

const Page = ({ params, searchParams }) =>
  RootPage({ config, importMap, params, searchParams })

export default Page
