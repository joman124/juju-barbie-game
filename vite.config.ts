import { defineConfig, type Plugin } from 'vite';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Writes dist/sw.js after the build with the full list of built files, so the
 * whole game is cached on first visit and then works with no connection.
 */
function offlineServiceWorker(): Plugin {
  return {
    name: 'offline-service-worker',
    apply: 'build',
    closeBundle() {
      const dist = join(process.cwd(), 'dist');
      const files: string[] = [];
      const walk = (dir: string) => {
        for (const name of readdirSync(dir)) {
          const full = join(dir, name);
          if (statSync(full).isDirectory()) walk(full);
          else if (name !== 'sw.js') files.push(relative(dist, full).split('\\').join('/'));
        }
      };
      walk(dist);
      const hash = createHash('sha1');
      for (const f of files.sort()) hash.update(f).update(readFileSync(join(dist, f)));
      const version = hash.digest('hex').slice(0, 10);
      const template = readFileSync(join(process.cwd(), 'src', 'sw.template.js'), 'utf8');
      writeFileSync(
        join(dist, 'sw.js'),
        template
          .replace('__VERSION__', version)
          .replace('__FILES__', JSON.stringify(['./', ...files])),
      );
    },
  };
}

export default defineConfig({
  base: './',
  build: { target: 'es2020', assetsInlineLimit: 0 },
  plugins: [offlineServiceWorker()],
});
