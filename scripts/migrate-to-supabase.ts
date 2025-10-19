#!/usr/bin/env ts-node
import globby from 'globby';
import * as fs from 'fs/promises';
import * as path from 'path';

async function migrateToSupabase() {
  // Find all TypeScript files in the ai-agents directory
  const files = await globby(['../ai-agents/**/*.ts']);

  for (const file of files) {
    let content = await fs.readFile(file, 'utf8');
    
    // Replace Firebase imports with Supabase
    content = content.replace(
      /import\s*{\s*db[^}]*}\s*from\s*['"]@\/utils\/firebase['"];?/g,
      'import { supabase } from \'@/utils/supabase\';'
    );

    // Replace Firestore collection operations with Supabase
    content = content.replace(
      /const\s+\w+Ref\s*=\s*collection\(db,\s*['"]([^'"]+)['"]\)/g,
      'const { data: $1Data, error: $1Error } = await supabase.from(\'$1\')'
    );

    // Replace addDoc with Supabase insert
    content = content.replace(
      /await\s+addDoc\(\w+Ref,\s*({[^}]+})\)/g,
      'await supabase.from(\'$1\').insert($1)'
    );

    // Write updated content back to file
    await fs.writeFile(file, content, 'utf8');
    console.log(`Migrated ${path.basename(file)}`);
  }
}

migrateToSupabase().catch(console.error);
