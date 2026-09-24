/**
 * Encabezado estandar para las pantallas de cada modulo: titulo + descripcion a la
 * izquierda, acciones (botones "Nuevo...", filtros, etc.) a la derecha. Se repite en
 * casi todas las pantallas de las fases 2 a 6, asi que vive en un solo lugar.
 *
 * Ejemplo:
 *   <PageHeader
 *     title="Catálogo de productos"
 *     description="Insumos y productos terminados registrados en el sistema."
 *     actions={isAdmin && <Button asChild><Link to="/productos/nuevo">Nuevo producto</Link></Button>}
 *   />
 */
export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
