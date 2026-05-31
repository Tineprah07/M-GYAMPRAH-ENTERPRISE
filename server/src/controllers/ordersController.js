const { pool, query } = require('../config/db');

async function createOrder(req, res, next) {
  const client = await pool.connect();
  try {
    const { customer_name, customer_email, customer_phone, customer_company, notes, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must include at least one item' });
    }

    await client.query('BEGIN');

    const productIds = items.map((i) => i.product_id);
    const { rows: products } = await client.query(
      `SELECT id, name, price FROM products WHERE id = ANY($1::int[])`,
      [productIds]
    );
    const priceMap = new Map(products.map((p) => [p.id, p]));

    let total = 0;
    const lineItems = items.map((i) => {
      const product = priceMap.get(i.product_id);
      if (!product) {
        const err = new Error(`Unknown product_id ${i.product_id}`);
        err.status = 400;
        throw err;
      }
      const qty = Math.max(1, Number(i.quantity) || 1);
      const lineTotal = Number(product.price) * qty;
      total += lineTotal;
      return { product, qty, lineTotal };
    });

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (customer_name, customer_email, customer_phone, customer_company, notes, total)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, created_at, total`,
      [customer_name, customer_email, customer_phone || null, customer_company || null, notes || null, total]
    );
    const order = orderRows[0];

    for (const li of lineItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [order.id, li.product.id, li.product.name, li.product.price, li.qty, li.lineTotal]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      data: { order_id: order.id, total: order.total, created_at: order.created_at },
      message: 'Quote request received. Our sales team will reach out to confirm pricing and delivery.',
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
}

async function listOrders(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT o.id, o.customer_name, o.customer_email, o.customer_phone, o.customer_company,
              o.notes, o.total, o.status, o.created_at,
              COALESCE(json_agg(json_build_object(
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'unit_price', oi.unit_price,
                'quantity', oi.quantity,
                'line_total', oi.line_total
              )) FILTER (WHERE oi.id IS NOT NULL), '[]'::json) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT 200`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, listOrders };
