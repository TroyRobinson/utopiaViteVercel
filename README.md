# Utopia Project with Auto-Storyboard

This project includes a special feature that automatically updates the Utopia storyboard with scenes for all your React components.

## Quick Start

To start development with automatic storyboard updating:

```bash
npm run dev
```

This will start the Vite development server and automatically update the storyboard whenever you make changes to files in the src directory.

## Automatic Storyboard Updating

The system watches for changes in your source files and automatically updates the storyboard to:

1. Add scenes for new components
2. Remove scenes for deleted components 
3. Preserve customizations you've made to existing scenes
4. Position new scenes logically based on existing layout

For more information on the automatic storyboard updating, see [the storyboard documentation](./docs/STORYBOARD.md).

## How It Works

Every time you make changes to files in the `src` directory, the system:

1. Scans your `src` directory for all React components
2. Creates a scene in the storyboard for each component 
3. Preserves any customizations you've made to existing scenes
4. Removes scenes for components that no longer exist in your code
5. Adds new scenes to the right of the furthest right existing scene
6. Automatically reorganizes scenes to close gaps and maintain consistent spacing
7. Updates the `utopia/storyboard.js` file automatically

## Original Scene Positions

When creating scenes for the first time, the system places:
- Playground at position 212 (left)
- App at position 992 (right)
- All other components are positioned to the right of the furthest right scene with 816px spacing

When reorganizing scenes (after removing components), the system:
- Keeps Playground and App in their fixed positions
- Shifts other components to close gaps while maintaining consistent spacing
- Preserves each scene's width, height, and other custom properties

## Usage

Simply develop your React components as usual in the `src` directory. The auto-storyboard system will:

- Find components that are exported from `.js`, `.jsx`, `.ts`, or `.tsx` files
- Automatically filter out utility files, index files, and other non-component files
- Create a new scene for each component
- Position the scenes in a logical layout
- Preserve your custom scene sizes, positions, and labels when updating
- Remove scenes for components that have been deleted from your code
- Add new scenes to the right of existing ones

## Available Scripts

```bash
# Start development with automatic storyboard updating
npm run dev

# Start development with verbose output
npm run dev:verbose

# Start Vite server without automatic storyboard updating
npm run start

# Manually update the storyboard
npm run update-storyboard

# Build for production (automatically updates storyboard first)
npm run build

# Preview the production build
npm run preview
```

For more detailed information on the storyboard updating scripts, see [the storyboard documentation](./docs/STORYBOARD.md).

## Multiple Scenes for One Component

The system is designed to handle multiple scenes for the same component. For example, if you have:
- A main desktop view of your App component
- A mobile view of the same App component with different dimensions

Both scenes will be preserved as long as the App component still exists in your code.

## Manual Update

If you want to update the storyboard without starting the dev server, you have several options:

```bash
# Standard update (preserves existing scene configurations, prunes removed components)
npm run update-storyboard

# Include ALL components, preserving scene configurations
npm run update-storyboard:all

# Show verbose output with full file paths
npm run update-storyboard:verbose

# Generate completely fresh storyboard (doesn't preserve existing configurations)
npm run update-storyboard:fresh

# Preserve ALL scenes, even for deleted components
npm run update-storyboard:no-prune

# Start the dev server including ALL components
npm run start:all-components

# Start with a completely fresh storyboard
npm run start:fresh

# Start without removing scenes for deleted components
npm run start:no-prune
```

## Command Line Options

When running the script directly, you can use these options:

```bash
node scripts/updateStoryboard.js [options]

Options:
  --include-utils    Include utility files in the storyboard
  --include-index    Include index files in the storyboard
  --verbose          Show more detailed output
  --no-preserve      Don't preserve existing scene configurations (create fresh storyboard)
  --no-prune         Keep scenes for components that no longer exist
  --help             Show this help message
```

## Customization

The storyboard generator script is located at `scripts/updateStoryboard.js`. You can customize it to:

### File Filtering

The script has built-in patterns to ignore certain types of files. You can modify these settings at the top of the script:

```javascript
// Files to ignore - can be exact names or patterns (as strings)
const IGNORED_FILES = [
  'index', // Ignore files named index.js, index.jsx, etc.
  'utils', // Ignore utility files
  // ...add more patterns here
];

// File patterns that should be included even if they match ignore patterns
const FORCE_INCLUDE = [
  // Add specific files to always include here if needed
  // Example: 'SpecialComponent', 'ImportantUtil'
];
```

### Scene Preservation and Pruning

By default, the script will:

1. Preserve your custom scene configurations, including:
   - Scene positions (left/top)
   - Scene dimensions (width/height)
   - Custom labels
   - Other scene properties

2. Prune scenes for components that no longer exist in your code.

3. Add new scenes to the right of the furthest right existing scene.

You can disable these behaviors with the appropriate flags:
- Use `--no-preserve` to create a fresh storyboard
- Use `--no-prune` to keep scenes for deleted components

### Other Customizations

You can also modify the script to:

- Change how components are detected
- Modify the scene layout
- Adjust scene sizes or spacing
- Filter which components should be included

## Development

- Start the development server: `npm start`
- Start with all components: `npm run start:all-components`
- Start with a fresh storyboard: `npm run start:fresh`
- Start without pruning deleted scenes: `npm run start:no-prune`
- Build for production: `npm run build`
- Preview the production build: `npm run preview` 