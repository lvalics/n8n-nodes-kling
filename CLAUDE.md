# n8n-nodes-useapi Development Guide

## Build & Development Commands
- Build: `pnpm run build`
- Development watch mode: `pnpm run dev`
- Format code: `pnpm run format`
- Run n8n locally: `pnpm run runn8n`
- Clean dist directory: `pnpm run clean`
- Quick build & local install: `./build.sh`
- Build & publish: `./build.sh --build`

## Code Style & Guidelines
- **TypeScript**: Strict typing required, check tsconfig.json settings
- **Formatting**: Prettier with tabs (width=2), 100 char line length, trailing commas
- **Imports**: Sorted using @trivago/prettier-plugin-sort-imports
- **Naming**: 
  - PascalCase for classes, types, interfaces (e.g., `UseApi`, `INodeTypeDescription`)
  - camelCase for functions, properties, variables
  - Use descriptive names reflecting purpose
- **Error Handling**: Use n8n's NodeOperationError and NodeApiError for consistent handling
- **Credentials**: Use separate credential files for different API connections
- **Constants**: Store shared values in constants folder for reuse

## Structure
- Use description files for operation parameters
- Group related functionality by service (MiniMax, Midjourney, etc.)
- Ensure proper structure follows n8n community node standards