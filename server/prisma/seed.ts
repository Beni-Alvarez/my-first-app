import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Placeholder text only — never seed real, copyrighted lyrics.
const songs = [
  {
    title: 'Sample Song One',
    artist: 'Example Band',
    album: 'Demo Album',
    year: 2020,
    lyrics: 'Line one of a sample verse\nLine two of a sample verse\n\nThis is the sample chorus',
  },
  {
    title: 'Sample Song Two',
    artist: 'Example Band',
    lyrics: 'Another placeholder verse\nWith a second line\n\nAnd a placeholder chorus',
  },
  {
    title: 'Test Ballad',
    artist: 'Placeholder Singer',
    year: 2018,
    lyrics: 'A short placeholder text\nUsed to test the app',
  },
];

async function main(): Promise<void> {
  await prisma.song.deleteMany();
  await prisma.song.createMany({ data: songs });
  console.log(`Seeded ${songs.length} songs.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
