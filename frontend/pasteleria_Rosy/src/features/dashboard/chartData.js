// Helpers de agregación para los gráficos del Dashboard. Todo se calcula en
// el cliente a partir de datos que ya se piden en otras pantallas (GET
// /movements, GET /products), para no depender de endpoints Admin-only como
// /reports/rotation y así los gráficos operativos también se vean con el rol
// Operator.

function toDateKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function lastNDays(n) {
  const days = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date);
  }
  return days;
}

/**
 * Agrupa los movimientos de los últimos `days` días por tipo (Entrada/Salida/
 * Ajuste), listo para pasarle a <LineChart>.
 */
export function buildMovementsTrend(movements, days = 14) {
  const dayList = lastNDays(days);
  const buckets = new Map(dayList.map((date) => [toDateKey(date), { in: 0, out: 0, adjustment: 0 }]));

  for (const movement of movements) {
    const bucket = buckets.get(toDateKey(movement.movement_date));
    if (!bucket) continue; // fuera de la ventana visible
    if (movement.movement_type === "In") bucket.in += movement.quantity;
    else if (movement.movement_type === "Out") bucket.out += movement.quantity;
    else if (movement.movement_type === "Adjustment") bucket.adjustment += movement.quantity;
  }

  const xLabels = dayList.map((date) =>
    date.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit" })
  );
  const pick = (field) => dayList.map((date) => buckets.get(toDateKey(date))[field]);

  return {
    xLabels,
    entradas: pick("in"),
    salidas: pick("out"),
    ajustes: pick("adjustment"),
  };
}

/**
 * Top N productos terminados con más salidas (equivalente a
 * GET /reports/rotation, pero calculado del lado del cliente para que
 * también lo vea el rol Operator). `productsById` debe traer al menos
 * `type`, `code` y `description`.
 */
export function buildTopRotation(movements, productsById, limit = 5) {
  const totals = new Map();

  for (const movement of movements) {
    if (movement.movement_type !== "Out") continue;
    const productId = movement.product_id?._id;
    if (!productId) continue;
    const product = productsById.get(productId);
    if (!product || product.type !== "Finished Good") continue;
    totals.set(productId, (totals.get(productId) ?? 0) + movement.quantity);
  }

  return Array.from(totals.entries())
    .map(([productId, value]) => {
      const product = productsById.get(productId);
      return { key: productId, label: product?.code ?? productId, value, productId };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

/** Top N productos por valor de inventario (usa el reporte de valorización, Admin-only). */
export function buildTopValuation(valuationProducts, limit = 5) {
  return [...valuationProducts]
    .sort((a, b) => b.total_value - a.total_value)
    .slice(0, limit)
    .map((product) => ({
      key: product.product_id,
      label: product.code,
      value: product.total_value,
      productId: product.product_id,
    }));
}

/** Conteo de productos activos por tipo, para el widget de distribución. */
export function buildTypeSplit(products) {
  const active = products.filter((product) => product.is_active !== false);
  const rawMaterials = active.filter((product) => product.type === "Raw Material").length;
  const finishedGoods = active.filter((product) => product.type === "Finished Good").length;
  return { rawMaterials, finishedGoods, total: rawMaterials + finishedGoods };
}
