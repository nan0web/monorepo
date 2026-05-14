#!/usr/bin/env node
import { bootstrapApp } from '@nan0web/ui-cli'
import { InspectorApp } from '../src/domain/app/InspectorApp.js'

bootstrapApp(InspectorApp, { appName: 'nan0inspect', root: '.' })
