import fs from 'node:fs'
import path from 'node:path'
import DB from '@nan0web/db'
import DBFSDir from '../../packages/db-fs/src/DBFS/parts/DBFSDir.js'
import { TransformModel } from './src/domain/models/TransformModel.js'
import { AdminUser, DocCategory, DocPage, MediaAsset, SiteConfig } from './src/domain/index.js'

async function run() {
	const db = new DB()
	const fsMount = new DBFSDir(process.cwd())
	db.mount('@app', fsMount)
	await db.connect()

	const transform = new TransformModel(
		{
			target: 'src/domain',
			output: 'src/collections',
			force: true,
		},
		{ db }
	)

	// Since we mock target, let's inject models manually
	const originalRequireDomainIndex = transform.requireDomainIndex.bind(transform)
	transform.requireDomainIndex = async () => {
		return { AdminUser, DocCategory, DocPage, MediaAsset, SiteConfig }
	}

	for await (const intent of transform.run()) {
		console.log(intent)
	}
}

run().catch(console.error)
