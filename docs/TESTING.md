# Testing Guide

## Running Tests

```bash
# Run all tests once
npm run test

# Watch mode for development
npm run test:watch
```

## Test Structure

```
src/__tests__/
├── setup.ts              # Test setup (jest-dom)
└── pdf-processor.test.ts # PDF processing unit tests
```

## Writing Tests

### Unit Tests (Vitest)

```typescript
import { describe, it, expect } from "vitest";
import { mergePdfs } from "@/services/pdf-processor";

describe("mergePdfs", () => {
  it("should merge two PDFs", async () => {
    const result = await mergePdfs([pdf1, pdf2]);
    expect(result.success).toBe(true);
  });
});
```

### Component Tests

```typescript
import { render, screen } from "@testing-library/react";
import { ToolCard } from "@/components/tools/tool-card";

it("renders tool name", () => {
  render(<ToolCard tool={mockTool} />);
  expect(screen.getByText("Merge PDF")).toBeInTheDocument();
});
```

## Test Categories

### PDF Processor Tests
- Merge multiple PDFs
- Split by page range
- Rotate pages
- Delete pages
- Add watermarks
- Password protection
- Image to PDF conversion

### Utility Tests
- File size formatting
- Slug generation
- Date formatting

### Integration Tests (Recommended additions)
- API route `/api/process` with mock files
- Authentication flow
- File upload and download cycle

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run tests
  run: npm run test

- name: Lint
  run: npm run lint

- name: Type check
  run: npx tsc --noEmit
```

## Coverage

To add coverage reporting:

```bash
npm install -D @vitest/coverage-v8
```

Update `vitest.config.ts`:

```typescript
test: {
  coverage: {
    provider: "v8",
    reporter: ["text", "html"],
  },
}
```

Run with coverage:

```bash
npx vitest run --coverage
```
