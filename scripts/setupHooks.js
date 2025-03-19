#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const huskyDir = path.resolve(__dirname, '../.husky');
const targetHooks = ['pre-commit', 'post-checkout', 'post-merge'];

try {
  // Check if the husky directory exists
  if (!fs.existsSync(huskyDir)) {
    console.log('Husky directory not found. Creating...');
    try {
      execSync('npx husky install');
      console.log('Husky installed successfully');
    } catch (error) {
      console.error('Failed to install husky:', error.message);
      process.exit(1);
    }
  }

  // Make this script executable
  try {
    fs.chmodSync(__filename, '755'); // rwxr-xr-x
    console.log('Made setupHooks.js executable');
  } catch (error) {
    console.warn(`Warning: Failed to make setupHooks.js executable: ${error.message}`);
  }

  // Ensure all known hooks exist and are executable
  let hookCount = 0;
  targetHooks.forEach(hookName => {
    const hookPath = path.join(huskyDir, hookName);
    
    // Check if the hook exists
    if (!fs.existsSync(hookPath)) {
      console.log(`Hook ${hookName} doesn't exist. Creating a basic one...`);
      try {
        const baseHookContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Ensure hooks stay executable
node scripts/setupHooks.js
`;
        fs.writeFileSync(hookPath, baseHookContent, { mode: 0o755 });
        console.log(`Created ${hookName} hook with executable permissions`);
        hookCount++;
      } catch (error) {
        console.error(`Error creating ${hookName} hook:`, error.message);
      }
    } else {
      // Make the existing hook executable
      try {
        fs.chmodSync(hookPath, '755'); // rwxr-xr-x
        console.log(`Made ${hookName} executable`);
        hookCount++;
      } catch (error) {
        console.error(`Failed to make ${hookName} executable:`, error.message);
      }
    }
  });

  // Get all other hook files that might not be in our target list
  try {
    const allHookFiles = fs.readdirSync(huskyDir).filter(file => 
      !file.startsWith('.') && !file.startsWith('_')
    );
    
    // Make any additional hooks executable
    allHookFiles.filter(hook => !targetHooks.includes(hook)).forEach(hookFile => {
      const hookPath = path.join(huskyDir, hookFile);
      
      try {
        fs.chmodSync(hookPath, '755'); // rwxr-xr-x
        console.log(`Made ${hookFile} executable`);
        hookCount++;
      } catch (error) {
        console.error(`Failed to make ${hookFile} executable:`, error.message);
      }
    });
  } catch (error) {
    console.error('Error reading hook directory:', error.message);
  }

  console.log(`Hook setup complete! Made ${hookCount} hooks executable.`);
} catch (error) {
  console.error('Error setting up hooks:', error.message);
  process.exit(1);
} 