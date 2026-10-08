import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePosts1791400000000 implements MigrationInterface {
  name = 'CreatePosts1791400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`posts\` (\`id\` varchar(36) NOT NULL, \`author_id\` varchar(36) NOT NULL, \`title\` varchar(120) NOT NULL, \`body\` text NOT NULL, \`code\` text NULL, \`thumbnail_path\` varchar(255) NULL, \`likes_count\` int NOT NULL DEFAULT 0, \`comments_count\` int NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_posts_created_at\` (\`created_at\`), INDEX \`IDX_posts_likes_count\` (\`likes_count\`), PRIMARY KEY (\`id\`), CONSTRAINT \`FK_posts_author\` FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD FULLTEXT INDEX \`FT_posts_search\` (\`title\`, \`body\`)`,
    );
    await queryRunner.query(
      `CREATE TABLE \`tags\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(40) NOT NULL, UNIQUE INDEX \`UQ_tags_name\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`post_tags\` (\`post_id\` varchar(36) NOT NULL, \`tag_id\` varchar(36) NOT NULL, INDEX \`IDX_post_tags_tag\` (\`tag_id\`), PRIMARY KEY (\`post_id\`, \`tag_id\`), CONSTRAINT \`FK_post_tags_post\` FOREIGN KEY (\`post_id\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE, CONSTRAINT \`FK_post_tags_tag\` FOREIGN KEY (\`tag_id\`) REFERENCES \`tags\`(\`id\`) ON DELETE CASCADE) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`post_likes\` (\`post_id\` varchar(36) NOT NULL, \`user_id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_post_likes_user\` (\`user_id\`), PRIMARY KEY (\`post_id\`, \`user_id\`), CONSTRAINT \`FK_post_likes_post\` FOREIGN KEY (\`post_id\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE, CONSTRAINT \`FK_post_likes_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`comments\` (\`id\` varchar(36) NOT NULL, \`post_id\` varchar(36) NOT NULL, \`author_id\` varchar(36) NOT NULL, \`parent_id\` varchar(36) NULL, \`body\` varchar(1000) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_comments_post\` (\`post_id\`), PRIMARY KEY (\`id\`), CONSTRAINT \`FK_comments_post\` FOREIGN KEY (\`post_id\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE, CONSTRAINT \`FK_comments_author\` FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE, CONSTRAINT \`FK_comments_parent\` FOREIGN KEY (\`parent_id\`) REFERENCES \`comments\`(\`id\`) ON DELETE CASCADE) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`comments\``);
    await queryRunner.query(`DROP TABLE \`post_likes\``);
    await queryRunner.query(`DROP TABLE \`post_tags\``);
    await queryRunner.query(`DROP TABLE \`tags\``);
    await queryRunner.query(`DROP TABLE \`posts\``);
  }
}
