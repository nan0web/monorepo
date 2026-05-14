import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Model } from '@nan0web/core'

import { AutocompleteModel } from '../../../../../domain/components/AutocompleteModel.js'
import { BreadcrumbModel } from '../../../../../domain/components/BreadcrumbModel.js'
import { ButtonModel } from '../../../../../domain/components/ButtonModel.js'
import { ConfirmModel } from '../../../../../domain/components/ConfirmModel.js'
import { InputModel } from '../../../../../domain/components/InputModel.js'
import { SelectModel } from '../../../../../domain/components/SelectModel.js'
import { SpinnerModel } from '../../../../../domain/components/SpinnerModel.js'
import { TableModel } from '../../../../../domain/components/TableModel.js'
import { ToastModel } from '../../../../../domain/components/ToastModel.js'
import { TreeModel } from '../../../../../domain/components/TreeModel.js'

import { SandboxModel } from '../../../../../domain/SandboxModel.js'
import { ShowcaseAppModel } from '../../../../../domain/ShowcaseAppModel.js'
import Navigation from '../../../../../domain/Navigation.js'

describe('Base Model Migration v1.8.0', () => {
    it('AutocompleteModel extends Model', () => {
        assert.ok(new AutocompleteModel() instanceof Model)
    })
    it('BreadcrumbModel extends Model', () => {
        assert.ok(new BreadcrumbModel() instanceof Model)
    })
    it('ButtonModel extends Model', () => {
        assert.ok(new ButtonModel() instanceof Model)
    })
    it('ConfirmModel extends Model', () => {
        assert.ok(new ConfirmModel() instanceof Model)
    })
    it('InputModel extends Model', () => {
        assert.ok(new InputModel() instanceof Model)
    })
    it('SelectModel extends Model', () => {
        assert.ok(new SelectModel() instanceof Model)
    })
    it('SpinnerModel extends Model', () => {
        assert.ok(new SpinnerModel() instanceof Model)
    })
    it('TableModel extends Model', () => {
        assert.ok(new TableModel() instanceof Model)
    })
    it('ToastModel extends Model', () => {
        assert.ok(new ToastModel() instanceof Model)
    })
    it('TreeModel extends Model', () => {
        assert.ok(new TreeModel() instanceof Model)
    })
    it('SandboxModel extends Model', () => {
        assert.ok(new SandboxModel() instanceof Model)
    })
    it('ShowcaseAppModel extends Model', () => {
        assert.ok(new ShowcaseAppModel() instanceof Model)
    })
    it('Navigation extends Model', () => {
        assert.ok(new Navigation() instanceof Model)
    })
})
