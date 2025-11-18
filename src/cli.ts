#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { jsonToToon, formatStats, ConversionResult, toonToJson } from './index';

interface CliOptions {
  input?: string;
  output?: string;
  stats?: boolean;
  indent?: number;
  sortKeys?: boolean;
  help?: boolean;
  version?: boolean;
  json?: boolean;
}

function showHelp(): void {
  console.log(`
json2toon - Convert JSON to TOON format

USAGE:
  json2toon [OPTIONS]

OPTIONS:
  -i, --input <file>     Input JSON file (default: stdin)
  -o, --output <file>    Output TOON file (default: stdout)
  -s, --stats            Show conversion statistics
  --indent <number>      Indentation spaces (default: 2)
  --sort-keys           Sort object keys alphabetically
  -h, --help            Show this help message
  -v, --version         Show version number
  -j, --json           Convert TOON to JSON (reverse conversion)

EXAMPLES:
  # Convert from file
  json2toon -i data.json -o output.toon

  # Convert with statistics
  json2toon -i data.json -s

  # Pipe from stdin
  cat data.json | json2toon

  # Custom indentation and sorted keys
  json2toon -i data.json --indent 4 --sort-keys

  # Show stats and save output
  json2toon -i data.json -o output.toon -s

  # Convert TOON to JSON
  json2toon -i data.toon -j -o output.json
`);
}

function showVersion(): void {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
  );
  console.log(`json2toon v${packageJson.version}`);
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '-h':
      case '--help':
        options.help = true;
        break;
      
      case '-v':
      case '--version':
        options.version = true;
        break;
      
      case '-i':
      case '--input':
        options.input = args[++i];
        break;
      
      case '-o':
      case '--output':
        options.output = args[++i];
        break;
      
      case '-s':
      case '--stats':
        options.stats = true;
        break;
      
      case '--indent':
        options.indent = parseInt(args[++i], 10);
        break;
      
      case '--sort-keys':
        options.sortKeys = true;
        break;
      
      case '-j':
      case '--json':
        options.json = true;
        break;
      
      default:
        console.error(`Unknown option: ${arg}`);
        process.exit(1);
    }
  }
  
  return options;
}

async function readInput(inputFile?: string): Promise<string> {
  if (inputFile) {
    return fs.readFileSync(inputFile, 'utf8');
  }
  
  // Read from stdin
  return new Promise((resolve, reject) => {
    let data = '';
    
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

function writeOutput(content: string, outputFile?: string): void {
  if (outputFile) {
    fs.writeFileSync(outputFile, content, 'utf8');
    console.error(`✓ Output written to ${outputFile}`);
  } else {
    process.stdout.write(content);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  
  if (options.help) {
    showHelp();
    return;
  }
  
  if (options.version) {
    showVersion();
    return;
  }
  
  try {
    // Read input
    const inputStr = await readInput(options.input);

    let outputStr: string;
    if (options.json) {
      // TOON to JSON conversion
      let jsonData: any;
      try {
        jsonData = toonToJson(inputStr);
      } catch (error) {
        console.error('Error: Invalid TOON input');
        console.error((error as Error).message);
        process.exit(1);
      }
      outputStr = JSON.stringify(jsonData, null, options.indent || 2);
    } else {
      // JSON to TOON conversion
      let jsonData: any;
      try {
        jsonData = JSON.parse(inputStr);
      } catch (error) {
        console.error('Error: Invalid JSON input');
        console.error((error as Error).message);
        process.exit(1);
      }
      const result = jsonToToon(jsonData, {
        indent: options.indent,
        sortKeys: options.sortKeys,
        includeStats: options.stats || false
      });
      if (typeof result === 'string') {
        outputStr = result + '\n';
      } else {
        const convResult = result as ConversionResult;
        outputStr = convResult.toon + '\n';
        if (options.stats) {
          console.error('\n' + formatStats(convResult.stats!));
        }
      }
    }
    // Handle output
    writeOutput(outputStr, options.output);
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

// Run CLI
main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});