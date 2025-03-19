# Automatic Storyboard Updating

This project includes a feature that automatically updates the Utopia storyboard whenever you make changes to your React components.

## How It Works

The system uses file watching to monitor changes in the `src` directory and automatically updates the storyboard when files are added, modified, or deleted.

## Running With Auto-Update

To start the development server with automatic storyboard updating:

```bash
npm run dev
```

This will:
1. Start the Vite development server
2. Watch the `src` directory for changes
3. Automatically update the storyboard whenever a change is detected

For more detailed output during development:

```bash
npm run dev:verbose
```

## Manual Update

If you prefer to update the storyboard manually:

```bash
npm run update-storyboard
```

Or for more detailed output:

```bash
npm run update-storyboard:verbose
```

## How Scenes Are Positioned

When creating scenes for components:

1. **Existing Scenes**: Any customizations you've made to existing scenes (size, position, labels) are preserved.

2. **New Components**: When adding a new component:
   - If it's `Playground`, it's placed at position 212 (left)
   - If it's `App`, it's placed at position 992 (middle)
   - Other components are placed to the right of the furthest right existing scene

3. **Spacing**: Components are spaced 816 pixels apart for a clean layout

4. **Auto-Reorganization**: When scenes are added or removed, the system automatically:
   - Maintains the fixed positions of `Playground` and `App` components
   - Rearranges other components to close any gaps
   - Maintains consistent spacing between scenes
   - Preserves each scene's width, height, and customized properties

## Production Build

For production builds, the storyboard is automatically updated before building:

```bash
npm run build
```

## Advanced Usage

The storyboard updater has several options:

- `--verbose`: Show detailed output
- `--no-preserve`: Create a fresh storyboard without preserving existing configurations
- `--no-prune`: Keep scenes for components that no longer exist

For watching specific files or patterns, you can modify the `watch-storyboard` script in `package.json`. 