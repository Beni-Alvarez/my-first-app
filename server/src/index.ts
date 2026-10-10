import { createApp } from './app.js';
import { prisma } from './lib/prisma.js';
import { createSongsService } from './services/songs.service.js';

const port = Number(process.env.PORT ?? 4000);

const app = createApp({ songsService: createSongsService(prisma) });

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
