import * as esbuild from 'esbuild';
import { cpSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';

const serve = process.argv.includes('--serve');
const out = 'dist';
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync('public', out, { recursive: true });

const html = readFileSync('index.html', 'utf8');
writeFileSync(`${out}/index.html`, html);
writeFileSync(`${out}/404.html`, html);
writeFileSync(`${out}/.nojekyll`, '');

const opts = {
  entryPoints: { app: 'src/main.tsx' },
  bundle: true,
  outdir: `${out}/assets`,
  format: 'esm',
  minify: !serve,
  sourcemap: serve,
  target: ['es2020'],
  jsx: 'automatic',
  loader: { '.css': 'css' },
  define: { 'process.env.NODE_ENV': JSON.stringify(serve ? 'development' : 'production') },
  logLevel: 'info',
};

if (serve) {
  const ctx = await esbuild.context(opts);
  await ctx.watch();
  const { port } = await ctx.serve({ servedir: out, port: 5173 });
  console.log(`\n  Velora running at http://localhost:${port}\n`);
} else {
  await esbuild.build(opts);
}
