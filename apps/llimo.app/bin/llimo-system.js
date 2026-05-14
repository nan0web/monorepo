#!/usr/bin/env node
import { bootstrapApp } from '@nan0web/ui-cli'
import { SystemModel } from '../src/domain/SystemModel.js'

bootstrapApp(SystemModel)
