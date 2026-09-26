const fs = require('fs');
const path = require('path');

const rootDirs = ['web-app/src', 'server/src', 'web-app/index.html', 'README.md'];

function replaceInFile(filePath) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content.replace(/Smart Health Portal/gi, 'DRQR').replace(/Smart Health/gi, 'DRQR');
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Updated:', filePath);
        }
    }
}

function traverseAndReplace(dir) {
    if (!fs.existsSync(dir)) return;
    
    if (fs.statSync(dir).isFile()) {
        replaceInFile(dir);
        return;
    }

    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseAndReplace(fullPath);
        } else {
            if (/\.(tsx|ts|html|md|js)$/.test(file)) {
                replaceInFile(fullPath);
            }
        }
    }
}

rootDirs.forEach(traverseAndReplace);
console.log('Replacement complete.');
