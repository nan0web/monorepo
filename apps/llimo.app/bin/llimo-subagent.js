#!/usr/bin/env node
import { bootstrapApp } from '@nan0web/ui-cli'
import { SubagentModel } from '../src/domain/app/SubagentModel.js'
import { AI } from '@nan0web/ai'

const ai = new AI()
try {
	await ai.refreshModels()
} catch (e) {}

bootstrapApp(SubagentModel, { ai })
