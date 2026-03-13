const fs = require('fs');
const path = require('path');

const filesToConvert = [
    { in: 'MoM_Portal_Gist_Minutes_Editor.html', out: 'MoMPortalGistMinutesEditor.jsx', name: 'MoMPortalGistMinutesEditor' },
    { in: 'Scrutiny_Portal_Application_Review.html', out: 'ScrutinyPortalApplicationReview.jsx', name: 'ScrutinyPortalApplicationReview' },
    { in: 'PP_Portal_Dashboard.html', out: 'PPPortalDashboard.jsx', name: 'PPPortalDashboard' },
    { in: 'PP_Portal_New_Application_Form.html', out: 'PPPortalNewApplicationForm.jsx', name: 'PPPortalNewApplicationForm' },
    { in: 'Admin_Portal_Dashboard.html', out: 'AdminPortalDashboard.jsx', name: 'AdminPortalDashboard' },
    { in: 'Entry_Portal_Role_Selection.html', out: 'EntryPortalRoleSelection.jsx', name: 'EntryPortalRoleSelection' }
];

const componentsDir = path.join('frontend', 'src', 'pages');

if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
}

for (const file of filesToConvert) {
    const htmlPath = path.join(process.cwd(), file.in);
    if (!fs.existsSync(htmlPath)) continue;
    
    const html = fs.readFileSync(htmlPath, 'utf8');
    
    // Extract everything between <body> and </body>
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (!bodyMatch) continue;
    
    let content = bodyMatch[1];
    
    // Quick replacements for JSX compatibility
    content = content.replace(/class=/g, 'className=')
                     .replace(/for=/g, 'htmlFor=')
                     .replace(/<!--[\s\S]*?-->/g, '') // remove comments
                     .replace(/<img([^>]+)>/g, (match) => {
                         if (!match.endsWith('/>')) {
                             return match.replace(/>$/, ' />');
                         }
                         return match;
                     })
                     .replace(/<input([^>]+)>/g, (match) => {
                         if (!match.endsWith('/>')) {
                             return match.replace(/>$/, ' />');
                         }
                         return match;
                     })
                     .replace(/<br([^>]*?)>/gi, '<br />')
                     .replace(/<hr([^>]*?)>/gi, '<hr />')
                     .replace(/stroke-width/gi, 'strokeWidth')
                     .replace(/stroke-linecap/gi, 'strokeLinecap')
                     .replace(/stroke-linejoin/gi, 'strokeLinejoin')
                     .replace(/fill-rule/gi, 'fillRule')
                     .replace(/clip-rule/gi, 'clipRule')
                     .replace(/viewbox/gi, 'viewBox')
                     .replace(/tabindex/gi, 'tabIndex')
                     .replace(/readonly/gi, 'readOnly')
                     .replace(/disabled([^=])/g, 'disabled$1')
                     .replace(/checked([^=])/g, 'defaultChecked$1')
                     .replace(/contenteditable/gi, 'contentEditable')
                     .replace(/spellcheck/gi, 'spellCheck')
                     // Remove inline <style> inside body if any
                     .replace(/<style[\s\S]*?<\/style>/gi, '')
                     // Remove scripts inside body if any
                     .replace(/<script[\s\S]*?<\/script>/gi, '');

    const componentTpl = `import React from 'react';

const ${file.name} = () => {
  return (
    <>
      ${content}
    </>
  );
};

export default ${file.name};
`;

    fs.writeFileSync(path.join(componentsDir, file.out), componentTpl, 'utf8');
    console.log(`Generated ${file.out}`);
}
