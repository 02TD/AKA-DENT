import { copyFile, cp, mkdir, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const output = join(process.cwd(), 'dist', 'client');

// vinext writes base-path-prefixed assets into dist/client/AKA-DENT/_next.
// GitHub Pages already mounts the artifact at /AKA-DENT, so those files need
// to be available from the artifact root for /AKA-DENT/_next/* URLs to work.
await cp(join(output, 'AKA-DENT', '_next'), join(output, '_next'), {
  recursive: true,
  force: true,
});

async function makePrettyRoute(source, routeDirectory) {
  const target = join(output, routeDirectory);
  await mkdir(target, { recursive: true });
  await copyFile(join(output, source), join(target, 'index.html'));
}

await makePrettyRoute('aka-office.html', 'aka-office');
await makePrettyRoute('clinic-panel.html', 'clinic-panel');

const doctorsDirectory = join(output, 'doctors');
const doctorPages = (await readdir(doctorsDirectory)).filter((name) => name.endsWith('.html'));
for (const page of doctorPages) {
  await makePrettyRoute(join('doctors', page), join('doctors', page.slice(0, -5)));
}

await writeFile(join(output, '.nojekyll'), '');
