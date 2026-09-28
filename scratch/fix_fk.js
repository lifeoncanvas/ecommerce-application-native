const mysql = require('mysql2/promise');

async function fix() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'root',
      database: 'ecommerce'
    });

    console.log('Connected to MySQL ecommerce DB.');

    // 1. Ensure vendors table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT NOT NULL,
        business_name VARCHAR(150) NOT NULL,
        business_email VARCHAR(150),
        business_phone VARCHAR(20),
        business_address VARCHAR(255),
        status VARCHAR(50) DEFAULT 'APPROVED',
        verified TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 2. Set orphan vendor_id references in products to NULL
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    const [result] = await connection.query(
      'UPDATE products SET vendor_id = NULL WHERE vendor_id IS NOT NULL AND vendor_id NOT IN (SELECT id FROM vendors);'
    );
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('Successfully cleaned up orphan vendor_id references in products table:', result.affectedRows, 'rows updated.');
    await connection.end();
  } catch (err) {
    console.error('Error fixing DB:', err.message);
  }
}

fix();
