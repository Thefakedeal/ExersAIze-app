This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v58.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

# AI Engineering Standards

## 1. Core Philosophy

- Prefer simplicity, readability and maintainability over cleverness.
- Write minimal code without sacrificing clarity.
- Avoid overengineering, unnecessary abstractions, boilerplate and design patterns.
- Prefer straightforward solutions over complicated architectures.
- Make the smallest changes necessary to satisfy the requirement.
- Never refactor unrelated code.
- Do not implement features that were not requested.

## 2. Inspect Before Implementing

Before writing code:

1. Inspect the relevant existing files.
2. Check `package.json` and installed dependencies.
3. Search for existing components, hooks, utilities and services.
4. Understand how similar functionality is already implemented.
5. Check installed package versions and API compatibility.

Never assume functionality needs to be implemented from scratch.

## 3. Dependency-First Development

- Prefer existing installed packages over custom implementations.
- Prefer established, popular and actively maintained libraries when they improve readability and maintainability.
- Do not reinvent common functionality when suitable packages exist.
- Check compatibility with the current Expo SDK, React Native version and TypeScript version.
- Prefer libraries with good documentation, TypeScript support and ecosystem adoption.
- Do not introduce dependencies unnecessarily.
- Do not install a package simply because it is popular.
- If implementing functionality manually instead of using an established package, have a clear technical justification.

Common areas where existing packages should be considered:

- Date and time manipulation.
- Charts and data visualization.
- Animations and gestures.
- Form handling and validation.
- Navigation.
- Storage and persistence.
- Data formatting.
- UI components.

## 4. Component Architecture

### Component Decomposition

- Never allow screens or pages to become excessively large components.
- Divide pages into small, logically meaningful conceptual components.
- Each component should have one clear responsibility.
- Page components should primarily compose and arrange their sections.
- Break complex components into smaller child components.
- Prefer composition over deeply nested conditional rendering.

### Component Organization

- Keep page-level components in their own files.
- Major conceptual components should be independently identifiable.
- Keep small private child components in the same file as their parent.
- Extract components into separate files when they become reusable, complex or independently maintainable.
- Keep closely related components together.
- Do not create a separate file for every small component.
- Avoid excessive component fragmentation.

### Reusability

- Reuse existing shared components when appropriate.
- Extract components when there is genuine reuse or a clear architectural benefit.
- Avoid premature abstractions.
- Do not create generic components with excessive configuration options when a simple specialized component is sufficient.
- Keep component props focused and understandable.

### Maintainability

- A developer should be able to understand a component without navigating through unnecessarily large files.
- Keep UI presentation separate from complex business logic when it improves readability.
- Avoid duplicate logic.
- Follow existing project conventions.

## 5. UI/UX Design Philosophy

### Visual Direction

- Design clean, modern, minimalist and polished mobile interfaces.
- Prioritize readability, whitespace and visual hierarchy.
- Avoid generic AI-generated dashboard aesthetics.
- Avoid unnecessary cards, borders, dividers, shadows and decorative containers.
- Avoid excessive gradients, colors, icons and visual effects.
- Do not put every piece of information inside a separate card.
- Prefer understated, premium-looking interfaces.

### Layout

- Establish consistent spacing and alignment.
- Use typography, font weight and size to establish hierarchy.
- Group related information logically.
- Use screen space efficiently.
- Avoid excessive nesting of containers.
- Keep layouts compact without making them feel crowded.

### Color and Typography

- Use the existing project theme and design tokens.
- Use restrained colors and apply accent colors selectively.
- Avoid hardcoded colors when theme tokens exist.
- Maintain sufficient contrast.
- Support light and dark themes.
- Maintain consistent typography and spacing.

### Native Mobile Experience

- Follow iOS Human Interface Guidelines and Android Material Design conventions.
- Respect platform-specific navigation and interactions.
- Handle safe areas and different screen sizes.
- Support accessibility and dynamic text sizing.
- Prefer native-feeling controls where appropriate.

### Interaction and States

- Implement loading, empty, error and success states.
- Provide clear feedback for user interactions.
- Avoid unnecessary animations.
- Use animations when they improve interaction or communicate state changes.
- Every visible interactive element must have a meaningful function.

### Design Discipline

Before implementing UI:

1. Inspect existing screens and theme components.
2. Identify reusable components.
3. Establish the visual hierarchy.
4. Choose the simplest layout that communicates the information.
5. Implement using existing conventions.
6. Check the result on an actual device when possible.

Do not redesign unrelated screens or introduce another design system unnecessarily.

## 6. Context and Token Efficiency

- Read only files relevant to the current task.
- Never scan the entire repository unless genuinely necessary.
- Use targeted searches before reading complete files.
- Read relevant portions of large files instead of loading everything.
- Avoid repeatedly inspecting files that have not changed.
- Load specialized documentation only when relevant.
- Do not dump unnecessarily large command outputs into context.
- Avoid repeating information already available in project instructions.
- Keep explanations, plans and implementation summaries concise.
- Do not narrate every operation.
- Preserve important technical decisions when summarizing or compacting context.

## 7. Implementation Workflow

For substantial tasks, follow:

### Step 1: Explore

- Identify relevant files.
- Inspect existing implementations.
- Check available dependencies.
- Understand relevant data flow and architecture.

### Step 2: Plan

- Determine the simplest suitable implementation.
- Identify components and files that actually need modification.
- Identify potential compatibility issues.
- Avoid unnecessary architectural changes.

### Step 3: Implement

- Make focused changes.
- Reuse existing functionality.
- Follow component decomposition rules.
- Follow the existing design system.
- Avoid unrelated modifications.

### Step 4: Review

- Check for unnecessary code and abstractions.
- Check for duplicated functionality.
- Check component responsibilities.
- Check consistency with existing architecture.
- Check visual hierarchy and UI consistency.

### Step 5: Verify

- Run relevant TypeScript checks.
- Run relevant linting and tests.
- Fix issues introduced by the changes.
- Do not claim checks passed unless they were actually executed.

For small, straightforward tasks, avoid unnecessary planning overhead and implement directly.

## 8. TypeScript and Code Quality

- Follow existing TypeScript conventions.
- Prefer accurate types over `any`.
- Reuse existing types and interfaces.
- Avoid unnecessary type definitions.
- Avoid redundant state and effects.
- Avoid unnecessary intermediate variables.
- Use descriptive names.
- Keep functions focused.
- Handle errors appropriately without excessive defensive programming.
- Do not add comments that simply repeat what the code does.
- Do not suppress TypeScript errors without justification.

## 9. Change Management

- Preserve existing functionality.
- Modify the smallest possible number of files.
- Do not replace working implementations without a technical reason.
- Do not change package versions unnecessarily.
- Do not modify configuration files unless required.
- Do not introduce new architectural patterns without justification.
- Do not silently remove existing functionality.

## 10. Communication

- Be concise and technically precise.
- Explain the approach before substantial implementations.
- Do not repeat the user's requirements unnecessarily.
- Explain important technical trade-offs.
- Report modified files.
- Report relevant verification results.
- Clearly disclose unresolved issues.
- Avoid lengthy explanations for straightforward changes.

## 11. Definition of Good Code

A good implementation should:

- Solve the actual requirement.
- Be as simple as reasonably possible.
- Reuse suitable existing dependencies.
- Fit the existing architecture.
- Have clear component responsibilities.
- Avoid unnecessary files and abstractions.
- Be readable and maintainable.
- Preserve existing functionality.
- Be verified appropriately.

**Guiding principle: Build less, reuse more, organize better. Optimize for conceptual clarity and maintainability, not lines of code, file count or abstraction count.**
