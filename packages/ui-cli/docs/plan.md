# Plan: Add Shell Completion Support to bootstrapApp

## Goal

Automatically generate and load shell completion scripts for zsh and bash when using bootstrapApp.

## Analysis

The current bootstrapApp system:

1. Uses Model-as-App pattern where App classes define CLI structure
2. Commands are defined as static properties on Model classes
3. CommandParser handles argv parsing
4. No existing completion generation

## Implementation Strategy

### 1. Create Completion Generator Module

- **File**: `packages/ui-cli/src/ui/core/CompletionGenerator.js`
- **Purpose**: Generate completion scripts for zsh/bash based on App model structure
- **Key Methods**:
  - `generateCompletionScript(shellType, appModel)` - Main generation
  - `extractCommandsFromModel(model)` - Extract command structure
  - `generateZshCompletion()` - Zsh-specific format
  - `generateBashCompletion()` - Bash-specific format

### 2. Add Completion Command to App

- **File**: `packages/ui-cli/src/domain/App.js`
- **Add**: Static `completion` property and handling in run() method
- **Behavior**: When `--completion` flag is detected, generate and output completion script

### 3. Update bootstrapApp

- **File**: `packages/ui-cli/src/ui/bootstrapApp.js`
- **Add**: Automatic completion script loading detection
- **Behavior**: Check for completion script request and handle accordingly

### 4. Update CLI Binaries

- **Files**: `packages/ui-cli/bin/cli.js`, `packages/ui-cli/bin/nan0cli.js`
- **Add**: Completion script installation instructions

## Technical Details

### Completion Script Format

```bash
# Zsh example
_comp_myapp() {
  local commands="$(myapp --completion zsh)"
  compadd -- $commands
}
compdef _comp_myapp myapp
```

### Command Extraction

- Parse static properties from App model
- Extract: command names, options, aliases, help text
- Handle nested subcommands

### Integration Points

1. **Detection**: Check `argv` for completion-related flags
2. **Generation**: Create script based on current App model
3. **Output**: Return script content instead of normal execution
4. **Installation**: Provide user instructions for shell setup

## Files to Modify

1. `packages/ui-cli/src/ui/core/CompletionGenerator.js` (new)
2. `packages/ui-cli/src/domain/App.js` (add completion support)
3. `packages/ui-cli/src/ui/bootstrapApp.js` (add completion detection)
4. `packages/ui-cli/bin/cli.js` (add completion instructions)

## Verification

- Test with: `./bin/cli.js --completion zsh`
- Test with: `./bin/cli.js --completion bash`
- Verify script contains expected commands and options
