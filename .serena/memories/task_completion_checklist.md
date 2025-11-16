# BrepFlow Task Completion Checklist

## Before Marking Task Complete

### Code Quality Checks

1. **Run linting**: `pnpm run lint` - Must pass without errors
2. **Type checking**: `pnpm run typecheck` - Must compile successfully
3. **Format code**: `pnpm run format` - Apply consistent formatting
4. **Run tests**: `pnpm run test` - All unit tests must pass

### Build Validation

1. **Clean build**: `pnpm run build` - Must build all packages successfully
2. **Turbo pipeline**: Verify dependency graph builds correctly
3. **No build warnings**: Address any TypeScript or bundling warnings

### Testing Requirements

1. **Unit tests**: Add/update tests for new functionality
2. **Integration tests**: Test cross-package interactions if applicable
3. **E2E tests**: `pnpm run test:e2e` for UI changes
4. **Manual testing**: Verify functionality in browser at localhost:5173

### Documentation Updates

1. **Code comments**: Document complex logic and public APIs
2. **Type definitions**: Ensure proper TypeScript types
3. **README updates**: Update relevant package README if needed
4. **API documentation**: Update for public interface changes

### Git Workflow

1. **Feature branch**: Never work directly on main
2. **Commit messages**: Use descriptive, conventional commit format
3. **Clean history**: Squash commits if needed before PR
4. **No uncommitted changes**: All work should be committed

### Package-Specific Checks

- **engine-core**: Run constraint solver tests
- **studio**: Test UI interactions and node editor
- **cli**: Test rendering and parameter override functionality
- **nodes-core**: Validate node registration and evaluation

### Performance Considerations

- **Bundle size**: Check for unexpected size increases
- **WASM loading**: Verify worker threading still works
- **Memory usage**: Test with large graphs if applicable

## Emergency Bypass

Only skip checks for critical production hotfixes - document reason in commit message.
