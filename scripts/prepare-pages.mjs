import { copyFile, mkdir, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const output = join(process.cwd(), 'dist', 'client');

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
