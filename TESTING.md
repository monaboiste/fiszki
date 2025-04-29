# Testing Environment

This project uses a comprehensive testing setup with Vitest for unit/integration tests and Playwright for E2E tests.

## Unit and Integration Testing with Vitest

Vitest is configured to work with React components, providing fast and reliable tests using JSDOM.

### Key Features

- JSDOM for simulating browser environment
- React Testing Library for component testing
- MSW for API mocking
- Coverage reporting with istanbul/v8

### Running Unit Tests

```bash
# Run tests once
npm test

# Watch mode for development
npm run test:watch

# With UI for better visualization
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Writing Tests

Test files should be placed alongside the components they test or in the `tests` directory with a `.test.ts` or `.test.tsx` extension.

Example test structure:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MyComponent from "./MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected text")).toBeInTheDocument();
  });
});
```

## End-to-End Testing with Playwright

Playwright is configured to run tests in Chromium browser only, following our project guidelines.

### Key Features

- Page Object Model pattern for maintainable tests
- Screenshot comparison capabilities
- Trace viewer for debugging
- Isolated browser contexts for test independence

### Running E2E Tests

```bash
# Run all E2E tests
npm run e2e

# With UI for easier debugging
npm run e2e:ui

# Debug mode with step-by-step execution
npm run e2e:debug
```

### Writing E2E Tests

E2E tests should be placed in the `e2e` directory with a `.spec.ts` extension. Use the Page Object Model pattern to improve maintainability.

Example structure:

```ts
import { test, expect } from "@playwright/test";
import { HomePage } from "./page-objects/home-page";

test("navigates to home page", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigate();
  await expect(page).toHaveTitle(/10xFiszki/);
});
```

## Test Coverage Requirements

We aim for at least 70% coverage across lines, statements, branches, and functions. Run `npm run test:coverage` to check current test coverage.
