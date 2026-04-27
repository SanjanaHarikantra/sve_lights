import bcrypt from 'bcryptjs';
import app from './app.js';
import { pool } from './config/db.js';
import { config } from './config/env.js';
import { countUsers, createUser, findUserByEmail } from './models/userModel.js';

const ensureSchema = async () => {
 
  await pool.query(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INT AUTO_INCREMENT PRIMARY KEY,
      service VARCHAR(50) NOT NULL,
      rating TINYINT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [feedbackIndexes] = await pool.query(`
    SELECT INDEX_NAME
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'feedback'
  `);

  const existingFeedbackIndexes = new Set(
    feedbackIndexes.map((indexRow) => indexRow.INDEX_NAME)
  );

  if (!existingFeedbackIndexes.has('idx_feedback_created_id')) {
    await pool.query('CREATE INDEX idx_feedback_created_id ON feedback (created_at, id)');
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      description TEXT NOT NULL,
      image_url VARCHAR(1000) NOT NULL,
      stock INT NOT NULL DEFAULT 0,
      category VARCHAR(100) NOT NULL DEFAULT 'General',
      status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
      added_by ENUM('admin', 'user') NOT NULL DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  const [productColumns] = await pool.query(`
    SELECT COLUMN_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products'
  `);

  const existingProductColumns = new Set(productColumns.map((column) => column.COLUMN_NAME));

  if (!existingProductColumns.has('category')) {
    await pool.query(
      "ALTER TABLE products ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT 'General'"
    );
  }

  if (!existingProductColumns.has('status')) {
    await pool.query(
      "ALTER TABLE products ADD COLUMN status ENUM('active', 'inactive') NOT NULL DEFAULT 'active'"
    );
  }

  if (!existingProductColumns.has('added_by')) {
    await pool.query(
      "ALTER TABLE products ADD COLUMN added_by ENUM('admin', 'user') NOT NULL DEFAULT 'admin'"
    );
  }

  if (!existingProductColumns.has('updated_at')) {
    await pool.query(
      "ALTER TABLE products ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    );
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS collections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      image VARCHAR(1000) NOT NULL,
      category VARCHAR(120) NOT NULL DEFAULT 'Custom Collection',
      source_platform VARCHAR(120) NOT NULL DEFAULT '',
      source_url VARCHAR(1000) NOT NULL DEFAULT '',
      stock INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  const [collectionColumns] = await pool.query(`
    SELECT COLUMN_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'collections'
  `);

  const existingColumns = new Set(collectionColumns.map((column) => column.COLUMN_NAME));

  if (!existingColumns.has('source_platform')) {
    await pool.query(
      "ALTER TABLE collections ADD COLUMN source_platform VARCHAR(120) NOT NULL DEFAULT ''"
    );
  }

  if (!existingColumns.has('source_url')) {
    await pool.query(
      "ALTER TABLE collections ADD COLUMN source_url VARCHAR(1000) NOT NULL DEFAULT ''"
    );
  }

  if (!existingColumns.has('stock')) {
    await pool.query(
      "ALTER TABLE collections ADD COLUMN stock INT NOT NULL DEFAULT 0"
    );
  }

  const [collectionIndexes] = await pool.query(`
    SELECT INDEX_NAME
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'collections'
  `);

  const existingCollectionIndexes = new Set(
    collectionIndexes.map((indexRow) => indexRow.INDEX_NAME)
  );

  if (!existingCollectionIndexes.has('idx_collections_category')) {
    await pool.query('CREATE INDEX idx_collections_category ON collections (category)');
  }

  if (!existingCollectionIndexes.has('idx_collections_created_id')) {
    await pool.query('CREATE INDEX idx_collections_created_id ON collections (created_at, id)');
  }

  if (!existingCollectionIndexes.has('idx_collections_source_platform')) {
    await pool.query(
      'CREATE INDEX idx_collections_source_platform ON collections (source_platform)'
    );
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_enquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user') NOT NULL DEFAULT 'user'
    )
  `);

};

const seedAdminIfConfigured = async () => {
  if (!config.adminSeed.email || !config.adminSeed.password) {
    return;
  }

  const existingAdmin = await findUserByEmail(config.adminSeed.email.toLowerCase());

  if (existingAdmin) {
    return;
  }

  const passwordHash = await bcrypt.hash(config.adminSeed.password, 10);
  await createUser({
    name: config.adminSeed.name,
    email: config.adminSeed.email.toLowerCase(),
    password: passwordHash,
    role: 'admin',
  });
};

const logBootstrapNotes = async () => {
  const totalUsers = await countUsers();

  if (totalUsers === 0) {
    console.log(
      'No users found. The first account can be created at /api/auth/register. Send role="admin" only for the first registration if you want that account to be an admin.'
    );
  }
};

const startServer = async () => {
  try {
    await ensureSchema();
    await seedAdminIfConfigured();
    await logBootstrapNotes();

    app.listen(config.port, () => {
      console.log(`SVE Lights API running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    process.exit(1);
  }
};

startServer();
