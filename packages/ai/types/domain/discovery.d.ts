/**
 * Scans the workspace directory for nan0web.nan0 configuration files and builds an inspector registry.
 * @param {string} workspacePath
 * @returns {Promise<Map<string, WorkspaceInspectorModel>>}
 */
export function scanRegistry(workspacePath: string): Promise<Map<string, WorkspaceInspectorModel>>;
import { WorkspaceInspectorModel } from './WorkspaceInspectorModel.js';
