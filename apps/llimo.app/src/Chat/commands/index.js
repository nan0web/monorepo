import { InfoCommand } from './info.js'
import { ListCommand } from './list.js'
import { ReleaseCommand } from './release.js'
import { TestCommand } from './test.js'
import { TranslateCommand } from './translate.js'
import { InitCommand } from './init.js'
import { ShopperCommand } from './shop.js'
import { PipelineCommand } from './pipeline.js'

export {
	InfoCommand,
	TestCommand,
	ReleaseCommand,
	ListCommand,
	TranslateCommand,
	InitCommand,
	ShopperCommand,
	PipelineCommand
}

export default {
	info: InfoCommand,
	test: TestCommand,
	release: ReleaseCommand,
	list: ListCommand,
	translate: TranslateCommand,
	init: InitCommand,
	shop: ShopperCommand,
	'pipeline': PipelineCommand,
}
