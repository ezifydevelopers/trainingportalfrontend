const fs = require('fs');
const path = require('path');

// List of pages that need withAuth implementation
const pagesToUpdate = [
  'AdminHelpRequests.tsx',
  'TrackTraineeDetail.tsx', 
  'TrainingProgress.tsx',
  'TrackTrainee.tsx',
  'TimeTrackingDashboard.tsx',
  'PendingTrainees.tsx',
  'Reports.tsx',
  'MobileTest.tsx',
  'Messages.tsx',
  'EmailMarketing.tsx',
  'DataManagement.tsx',
  'ContactDetails.tsx',
  'AdminFeedback.tsx'
];

// Role mappings for different pages
const roleMappings = {
  'AdminHelpRequests.tsx': ['ADMIN'],
  'TrackTraineeDetail.tsx': ['ADMIN', 'MANAGER'],
  'TrainingProgress.tsx': ['TRAINEE'],
  'TrackTrainee.tsx': ['ADMIN', 'MANAGER'],
  'TimeTrackingDashboard.tsx': ['ADMIN', 'MANAGER'],
  'PendingTrainees.tsx': ['ADMIN'],
  'Reports.tsx': ['ADMIN', 'MANAGER'],
  'MobileTest.tsx': ['ADMIN'],
  'Messages.tsx': ['ADMIN', 'MANAGER'],
  'EmailMarketing.tsx': ['ADMIN'],
  'DataManagement.tsx': ['ADMIN'],
  'ContactDetails.tsx': ['ADMIN', 'MANAGER'],
  'AdminFeedback.tsx': ['ADMIN']
};

function updatePageWithAuth(filePath, roles) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already has withAuth
    if (content.includes('withAuth')) {
      console.log(`✅ ${path.basename(filePath)} already has withAuth`);
      return;
    }
    
    // Find the export default function line
    const exportMatch = content.match(/export default function (\w+)\(\)/);
    if (!exportMatch) {
      console.log(`❌ Could not find export default function in ${filePath}`);
      return;
    }
    
    const functionName = exportMatch[1];
    
    // Add imports
    const importWithAuth = `import withAuth from "@/components/withAuth";\nimport withRole from "@/components/withRole";\n`;
    
    // Add interface
    const interfaceCode = `\ninterface ${functionName}Props {\n  user?: any;\n  isAuthenticated?: boolean;\n}\n`;
    
    // Update function signature
    const newFunctionSignature = `function ${functionName}({ user, isAuthenticated }: ${functionName}Props) {`;
    content = content.replace(`export default function ${functionName}() {`, newFunctionSignature);
    
    // Add imports after existing imports
    const lastImportIndex = content.lastIndexOf('import ');
    const nextLineAfterLastImport = content.indexOf('\n', lastImportIndex) + 1;
    content = content.slice(0, nextLineAfterLastImport) + importWithAuth + content.slice(nextLineAfterLastImport);
    
    // Add interface before function
    const functionIndex = content.indexOf(`function ${functionName}(`);
    content = content.slice(0, functionIndex) + interfaceCode + content.slice(functionIndex);
    
    // Add export with HOC
    const exportWithHOC = `\n// Export with authentication and role protection\n${roles ? `export default withRole([${roles.map(r => `'${r}'`).join(', ')}], withAuth(${functionName}));` : `export default withAuth(${functionName});`}\n`;
    content = content.replace(/}\s*$/, '}' + exportWithHOC);
    
    // Write back to file
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${path.basename(filePath)} with ${roles ? `roles: ${roles.join(', ')}` : 'authentication only'}`);
    
  } catch (error) {
    console.log(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Update all pages
console.log('🚀 Starting withAuth implementation across all pages...\n');

pagesToUpdate.forEach(pageName => {
  const filePath = path.join(__dirname, 'src', 'pages', pageName);
  const roles = roleMappings[pageName];
  
  if (fs.existsSync(filePath)) {
    updatePageWithAuth(filePath, roles);
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log('\n🎉 withAuth implementation complete!');
