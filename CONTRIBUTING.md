# Contributing to Expo Rich Text Editor

We love your input! We want to make contributing to `expo-rte` as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio and emulator (for Android development)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/mdadul/expo-rte.git
   cd expo-rte
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the example app**
   ```bash
   cd example
   npm install
   ```

4. **Run the example on iOS**
   ```bash
   npx expo run:ios
   ```

5. **Run the example on Android**
   ```bash
   npx expo run:android
   ```

### Project Structure

```
expo-rte/
├── src/                    # Source code
│   ├── ExpoRTE.types.ts   # TypeScript type definitions
│   ├── ExpoRTEModule.ts   # JavaScript module interface
│   ├── ExpoRTEView.tsx    # React Native component wrapper
│   ├── RichTextEditor.tsx # Main React component
│   └── index.ts           # Main export file
├── android/               # Android native implementation
│   └── src/main/java/expo/modules/rte/
│       ├── ExpoRTEModule.kt
│       └── ExpoRTEView.kt
├── ios/                   # iOS native implementation
│   ├── ExpoRTEModule.swift
│   └── ExpoRTEView.swift
├── example/               # Example application
└── docs/                  # Documentation
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

We use Jest for unit testing and Detox for E2E testing. When adding new features:

1. Add unit tests in `__tests__/` directory
2. Add E2E tests for user-facing features
3. Ensure all tests pass before submitting PR

### Test Structure

```javascript
describe('RichTextEditor', () => {
  it('should render with default props', () => {
    // Test implementation
  });

  it('should handle formatting correctly', () => {
    // Test implementation
  });
});
```

## 📝 Code Style

We use ESLint and Prettier for code formatting. The configuration is included in the project.

### Code Style Guidelines

- Use TypeScript for all new code
- Follow React Native and Expo conventions
- Use descriptive variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Formatting

```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🐛 Bug Reports

We use GitHub issues to track public bugs. Report a bug by opening a new issue.

### Great Bug Reports Include:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- expo-rte version: [e.g. 1.0.0]
- React Native version: [e.g. 0.72.0]
- Expo version: [e.g. 49.0.0]
- Platform: [iOS/Android]
- Device: [e.g. iPhone 14, Pixel 7]

**Additional context**
Add any other context about the problem here.
```

## 💡 Feature Requests

We welcome feature requests! Please open an issue to discuss what you would like to change.

### Feature Request Template

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## 📚 Documentation

Documentation is crucial for a good developer experience. When contributing:

1. Update README.md for new features
2. Add JSDoc comments to public APIs
3. Update TypeScript type definitions
4. Add examples for new functionality

### Documentation Style

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Keep documentation up to date with code changes

## 🔄 Release Process

We use semantic versioning for releases:

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

### Release Checklist

- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Version is bumped appropriately
- [ ] Changelog is updated
- [ ] Release notes are prepared

## 📋 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm test
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use a clear and descriptive title
   - Fill out the PR template completely
   - Link any related issues

### PR Title Format

Use conventional commits format:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

## 📱 Platform-Specific Guidelines

### iOS Development

- Follow iOS Human Interface Guidelines
- Test on multiple iOS versions and devices
- Use appropriate iOS-specific styling
- Handle safe areas and notches properly

### Android Development

- Follow Material Design principles
- Test on multiple Android versions and devices
- Handle different screen densities
- Consider Android-specific behaviors

## 🔒 Security

If you discover a security vulnerability, please send an email to emdadulislam580@gmail.com instead of opening a public issue.

## 📄 License

By contributing to expo-rte, you agree that your contributions will be licensed under the MIT License.

## 🙋‍♂️ Questions?

If you have questions about contributing, feel free to:

- Open an issue with the "question" label
- Email the maintainers
- Start a discussion in GitHub Discussions

## 🎉 Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- Special thanks in documentation

Thank you for contributing! 🚀
