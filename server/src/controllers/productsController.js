const { query } = require('../config/db');

async function listProducts(req, res, next) {
  try {
    const { category, search, featured } = req.query;
    const conditions = [];
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }
    if (featured === 'true') {
      conditions.push('is_featured = true');
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT id, name, slug, category, price, unit, description, image_url, is_featured, in_stock
       FROM products
       ${where}
       ORDER BY is_featured DESC, name ASC`,
      params
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await query(
      `SELECT id, name, slug, category, price, unit, description, image_url, is_featured, in_stock
       FROM products WHERE id = $1 OR slug = $1 LIMIT 1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const { name, slug, category, price, unit, description, image_url, is_featured, in_stock } = req.body;
    const { rows } = await query(
      `INSERT INTO products (name, slug, category, price, unit, description, image_url, is_featured, in_stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7,COALESCE($8,false),COALESCE($9,true))
       RETURNING *`,
      [name, slug, category, price, unit || null, description || null, image_url || null, is_featured, in_stock]
    );
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const fields = ['name', 'slug', 'category', 'price', 'unit', 'description', 'image_url', 'is_featured', 'in_stock'];
    const sets = [];
    const params = [];
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        params.push(req.body[f]);
        sets.push(`${f} = $${params.length}`);
      }
    }
    if (!sets.length) return res.status(400).json({ error: 'No fields to update' });
    params.push(id);
    const { rows } = await query(
      `UPDATE products SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { rowCount } = await query('DELETE FROM products WHERE id = $1', [id]);
    if (!rowCount) return res.status(404).json({ error: 'Product not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function listCategories(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT category, COUNT(*)::int AS count FROM products GROUP BY category ORDER BY category`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listCategories,
};
