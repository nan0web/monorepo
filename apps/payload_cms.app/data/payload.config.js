import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { AdminUser, DocCategory, DocPage, MediaAsset } from './src/collections/index.js'
import { SiteConfig } from './src/collections/globals/SiteConfig.js'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'test-secret',
  editor: lexicalEditor({}),
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || 'mongodb://127.0.0.1/payload',
  }),
  collections: [AdminUser, DocCategory, DocPage, MediaAsset],
  globals: [SiteConfig],
})
