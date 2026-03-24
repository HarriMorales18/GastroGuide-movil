const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const APP_ROOT = path.join(ROOT, 'src', 'app');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (!entry.name.endsWith('.ts')) {
      continue;
    }

    if (entry.name.endsWith('.spec.ts')) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function classifyFile(filePath) {
  const relative = toPosix(path.relative(ROOT, filePath));

  if (relative.startsWith('src/app/core/')) {
    return { layer: 'core' };
  }

  if (relative.startsWith('src/app/shared/')) {
    return { layer: 'shared' };
  }

  if (relative.startsWith('src/app/features/')) {
    const parts = relative.split('/');
    return { layer: 'feature', feature: parts[3] || null };
  }

  return { layer: 'other' };
}

function resolveImportFile(sourceFile, importPath) {
  if (importPath.startsWith('src/app/')) {
    return path.join(ROOT, importPath);
  }

  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    return path.resolve(path.dirname(sourceFile), importPath);
  }

  return null;
}

function existingTsTarget(basePath) {
  const candidates = [
    `${basePath}.ts`,
    path.join(basePath, 'index.ts')
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function collectImports(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const regex = /from\s+['\"]([^'\"]+)['\"]/g;
  const imports = [];

  let match = regex.exec(source);
  while (match) {
    imports.push(match[1]);
    match = regex.exec(source);
  }

  return imports;
}

function formatLoc(filePath) {
  return toPosix(path.relative(ROOT, filePath));
}

function main() {
  const files = walk(APP_ROOT);
  const violations = [];

  for (const file of files) {
    const sourceType = classifyFile(file);
    const imports = collectImports(file);

    for (const importPath of imports) {
      const rawTarget = resolveImportFile(file, importPath);
      if (!rawTarget) {
        continue;
      }

      const targetTs = existingTsTarget(rawTarget);
      if (!targetTs) {
        continue;
      }

      const targetType = classifyFile(targetTs);

      if (sourceType.layer === 'core' && (targetType.layer === 'shared' || targetType.layer === 'feature')) {
        violations.push(`${formatLoc(file)} -> ${importPath} (core cannot depend on shared/features)`);
        continue;
      }

      if (sourceType.layer === 'shared' && (targetType.layer === 'core' || targetType.layer === 'feature')) {
        violations.push(`${formatLoc(file)} -> ${importPath} (shared cannot depend on core/features)`);
        continue;
      }

      if (
        sourceType.layer === 'feature'
        && targetType.layer === 'feature'
        && sourceType.feature
        && targetType.feature
        && sourceType.feature !== targetType.feature
      ) {
        violations.push(`${formatLoc(file)} -> ${importPath} (feature '${sourceType.feature}' cannot depend on feature '${targetType.feature}')`);
      }
    }
  }

  if (violations.length > 0) {
    console.error('Architecture violations found:\n');
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  console.log('Architecture check passed: dependency direction is valid.');
}

main();
