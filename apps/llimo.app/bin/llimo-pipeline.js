#!/usr/bin/env node
import { bootstrapApp } from '@nan0web/ui-cli'
import { PipelineModel } from '../src/domain/PipelineModel.js'

bootstrapApp(PipelineModel)
