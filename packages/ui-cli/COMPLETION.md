# Shell Completion for NaN•Web CLI

The NaN•Web CLI now supports automatic shell completion for both Zsh and Bash.

## Usage

### Generate Completion Scripts

```bash
# Generate zsh completion script
nan0cli2 --completion zsh

# Generate bash completion script
nan0cli2 --completion bash
```

### Load Completion in Your Shell

#### Zsh

Add this to your `~/.zshrc`:

```bash
# NaN•Web CLI completion
source <(nan0cli2 --completion zsh)
```

Or for permanent installation:

```bash
nan0cli2 --completion zsh > ~/.nan0cli2-completion.zsh
source ~/.nan0cli2-completion.zsh
```

#### Bash

Add this to your `~/.bashrc`:

```bash
# NaN•Web CLI completion
source <(nan0cli2 --completion bash)
```

Or for permanent installation:

```bash
nan0cli2 --completion bash > ~/.nan0cli2-completion.bash
source ~/.nan0cli2-completion.bash
```

## Features

The completion system automatically detects:

- **Commands**: All available commands from your App model
- **Options**: Both long (`--option`) and short (`-o`) options
- **Help Text**: Descriptive help text for commands and options
- **Aliases**: Short aliases for options (e.g., `-d` for `--debug`)

## Implementation Details

The completion system works by:

1. **Extracting Command Structure**: Analyzes the App model class to extract commands, options, and their metadata
2. **Generating Shell Scripts**: Creates shell-specific completion scripts that understand your CLI structure
3. **Dynamic Completion**: Provides context-aware completion based on the current command position

## Supported Shells

- **Zsh**: Full support with descriptive help text
- **Bash**: Basic support with command and option completion

## Development

To test completion during development:

```bash
# Test zsh completion
node bin/cli.js --completion zsh

# Test bash completion  
node bin/cli.js --completion bash

# Test error handling
node bin/cli.js --completion invalid
```

## Troubleshooting

If completion doesn't work:

1. **Check shell support**: Ensure your shell is Zsh or Bash
2. **Reload shell**: After adding completion, reload your shell or run `source ~/.zshrc` / `source ~/.bashrc`
3. **Verify installation**: Run the completion command directly to check for errors
4. **Debug**: Add `set -x` before the completion source line to see debug output

## Examples

With completion enabled, you can:

```bash
nan0cli2 --<TAB>          # Show all options
nan0cli2 --target <TAB>   # Show help for target option
nan0cli2 <TAB>             # Show available commands
```