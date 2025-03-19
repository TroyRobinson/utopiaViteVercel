const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const STORYBOARD_PATH = path.resolve(__dirname, '../utopia/storyboard.js');
const COMPONENT_EXTENSIONS = ['.jsx', '.js', '.tsx', '.ts'];

// Files to ignore - can be exact names or patterns (as strings)
const IGNORED_FILES = [
  'index', // Ignore files named index.js, index.jsx, etc.
  'utils', // Ignore utility files
  'router', // Ignore router files
  'spec', // Ignore spec files
  'mock', // Ignore mock files
  'helpers', // Ignore helper files
  'constants', // Ignore constant files
  'types', // Ignore type definition files
];

// File patterns that should be included even if they match ignore patterns
const FORCE_INCLUDE = [
  // Add specific files to always include here if needed
  // Example: 'SpecialComponent', 'ImportantUtil'
];

// Scan for React components in a directory
function scanForComponents(dir) {
  const components = [];
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively scan subdirectories
      components.push(...scanForComponents(filePath));
    } else if (COMPONENT_EXTENSIONS.includes(path.extname(file))) {
      // Check if this is an ignored file
      const baseName = path.basename(file, path.extname(file));
      const fullPath = path.relative(SRC_DIR, filePath);
      
      // Skip if the file matches any ignore pattern and doesn't match any force include pattern
      if (
        (IGNORED_FILES.some(pattern => baseName.toLowerCase().includes(pattern.toLowerCase())) || 
         IGNORED_FILES.some(pattern => fullPath.toLowerCase().includes(pattern.toLowerCase()))) &&
        !FORCE_INCLUDE.some(pattern => baseName.toLowerCase().includes(pattern.toLowerCase()))
      ) {
        console.log(`Skipping ignored file: ${file}`);
        return;
      }
      
      // Read file content
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Simple regex to detect exported React components
      const exportRegex = /export\s+(var|const|let|function|class)\s+(\w+)(?:\s*=\s*(?:\(([^)]*)\)|function\s*\(([^)]*)\))?)?/g;
      let match;
      
      // Add more patterns for React component detection
      const isReactComponent = (content, componentName) => {
        // Check for JSX usage, React imports, or other React patterns
        const hasJSX = content.includes('<') && content.includes('/>') || content.includes('</');
        const hasReactImport = content.includes('import React') || content.includes('import * as React');
        const isExtendingReactComponent = content.includes(`extends React.Component`) || content.includes(`extends Component`);
        const usesReactHooks = content.includes('useState') || content.includes('useEffect') || content.includes('useContext');
        const returnsJSX = new RegExp(`(return|=>)\\s*\\(\\s*<`, 'g').test(content);
        
        // If the component has a capital first letter and meets any React criteria, consider it a React component
        return (
          componentName[0] === componentName[0].toUpperCase() && 
          (hasJSX || hasReactImport || isExtendingReactComponent || usesReactHooks || returnsJSX)
        );
      };

      while ((match = exportRegex.exec(content)) !== null) {
        const componentName = match[2];
        
        // Use the enhanced React component detection
        if (isReactComponent(content, componentName)) {
          // Check if component accepts style prop
          const params = match[3] || match[4] || '';
          
          // Check for style prop in different forms:
          // 1. Direct style param: ({ style }) or (style)
          // 2. Destructured style: ({ style, otherProps })
          // 3. Props object that might contain style: (props) or ({ ...props })
          const hasStyleProp = 
            params.includes('style') || 
            params.includes('props') || 
            params.includes('...') || 
            params.match(/{\s*[^}]*\s*}/); // Destructuring pattern
          
          components.push({
            name: componentName,
            path: path.relative(SRC_DIR, filePath).replace(/\\/g, '/'),
            fullPath: filePath,
            hasStyleProp
          });
        }
      }
    }
  });
  
  return components;
}

// Generate storyboard content
function generateStoryboard(components, existingScenes = null) {
  // Start with imports
  let imports = `import * as React from 'react'\nimport { Scene, Storyboard } from 'utopia-api'\n`;
  
  // Add component imports
  const importedComponents = new Set();
  components.forEach(component => {
    if (!importedComponents.has(component.name)) {
      // Create the import path with correct extension
      const importPath = component.path;
      const fileExt = path.extname(importPath);
      const importPathWithoutExt = importPath.replace(fileExt, '');
      
      // Use relative path from utopia directory to src directory
      imports += `import { ${component.name} } from '../src/${importPathWithoutExt}'\n`;
      importedComponents.add(component.name);
    }
  });
  
  // Start storyboard content
  let content = `\nexport var storyboard = (\n  <Storyboard>\n`;
  
  // Calculate placement for new scenes
  const usedPositions = new Set();
  const defaultSceneWidth = 700;
  const defaultSceneSpacing = 816; // Space between scenes (matched to example spacing)
  const defaultTop = 128;
  
  // Track components we've already added
  const addedComponents = new Set();
  
  // Track scene configurations that we're building
  const sceneConfigurations = {};
  
  // First, add scenes for components with existing configurations
  if (existingScenes) {
    components.forEach(component => {
      const sceneId = `${component.name.toLowerCase()}-scene`;
      if (existingScenes[sceneId]) {
        const sceneConfig = { ...existingScenes[sceneId] };
        sceneConfigurations[sceneId] = sceneConfig;
        addedComponents.add(component.name);
        usedPositions.add(sceneConfig.left);
      }
    });
  }
  
  // Now handle components without existing scenes
  // First, determine the furthest right position
  let furthestRightPosition = 0;
  if (usedPositions.size > 0) {
    furthestRightPosition = Math.max(...usedPositions);
  }
  
  // Add original positions for standard components if they don't exist yet
  const componentsToAdd = components.filter(component => !addedComponents.has(component.name));
  
  // First add Playground and App if they exist and don't have scenes yet
  componentsToAdd.forEach(component => {
    const sceneId = `${component.name.toLowerCase()}-scene`;
    if (component.name === 'Playground' && !addedComponents.has('Playground')) {
      sceneConfigurations[sceneId] = {
        width: 700,
        height: 759,
        left: 212,
        top: defaultTop,
        label: 'Playground',
        component
      };
      addedComponents.add('Playground');
      usedPositions.add(212);
      furthestRightPosition = Math.max(furthestRightPosition, 212);
    } else if (component.name === 'App' && !addedComponents.has('App')) {
      sceneConfigurations[sceneId] = {
        width: 744,
        height: 1133,
        left: 992,
        top: defaultTop,
        label: 'My App',
        component
      };
      addedComponents.add('App');
      usedPositions.add(992);
      furthestRightPosition = Math.max(furthestRightPosition, 992);
    }
  });
  
  // Calculate starting position for new scenes
  // First, find gaps between existing scenes where we could fit a new scene
  let availableGaps = [];
  if (usedPositions.size > 1) {
    // Convert positions to sorted array
    const positionsArray = Array.from(usedPositions).sort((a, b) => a - b);
    
    // Find gaps large enough to fit a scene with proper spacing
    for (let i = 0; i < positionsArray.length - 1; i++) {
      const startPos = positionsArray[i];
      const endPos = positionsArray[i+1];
      const gap = endPos - startPos;
      
      // If gap is large enough to fit a scene (minimum defaultSceneSpacing)
      if (gap >= defaultSceneSpacing) {
        // Calculate how many scenes could fit in this gap
        const scenesFit = Math.floor(gap / defaultSceneSpacing);
        
        // For each possible position in the gap
        for (let j = 0; j < scenesFit; j++) {
          const gapPosition = startPos + defaultSceneSpacing * (j + 1);
          // Ensure we're not too close to the end scene
          if (gapPosition + defaultSceneWidth + 20 <= endPos) {  // 20px buffer
            availableGaps.push({
              position: gapPosition,
              size: gap
            });
          }
        }
      }
    }
    
    console.log(`Found ${availableGaps.length} gaps between existing scenes`);
  }

  let nextPosition = furthestRightPosition + defaultSceneSpacing;

  // Now add remaining components to gaps or to the right of the furthest right scene
  componentsToAdd.forEach(component => {
    if (!addedComponents.has(component.name)) {
      const sceneId = `${component.name.toLowerCase()}-scene`;
      
      // If we have available gaps, use the first one
      if (availableGaps.length > 0) {
        const gap = availableGaps.shift(); // Take the first available gap
        
        sceneConfigurations[sceneId] = {
          width: defaultSceneWidth,
          height: 700,
          left: gap.position,
          top: defaultTop,
          label: component.name,
          component
        };
        
        addedComponents.add(component.name);
        console.log(`Added new scene for ${component.name} at position ${gap.position} (in a gap)`);
      } else {
        // No gaps available, place at the end
        sceneConfigurations[sceneId] = {
          width: defaultSceneWidth,
          height: 700,
          left: nextPosition,
          top: defaultTop,
          label: component.name,
          component
        };
        
        addedComponents.add(component.name);
        nextPosition += defaultSceneSpacing;
        console.log(`Added new scene for ${component.name} at position ${nextPosition - defaultSceneSpacing} (at the end)`);
      }
    }
  });
  
  // Now rearrange scenes to close any gaps
  // First, add the component reference to existing scenes
  if (existingScenes) {
    Object.keys(sceneConfigurations).forEach(sceneId => {
      const config = sceneConfigurations[sceneId];
      if (config && !config.component) {
        // Find the component for this scene
        const componentName = config.componentName || sceneId.replace(/-scene$/, '');
        const component = components.find(c => 
          c.name.toLowerCase() === componentName.toLowerCase() || 
          sceneId === `${c.name.toLowerCase()}-scene`
        );
        if (component) {
          config.component = component;
        }
      }
    });
  }
  
  // Reorganize scenes to close gaps
  const reorganizedScenes = reorganizeScenes(sceneConfigurations, defaultSceneSpacing);
  
  // Now add all scenes to the content in the reorganized positions
  Object.entries(reorganizedScenes).forEach(([sceneId, config]) => {
    if (config.component) {
      addComponentScene(config.component, sceneId, config);
      
      if (existingScenes && existingScenes[sceneId]) {
        if (config.left !== existingScenes[sceneId].left) {
          console.log(`Relocated scene ${sceneId} from position ${existingScenes[sceneId].left} to ${config.left}`);
        } else {
          console.log(`Using existing configuration for ${sceneId}`);
        }
      }
    }
  });
  
  // Helper function to add a component scene to the content
  function addComponentScene(component, sceneId, sceneConfig) {
    content += `    <Scene\n`;
    content += `      id='${sceneId}'\n`;
    content += `      commentId='${sceneId}'\n`;
    content += `      style={{\n`;
    content += `        width: ${sceneConfig.width},\n`;
    content += `        height: ${sceneConfig.height},\n`;
    content += `        position: 'absolute',\n`;
    content += `        left: ${sceneConfig.left},\n`;
    content += `        top: ${sceneConfig.top},\n`;
    content += `      }}\n`;
    content += `      data-label='${sceneConfig.label}'\n`;
    content += `    >\n`;
    
    // Add style prop directly if component accepts it
    if (component.hasStyleProp) {
      content += `      <${component.name} style={{}} />\n`;
    } else {
      content += `      <${component.name} />\n`;
    }
    
    content += `    </Scene>\n`;
  }
  
  // Close storyboard
  content += `  </Storyboard>\n)\n`;
  
  return imports + content;
}

// Function to reorganize scenes to close gaps between them
function reorganizeScenes(sceneConfigurations, defaultSpacing) {
  // Clone the configurations to avoid modifying the original
  const reorganized = JSON.parse(JSON.stringify(sceneConfigurations));
  
  // Special handling for Playground and App - they should keep their original positions
  const hasPlayground = Object.values(reorganized).some(config => 
    config.label === 'Playground' || (config.component && config.component.name === 'Playground')
  );
  
  const hasApp = Object.values(reorganized).some(config => 
    config.label === 'My App' || config.label === 'App' || 
    (config.component && config.component.name === 'App')
  );
  
  // Extract scene IDs and positions, so we can sort them by position
  const scenes = Object.entries(reorganized).map(([id, config]) => ({
    id,
    left: config.left,
    config,
    originalLeft: config.left // Save original position for comparison
  }));
  
  // Sort scenes by left position (ascending)
  scenes.sort((a, b) => a.left - b.left);
  
  // Keep track of position shifts
  let positionShifts = 0;
  
  // Start with the leftmost position based on whether we have Playground or App
  let currentPosition = 212; // Default start position
  if (hasPlayground) {
    // Find the Playground scene and set its position
    const playgroundScene = scenes.find(scene => 
      scene.config.label === 'Playground' || 
      (scene.config.component && scene.config.component.name === 'Playground')
    );
    
    if (playgroundScene) {
      playgroundScene.config.left = 212;
      currentPosition = 212 + defaultSpacing; // Next position
    }
  }
  
  // If we have App, handle it separately
  if (hasApp) {
    // Find the App scene
    const appScene = scenes.find(scene => 
      scene.config.label === 'My App' || scene.config.label === 'App' || 
      (scene.config.component && scene.config.component.name === 'App')
    );
    
    if (appScene) {
      // If Playground exists, App should be at 992, otherwise at 212
      if (hasPlayground) {
        appScene.config.left = 992;
        currentPosition = 992 + defaultSpacing; // Next position
      } else {
        appScene.config.left = 212;
        currentPosition = 212 + defaultSpacing; // Next position
      }
    }
  }
  
  // Now place all other scenes in sequence with proper spacing
  scenes.forEach((scene) => {
    // Skip Playground and App as we've already positioned them
    const isPlayground = scene.config.label === 'Playground' || 
                         (scene.config.component && scene.config.component.name === 'Playground');
    
    const isApp = scene.config.label === 'My App' || scene.config.label === 'App' || 
                  (scene.config.component && scene.config.component.name === 'App');
    
    if (!isPlayground && !isApp) {
      // If this scene would be positioned differently, track the shift
      if (scene.config.left !== currentPosition) {
        positionShifts++;
        console.log(`Repositioning scene ${scene.id} from ${scene.originalLeft} to ${currentPosition}`);
      }
      
      // Position this scene at the current position
      scene.config.left = currentPosition;
      
      // Move to the next position
      currentPosition += defaultSpacing;
    }
  });
  
  // Log the number of scenes that were repositioned
  if (positionShifts > 0) {
    console.log(`Repositioned ${positionShifts} scenes to close gaps`);
  } else {
    console.log('No scene repositioning needed - layout already optimal');
  }
  
  // Convert back to the original format
  const result = {};
  scenes.forEach(scene => {
    result[scene.id] = scene.config;
  });
  
  return result;
}

// Main function
function updateStoryboard() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let includeUtils = false;
  let includeIndex = false;
  let verbose = false;
  let preserveExisting = true; // Default to preserving existing scenes
  let prune = true; // Default to pruning removed components
  let forceRegenMissing = true; // Always regenerate missing scenes for existing components
  
  // Process command line arguments
  if (args.includes('--include-utils')) {
    includeUtils = true;
    console.log('Including utility files');
    // Remove 'utils' from ignored files if present
    const utilsIndex = IGNORED_FILES.indexOf('utils');
    if (utilsIndex !== -1) {
      IGNORED_FILES.splice(utilsIndex, 1);
    }
  }
  
  if (args.includes('--include-index')) {
    includeIndex = true;
    console.log('Including index files');
    // Remove 'index' from ignored files if present
    const indexIndex = IGNORED_FILES.indexOf('index');
    if (indexIndex !== -1) {
      IGNORED_FILES.splice(indexIndex, 1);
    }
  }
  
  if (args.includes('--verbose')) {
    verbose = true;
    console.log('Verbose mode enabled');
  }
  
  if (args.includes('--no-preserve')) {
    preserveExisting = false;
    console.log('Creating fresh storyboard without preserving existing configurations');
  }
  
  if (args.includes('--no-prune')) {
    prune = false;
    console.log('Disabling pruning of removed components');
  }
  
  if (args.includes('--no-force-regen')) {
    forceRegenMissing = false;
    console.log('Not regenerating missing scenes for existing components');
  }
  
  if (args.includes('--help')) {
    console.log(`
Usage: node scripts/updateStoryboard.js [options]

Options:
  --include-utils    Include utility files in the storyboard
  --include-index    Include index files in the storyboard
  --verbose          Show more detailed output
  --no-preserve      Don't preserve existing scene configurations (create fresh storyboard)
  --no-prune         Keep scenes for components that no longer exist
  --no-force-regen   Don't regenerate missing scenes for existing components
  --help             Show this help message
`);
    return;
  }
  
  try {
    console.log('Scanning for React components...');
    const components = scanForComponents(SRC_DIR);
    
    console.log(`Found ${components.length} components:`);
    components.forEach(c => {
      const message = `- ${c.name} (${c.path}) ${c.hasStyleProp ? 'accepts style' : 'no style prop'}`;
      console.log(message);
      
      if (verbose) {
        console.log(`  Full path: ${c.fullPath}`);
      }
    });
    
    // Check if we should try to preserve existing scene configurations
    let existingScenes = null;
    let allExistingScenes = {}; // Stores ALL scenes, even ones we might prune
    
    if (fs.existsSync(STORYBOARD_PATH)) {
      try {
        console.log('Reading existing storyboard...');
        const existingStoryboard = fs.readFileSync(STORYBOARD_PATH, 'utf-8');
        
        // Extract scene configurations using regex
        const sceneRegex = /<Scene[^>]*id='([^']+)'[^>]*commentId='([^']+)'[^>]*style={{([^}]*)}}[^>]*data-label='([^']+)'[^>]*>([\s\S]*?)<\/Scene>/g;
        existingScenes = {};
        allExistingScenes = {};
        
        let sceneMatch;
        while ((sceneMatch = sceneRegex.exec(existingStoryboard)) !== null) {
          const id = sceneMatch[1];
          const style = sceneMatch[3];
          const label = sceneMatch[4];
          const sceneContent = sceneMatch[5]; // Content between opening and closing Scene tags
          
          // Try to extract component name from scene
          // Look for something like <ComponentName ... /> or <ComponentName>...</ComponentName>
          const componentRegex = /<([A-Z][a-zA-Z0-9_]*)[ \t\n>]/;
          const componentMatch = sceneContent.match(componentRegex);
          let componentName = componentMatch ? componentMatch[1] : null;
          
          // Skip internal components
          if (componentName === 'Scene' || componentName === 'Storyboard' || componentName === 'SafeComponentWrapper') {
            // Try to extract from a wrapper component
            const wrapperMatch = sceneContent.match(/component=\{([A-Z][a-zA-Z0-9_]*)\}/);
            if (wrapperMatch) {
              componentName = wrapperMatch[1];
            } else {
              console.log(`Could not identify component for scene ${id}, will preserve it`);
            }
          }
          
          // Parse the style string to extract width, height, left, top
          const widthMatch = style.match(/width:\s*(\d+)/);
          const heightMatch = style.match(/height:\s*(\d+)/);
          const leftMatch = style.match(/left:\s*(\d+)/);
          const topMatch = style.match(/top:\s*(\d+)/);
          
          if (widthMatch && heightMatch && leftMatch && topMatch) {
            // Store scene info keyed by scene id
            const sceneInfo = {
              width: parseInt(widthMatch[1]),
              height: parseInt(heightMatch[1]),
              left: parseInt(leftMatch[1]),
              top: parseInt(topMatch[1]),
              label,
              componentName
            };
            
            allExistingScenes[id] = sceneInfo;
            
            if (preserveExisting) {
              existingScenes[id] = sceneInfo;
              console.log(`Found existing scene: ${id} (${label})${componentName ? ', component: ' + componentName : ''}`);
            }
          }
        }
      } catch (e) {
        console.log('Error parsing existing storyboard, will generate new one:', e.message);
        existingScenes = null;
        allExistingScenes = {};
      }
    }
    
    console.log('Generating storyboard...');
    
    // Create a set of component names for fast lookup
    const componentNames = new Set(components.map(c => c.name));
    
    // If pruning is enabled, filter out scenes for components that no longer exist
    if (prune && existingScenes) {
      const sceneIdsToRemove = [];
      
      // Identify scenes to remove
      for (const [sceneId, sceneInfo] of Object.entries(allExistingScenes)) {
        const { componentName } = sceneInfo;
        
        // Skip scenes we can't identify the component for - don't prune these
        if (!componentName) {
          console.log(`Preserving scene ${sceneId} (could not identify component)`);
          continue;
        }
        
        // If component no longer exists in our scanned components, mark for removal
        if (!componentNames.has(componentName)) {
          sceneIdsToRemove.push(sceneId);
          console.log(`Pruning scene ${sceneId} for removed component ${componentName}`);
          
          // Remove from existingScenes to prevent preservation
          if (existingScenes[sceneId]) {
            delete existingScenes[sceneId];
          }
        } else {
          console.log(`Keeping scene ${sceneId} for component ${componentName}`);
        }
      }
    }
    
    // Check for components that exist but don't have scenes in the storyboard
    if (forceRegenMissing) {
      for (const component of components) {
        const expectedSceneId = `${component.name.toLowerCase()}-scene`;
        
        // If this component should have a scene but doesn't
        const hasExistingScene = Object.keys(allExistingScenes).includes(expectedSceneId);
        
        if (!hasExistingScene) {
          console.log(`Component ${component.name} exists but scene ${expectedSceneId} is missing - will regenerate`);
          // Don't add to existingScenes here - let the generation logic place it properly
        }
      }
    }
    
    // Pass the existing scenes to the generation function
    const storyboardContent = generateStoryboard(components, existingScenes);
    
    console.log('Writing storyboard to file...');
    fs.writeFileSync(STORYBOARD_PATH, storyboardContent);
    
    console.log('Storyboard updated successfully!');
  } catch (error) {
    console.error('Error updating storyboard:', error);
  }
}

// Run the update
updateStoryboard(); 