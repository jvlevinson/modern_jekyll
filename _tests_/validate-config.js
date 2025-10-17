import yaml from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logBright(color, message) {
  console.log(`${colors.bright}${colors[color]}${message}${colors.reset}`);
}

// Load schema and config
const schemaPath = path.join(__dirname, '../_data/config-schema.json');
const configPath = path.join(__dirname, '../_config.yml');

try {
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

  // Initialize AJV with formats support
  const ajv = new Ajv({
    allErrors: true,
    verbose: true
  });
  addFormats(ajv);

  // Compile schema
  const validate = ajv.compile(schema);

  // Validate config
  const valid = validate(config);

  if (!valid) {
    logBright('red', '\n❌ Configuration validation failed:\n');

    validate.errors.forEach((error, index) => {
      logBright('yellow', `Error ${index + 1}:`);
      log('cyan', `  Path: ${error.instancePath || '/'}`);
      log('cyan', `  Property: ${error.params.missingProperty || error.schemaPath}`);
      log('red', `  Message: ${error.message}`);

      if (error.params && Object.keys(error.params).length > 0) {
        log('blue', `  Details:`);
        Object.entries(error.params).forEach(([key, value]) => {
          if (key !== 'missingProperty') {
            log('blue', `    ${key}: ${JSON.stringify(value)}`);
          }
        });
      }

      console.log('');
    });

    log('yellow', '\n💡 Tips:');
    log('cyan', '  • Check _config.yml for typos');
    log('cyan', '  • Valid theme.brand_primary: OKLCH object {l, c, h}');
    log('cyan', '  • Valid theme.brand_secondary: OKLCH object or null');
    log('cyan', '  • Valid theme.mode: light, dark, auto');
    log('cyan', '  • Valid theme.neutral: slate, gray, zinc, neutral, stone');
    log('cyan', '  • Font Awesome icons must start with "fa-"');
    console.log('');

    process.exit(1);
  }

  logBright('green', '\n✅ Configuration is valid!\n');

  // Validation summary
  logBright('cyan', 'Configuration Summary:');
  log('cyan', `  • Title: ${config.title}`);
  log('cyan', `  • Author: ${config.author}`);

  // Display OKLCH values
  const primary = config.theme.brand_primary;
  log('cyan', `  • Theme Primary: oklch(${primary.l}% ${primary.c} ${primary.h})`);

  if (config.theme.brand_secondary) {
    const secondary = config.theme.brand_secondary;
    log('cyan', `  • Theme Secondary: oklch(${secondary.l}% ${secondary.c} ${secondary.h})`);
  }

  log('cyan', `  • Mode: ${config.theme.mode}`);
  log('cyan', `  • Neutral: ${config.theme.neutral}`);
  log('cyan', `  • Services: ${config.services.list.length} items`);
  log('cyan', `  • Portfolio: ${config.portfolio_items.length} items`);

  if (config.twitter_username || config.github_username || config.linkedin_username) {
    log('cyan', `  • Social links: ${[
      config.twitter_username && 'Twitter',
      config.github_username && 'GitHub',
      config.linkedin_username && 'LinkedIn'
    ].filter(Boolean).join(', ')}`);
  }

  console.log('');
  logBright('green', '✨ Ready to build!\n');

} catch (error) {
  if (error.code === 'ENOENT') {
    logBright('red', `\n❌ File not found: ${error.path}\n`);
    log('yellow', '💡 Make sure you run this from the project root directory.\n');
  } else if (error.name === 'YAMLException') {
    logBright('red', '\n❌ YAML parsing error:\n');
    log('red', `  ${error.message}\n`);
    log('yellow', '💡 Check _config.yml for syntax errors (indentation, colons, quotes).\n');
  } else {
    logBright('red', `\n❌ Error: ${error.message}\n`);
    if (error.stack) {
      log('red', error.stack);
    }
  }
  process.exit(1);
}
