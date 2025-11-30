# Contributing to CS2 Pick'em

Thank you for your interest in contributing!

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/filiphsps/cs2-pickem.git
cd cs2-pickem
```

2. Install dependencies:
```bash
pnpm install
```

3. Build all packages:
```bash
pnpm build
```

4. Run tests:
```bash
pnpm test
```

## Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/). All commits must follow this format:

```
<type>(<scope>): <description>.

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or external dependencies
- `ci`: CI configuration changes
- `chore`: Other changes that don't modify src or test files

### Scopes

- `api`: API package changes
- `cli`: CLI package changes
- `http`: HTTP client changes
- `endpoints`: API endpoints changes
- `errors`: Error handling changes
- `utils`: Utility functions changes
- `deps`: Dependency updates

### Examples

```bash
feat(api): add bracket scoring utility
fix(cli): handle missing config file gracefully
docs(api): add browser usage examples
test(endpoints): add predictions endpoint tests
chore(deps): update effect to v3.11
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with appropriate tests
3. Ensure all tests pass: `pnpm test`
4. Ensure code is properly formatted: `pnpm lint:fix`
5. Commit with conventional commit messages
6. Open a Pull Request

## Code Style

We use [Biome](https://biomejs.dev/) for linting and formatting. Run:

```bash
# Check for issues
pnpm lint

# Auto-fix issues
pnpm lint:fix

# Format code
pnpm format
```

## Testing

- Write tests alongside your code (co-located `.test.ts` files)
- Aim for high test coverage
- Use Vitest for all tests

## Questions?

Open an issue or start a discussion on GitHub.
```
