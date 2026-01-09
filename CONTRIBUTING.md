# Contributing to AppFeedback

Thank you for your interest in contributing to AppFeedback! This is an open-source project and we welcome contributions from the community.

## How to Contribute

### 1. Fork the Repository

```bash
# Fork via GitHub UI, then clone your fork
git clone https://github.com/YOUR_USERNAME/appfeedback.git
cd appfeedback

# Add upstream remote
git remote add upstream https://github.com/DeltaCompute24/appfeedback.git
```

### 2. Set Up Development Environment

```bash
# Install frontend dependencies
cd dashboard
npm install

# Install backend dependencies (optional, for local API)
cd ../backend
pip install -r requirements.txt
```

### 3. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 4. Make Your Changes

- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 5. Test Your Changes

```bash
# Run frontend locally
cd dashboard
npm run dev

# Run backend locally (optional)
cd backend
uvicorn app.main:app --reload --port 8000
```

### 6. Commit and Push

```bash
git add .
git commit -m "feat: description of your changes"
git push origin feature/your-feature-name
```

### 7. Create a Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your feature branch
4. Fill out the PR template
5. Submit for review

## Contribution Types

### Algorithm Changes

The ranking algorithm is fully open source. To propose changes:

1. Read [`algorithm/ranking_prompt.md`](algorithm/ranking_prompt.md)
2. Open an issue explaining the problem
3. Propose new weights or factors with justification
4. Provide example calculations
5. Submit a PR updating both the documentation and implementation

### Bug Fixes

1. Check existing issues first
2. Create an issue if one doesn't exist
3. Reference the issue in your PR

### New Features

1. Open an issue to discuss the feature first
2. Get feedback from maintainers
3. Implement and submit a PR

### Documentation

- Fix typos, improve clarity
- Add examples
- Translate to other languages

## Code Style

### JavaScript/React
- Use functional components with hooks
- Prefer `const` over `let`
- Use meaningful variable names

### Python
- Follow PEP 8
- Use type hints where helpful
- Keep functions focused and small

### CSS
- Use CSS variables for theming
- Mobile-first responsive design
- Meaningful class names

## Pull Request Guidelines

- Keep PRs focused on a single change
- Include screenshots for UI changes
- Update README if adding features
- Ensure all tests pass

## Community Guidelines

- Be respectful and constructive
- Help others learn
- Give credit where due
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md)

## Questions?

- Open an issue with the "question" label
- Join discussions on GitHub

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
