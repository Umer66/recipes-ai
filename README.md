# Meal Planning App

A modern, responsive meal planning application built with Next.js, React, and TypeScript.

## Performance Optimizations

This application has been optimized for production performance with the following key improvements:

### React Performance Optimizations

1. **Component Memoization**: All major components use `React.memo()` to prevent unnecessary re-renders
2. **useMemo Hooks**: Expensive calculations are memoized to avoid recalculation on every render
3. **useCallback Hooks**: Event handlers and functions are memoized to maintain referential equality
4. **Component Splitting**: Large components have been broken down into smaller, focused components

### Specific Optimizations in Cooking Mode

- **CookingHeader**: Memoized header component with progress tracking
- **CurrentStepCard**: Optimized step display with memoized navigation
- **StepNavigation**: Efficient step list rendering with virtual scrolling considerations
- **TimersSection**: Optimized timer management with minimal re-renders
- **KitchenTimer**: Split into sub-components (TimerDisplay, TimerControls) for better performance
- **RecipeInfo & ChefTips**: Memoized static content components

### Performance Benefits

- **Reduced Re-renders**: Components only re-render when their specific props change
- **Faster Navigation**: Step transitions are optimized with memoized callbacks
- **Efficient Timer Updates**: Timer components update independently without affecting other UI elements
- **Memory Optimization**: Proper cleanup of intervals and event listeners
- **Bundle Size**: Optimized imports and component structure

### Best Practices Implemented

- **Readability First**: Code is written for maintainability and readability
- **Testability**: Components are designed to be easily testable
- **Maintainability**: Clear separation of concerns and modular architecture
- **Performance**: Optimizations applied after profiling and identifying bottlenecks

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Features

- Recipe management and cooking mode
- Interactive timers with notifications
- Responsive design for all devices
- Performance-optimized components
