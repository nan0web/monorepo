#!/usr/bin/env node
import { bootstrapApp } from '@nan0web/ui-cli'
import { WorkflowModel } from '../src/domain/WorkflowModel.js'

bootstrapApp(WorkflowModel)
