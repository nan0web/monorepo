#!/usr/bin/env node
import { bootstrapApp } from '@nan0web/ui-cli'
import { SubagentModel } from '../src/domain/SubagentModel.js'

bootstrapApp(SubagentModel)
