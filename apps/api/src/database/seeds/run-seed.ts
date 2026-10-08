import dataSource from '../data-source';
import { SEED_EMAIL_DOMAIN, SEED_PASSWORD, seedPosts } from './seed-data';
import { runSeed } from './seed';

dataSource
  .initialize()
  .then(async () => {
    await runSeed(dataSource);
    console.log(
      `Seeded ${seedPosts.length} posts. Log in with any @${SEED_EMAIL_DOMAIN} user (e.g. julio@${SEED_EMAIL_DOMAIN}) and password "${SEED_PASSWORD}".`,
    );
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => dataSource.destroy());
