# Contributing to @nan0web/share.app

## Code of Conduct

As contributors and maintainers of this project, we pledge to respect all people who contribute through reporting issues, posting feature requests, updating documentation, submitting pull requests or patches, and other activities.

We are committed to making participation in this project a harassment-free experience for everyone, regardless of:

- Level of experience
- Gender, gender identity and expression
- Sexual orientation
- Disability
- Personal appearance
- Body size, race, ethnicity, age, or religion

### Technical Standards & Development Workflow (TDD)

1. **Write Tests First (TDD)**: Any new adapter or feature must be accompanied by comprehensive node:test specifications.
2. **Strict Model-First Architecture**: Always declare dynamic introspectable field descriptors statically on configuration Models.
3. **No Semicolons & Clean ESM**: Follow our ESM-native modular standard with clean imports and standard tab spacing.
4. **Validation Pipeline**: Ensure `npm run test:all` passes successfully (includes unit tests, doc tests, integration tests, and Knip validation) before opening a Pull Request.

## License

By contributing, you agree that your contributions will be licensed under the ISC License.
