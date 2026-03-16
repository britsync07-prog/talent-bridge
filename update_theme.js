const fs = require('fs');
const path = require('path');

const files = [
    'frontend/src/app/page.tsx',
    'frontend/src/components/Navbar.tsx',
    'frontend/src/app/engineers/page.tsx',
    'frontend/src/app/engineers/[id]/page.tsx',
    'frontend/src/app/dashboard/employer/page.tsx',
    'frontend/src/app/dashboard/engineer/page.tsx',
    'frontend/src/app/dashboard/admin/page.tsx',
    'frontend/src/app/login/page.tsx',
    'frontend/src/app/signup/page.tsx',
    'frontend/src/app/about/page.tsx',
    'frontend/src/app/solutions/page.tsx',
    'frontend/src/app/case-studies/page.tsx',
    'frontend/src/app/partners/page.tsx',
    'frontend/src/app/resources/page.tsx',
    'frontend/src/app/contact/page.tsx'
];

const replacements = [
    // Colors
    { from: /#059669/g, to: '#80A8B0' },
    { from: /#065f46/g, to: '#80A8B0' },
    { from: /text-emerald-600/g, to: 'text-[#80A8B0]' },
    { from: /bg-emerald-600/g, to: 'bg-[#80A8B0]' },
    { from: /text-emerald-500/g, to: 'text-[#718CA0]' },
    { from: /bg-emerald-500/g, to: 'bg-[#718CA0]' },
    { from: /selection:bg-emerald-500/g, to: 'selection:bg-[#718CA0]' }, // Specific case
    
    // bg-emerald-50 and bg-emerald-100 replacements
    // User said: bg-[#DDDDDD] or bg-[#D3D3D3]/20
    // I'll use bg-[#D3D3D3]/20 for 50/100 to keep it subtle
    { from: /bg-emerald-50\/50/g, to: 'bg-[#D3D3D3]/10' },
    { from: /bg-emerald-50\/30/g, to: 'bg-[#D3D3D3]/5' },
    { from: /bg-emerald-50\/20/g, to: 'bg-[#D3D3D3]/5' },
    { from: /bg-emerald-50/g, to: 'bg-[#D3D3D3]/20' },
    { from: /bg-emerald-100/g, to: 'bg-[#DDDDDD]' },

    // Borders
    { from: /border-emerald-100/g, to: 'border-[#D3D3D3]' },
    { from: /border-emerald-50/g, to: 'border-[#D3D3D3]' },
    { from: /border-emerald-200/g, to: 'border-[#B6B6B6]' }, // Mapping 200 to B6B6B6 for more contrast if needed
    { from: /divide-emerald-50/g, to: 'divide-[#D3D3D3]' },

    // Shadows
    // Replace shadow-[...rgba(5,150,105...)] -> shadow-[0_0_30px_rgba(128,168,176,0.15)]
    { from: /shadow-\[0_0_20px_rgba\(5,150,105,0\.2\)\]/g, to: 'shadow-[0_0_30px_rgba(128,168,176,0.15)]' },
    { from: /shadow-\[0_0_30px_rgba\(5,150,105,0\.2\)\]/g, to: 'shadow-[0_0_30px_rgba(128,168,176,0.15)]' },
    { from: /shadow-\[0_0_50px_rgba\(5,150,105,0\.2\)\]/g, to: 'shadow-[0_0_30px_rgba(128,168,176,0.15)]' },
    { from: /shadow-\[0_0_30px_rgba\(5,150,105,0\.05\)\]/g, to: 'shadow-[0_0_30px_rgba(128,168,176,0.1)]' },
    { from: /shadow-emerald-500\/20/g, to: 'shadow-[#80A8B0]/20' },
    { from: /#059669/g, to: '#80A8B0' }, // Repeat just in case some are left
];

const basePath = 'C:/Users/IC/Desktop/Curated marketplace/';

files.forEach(file => {
    const filePath = path.join(basePath, file);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Special Navbar rule
    if (file === 'frontend/src/components/Navbar.tsx') {
        content = content.replace(
            'bg-white/80 backdrop-blur-xl border-b border-emerald-100',
            'bg-white/90 backdrop-blur-xl border-b border-[#D3D3D3]'
        );
    }

    replacements.forEach(rep => {
        content = content.replace(rep.from, rep.to);
    });
    
    // Catch-all for any remaining emerald classes that might have been missed by specific regex
    content = content.replace(/emerald-50/g, '[#D3D3D3]/20');
    content = content.replace(/emerald-100/g, '[#D3D3D3]');
    content = content.replace(/emerald-200/g, '[#B6B6B6]');
    content = content.replace(/emerald-500/g, '[#718CA0]');
    content = content.replace(/emerald-600/g, '[#80A8B0]');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${file}`);
});
