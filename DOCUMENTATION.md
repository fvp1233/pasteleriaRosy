# Rosy Pasteles - Documentacion del Sistema de Inventarios

## 1. Proposito del sistema

Sistema de control de inventarios para una empresa de reposteria. Registra y monitorea estrictamente la entrada y salida de productos utilizando el metodo de valoracion PEPS (Primeras Entradas, Primeras Salidas). El catalogo se divide en dos tipos de producto:

- Materia Prima: insumos que se compran y entran directamente a inventario (harina, azucar, etc.).
- Producto Terminado: productos que se venden al cliente final y que tienen una receta (lista de materiales) que descuenta materia prima al momento de la venta.

## 2. Stack tecnico

- Node.js con Express 5
- MongoDB con Mongoose (ES Modules, `import`/`export`)
- Autenticacion basada en JWT almacenado en cookie httpOnly
- Envio de correos con el SDK de Resend (para verificacion de cuenta)
- bcryptjs para el hash de contrasenas
- CORS configurado para un frontend en `http://localhost:5173` y `http://localhost:5174`

## 3. Estructura de carpetas

```
backend/
  app.js                  Configuracion de Express, middlewares globales y montaje de rutas
  index.js                Punto de entrada, levanta el servidor
  database.js              Conexion a MongoDB
  config.js                Variables de entorno centralizadas
  .env                      Variables de entorno (no versionado)
  src/
    models/
      User.js
      products.js
      Batch.js
      Movement.js
    controllers/
      registerUserController.js
      userController.js
      productController.js
      batchController.js
      movementController.js
      alertController.js
      reportController.js
    routes/
      registerUserRoutes.js
      userRoutes.js
      productRoutes.js
      batchRoutes.js
      movementRoutes.js
      alertRoutes.js
      reportRoutes.js
    middlewares/
      authMiddleware.js
```

Convencion de codigo: cada controlador exporta un objeto constante (por ejemplo `const userController = {}`) con una funcion por accion. Cada funcion sigue el patron `try/catch`, responde con codigos de estado HTTP explicitos y usa comentarios numerados (`//#1`, `//#2`, etc.) para marcar los pasos logicos internos.

## 4. Variables de entorno (`backend/.env`)

- `DB_URI`: cadena de conexion a MongoDB.
- `JWT_Secret_key`: clave secreta para firmar los JWT.
- `EMAIL_API_KEY`: API key de Resend para el envio de correos de verificacion.

## 5. Modelos de datos

### 5.1 User (`src/models/User.js`)

Campos: `name`, `last_name`, `email` (unico), `password` (hash con bcryptjs mediante un pre-hook del schema), `role` (`Admin` u `Operator`, por defecto `Operator`), `is_verified`, `login_attemps`, `time_out`, `is_active`.

El schema usa `strict: false`, lo que permite guardar campos adicionales sin declararlos en el schema. Esto se aprovecha en el flujo de registro para guardar `verification_code` y `verification_code_expires` de forma dinamica, sin modificar el modelo.

### 5.2 Product (`src/models/products.js`)

Campos: `code` (unico), `type` (`Raw Material` o `Finished Good`), `description`, `unit_of_measure`, `minimum_stock`, `maximum_stock`, `total_stock`, `is_prepared`, `recipe` (arreglo de `{ raw_material_id, required_quantity }`, solo aplica a `Finished Good`).

`total_stock` es un contador que se mantiene sincronizado por los controladores de lotes y movimientos; nunca se edita directamente desde el CRUD de productos. `is_active` se agrega de forma dinamica (gracias a `strict: false`) cuando un producto se desactiva.

### 5.3 Batch (`src/models/Batch.js`)

Representa un lote de entrada de un producto (compra de materia prima o produccion de un producto terminado). Campos: `product_id`, `entry_date`, `initial_quantity`, `available_quantity`, `unit_cost`, `status` (`Active` o `Depleted`).

Cada lote conserva su propio `unit_cost`. Este es el mecanismo que hace posible el metodo PEPS: al momento de una salida, siempre se consume primero el lote con `entry_date` mas antigua, respetando el costo historico real de cada unidad.

### 5.4 Movement (`src/models/Movement.js`)

Es el libro mayor (ledger) de todo lo que entra y sale de inventario. Campos: `product_id`, `batch_id`, `user_id` (quien genero el movimiento), `movement_type` (`In`, `Out` o `Adjustment`), `quantity`, `reason`, `movement_date`.

Todo movimiento queda siempre asociado a un lote especifico (`batch_id` es obligatorio), lo que permite reconstruir el historial completo de cualquier producto y auditar quien hizo cada cambio.

## 6. Autenticacion y autorizacion

### 6.1 Flujo de registro y verificacion

1. `POST /api/users/register` crea un usuario con `is_verified: false`, genera un codigo de 6 digitos con el modulo `crypto` de Node, lo guarda junto a su fecha de expiracion (15 minutos) y lo envia por correo usando Resend.
2. `POST /api/users/verify-email` valida el codigo y la expiracion, y marca `is_verified: true`.

### 6.2 Flujo de login

`POST /api/users/login`:

- Verifica que el usuario exista, este activo (`is_active`) y verificado (`is_verified`).
- Verifica si la cuenta esta bloqueada temporalmente (`time_out` en el futuro).
- Compara la contrasena con bcryptjs. Si falla, incrementa `login_attemps`; al llegar a 5 intentos fallidos, bloquea la cuenta por 15 minutos (`time_out`).
- Si la contrasena es correcta, reinicia los contadores de intentos, firma un JWT con `{ id, role }` y lo entrega en una cookie httpOnly llamada `authToken` (no se expone al JavaScript del cliente).

### 6.3 Middleware de autorizacion (`src/middlewares/authMiddleware.js`)

- `validateAuthToken`: extrae el JWT de la cookie `authToken`, lo verifica y adjunta el payload decodificado (`{ id, role }`) a `req.user`. Si falta o es invalido, responde 401.
- `validateRole(...roles)`: fabrica de middleware que valida que `req.user.role` este dentro de los roles permitidos para esa ruta. Responde 403 si no cumple.

Todas las rutas protegidas requieren `validateAuthToken`; algunas ademas requieren `validateRole("Admin")` para operaciones administrativas o financieras.

## 7. Logica de negocio central: PEPS y consumo de lotes

El nucleo del sistema es la funcion interna `consumeFromBatches` (`src/controllers/movementController.js`). Dado un producto y una cantidad a descontar:

1. Busca todos los lotes `Active` de ese producto, ordenados por `entry_date` ascendente (el mas antiguo primero).
2. Recorre los lotes descontando la cantidad necesaria de cada uno hasta cubrir el total solicitado. Si un lote llega a `available_quantity = 0`, cambia su estado a `Depleted`.
3. Por cada lote afectado, crea un registro en `Movement` con el tipo indicado (`Out` o `Adjustment`) y la cantidad exacta tomada de ese lote.
4. Si la suma de todos los lotes activos no alcanza para cubrir la cantidad solicitada, lanza un error y no se completa la operacion.

Esta funcion se reutiliza tanto para salidas por venta como para ajustes por merma, cambiando unicamente el `movementType`.

### 7.1 Descuento automatico de receta

Cuando se registra una salida de un producto de tipo `Finished Good`, el sistema:

1. Recorre la `recipe` del producto y, por cada ingrediente, calcula `required_quantity * cantidad_vendida` y lo descuenta de los lotes de esa materia prima usando `consumeFromBatches`.
2. Ademas descuenta la cantidad vendida de los lotes propios del producto terminado (el producto terminado debe haber entrado previamente a inventario como lote, igual que una materia prima, normalmente al registrar el resultado de una produccion).
3. Resta la cantidad vendida de `total_stock` del producto.

Esto implica que un producto terminado no puede venderse si no tiene lotes propios registrados, aunque su `total_stock` muestre existencia (evita vender algo que nunca se registro formalmente como producido).

### 7.2 Transacciones

Tanto el registro de entradas (`batchController.create`) como el de salidas y ajustes (`movementController.registerExit`, `movementController.registerAdjustment`) ejecutan sus escrituras dentro de una transaccion de MongoDB (`mongoose.startSession`). Si cualquier paso falla, se revierte toda la operacion para que lotes, movimientos y `total_stock` nunca queden desincronizados entre si.

## 8. Referencia de la API

Todas las rutas estan montadas sobre `/api`. Salvo que se indique lo contrario, requieren la cookie `authToken` (sesion iniciada).

### 8.1 Usuarios (`/api/users`)

| Metodo | Ruta | Acceso | Descripcion |
|---|---|---|---|
| POST | /register | Publico | Crea un usuario no verificado y envia codigo de verificacion por correo |
| POST | /verify-email | Publico | Valida el codigo de verificacion y activa la cuenta |
| POST | /login | Publico | Autentica y entrega la cookie de sesion |
| POST | /logout | Autenticado | Limpia la cookie de sesion |

### 8.2 Productos (`/api/products`)

| Metodo | Ruta | Acceso | Descripcion |
|---|---|---|---|
| GET | / | Autenticado | Lista productos, filtros `type` e `includeInactive` |
| GET | /:id | Autenticado | Detalle de un producto con su receta poblada |
| POST | / | Admin | Crea un producto (valida receta si es Producto Terminado) |
| PUT | /:id | Admin | Actualiza datos generales y receta |
| PATCH | /:id/deactivate | Admin | Desactivacion logica (soft delete) |

### 8.3 Lotes (`/api/batches`)

| Metodo | Ruta | Acceso | Descripcion |
|---|---|---|---|
| POST | / | Autenticado | Registra una entrada (lote) y suma `total_stock` |
| GET | / | Autenticado | Lista lotes, filtros `product_id` y `status` |
| GET | /product/:productId | Autenticado | Lotes activos de un producto en orden PEPS |
| GET | /:id | Autenticado | Detalle de un lote |

### 8.4 Movimientos (`/api/movements`)

| Metodo | Ruta | Acceso | Descripcion |
|---|---|---|---|
| POST | /exit | Autenticado | Registra una salida (venta), con descuento automatico de receta si aplica |
| POST | /adjustment | Autenticado | Registra una merma o ajuste (requiere motivo) |
| GET | / | Autenticado | Historial de movimientos, filtros `product_id`, `batch_id`, `movement_type` |

### 8.5 Alertas de stock (`/api/alerts`)

| Metodo | Ruta | Acceso | Descripcion |
|---|---|---|---|
| GET | /low-stock | Autenticado | Productos con `total_stock <= minimum_stock` |
| GET | /over-stock | Autenticado | Productos con `total_stock >= maximum_stock` |

### 8.6 Reportes (`/api/reports`)

Todos requieren rol Admin.

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | /valuation | Valorizacion PEPS del inventario activo (cantidad disponible por costo de lote) |
| GET | /kardex | Historial de movimientos de un producto con saldo corriente, filtrable por fecha |
| GET | /monthly-closing | Reconstruye la existencia y valor del inventario al ultimo dia de un mes dado |
| GET | /rotation | Productos terminados ordenados por volumen de salidas |
| GET | /shrinkage | Ajustes (mermas) valorizados, con el costo real de cada lote afectado |

## 9. Consideraciones y decisiones de diseno relevantes

- El campo `strict: false` en los modelos permite agregar campos dinamicos (como los de verificacion de correo o `is_active` en productos) sin tener que modificar el schema formalmente. Es una decision deliberada para mantener flexibilidad sin reescribir modelos.
- El reporte de Kardex y el de Cierre Mensual no dependen del estado actual de los lotes (`available_quantity`), sino que reconstruyen la situacion historica a partir del registro completo de movimientos. Esto los hace confiables para auditorias, incluso si el estado actual del inventario ya cambio.
- Los movimientos de tipo `Adjustment` siempre representan una perdida (restan del saldo), a diferencia de `In` (suma) y `Out` (resta por venta).
- Actualmente no existe un endpoint para revertir o anular un movimiento ya registrado; cualquier correccion debe hacerse mediante un nuevo movimiento (por ejemplo, un ajuste).
- La gestion de usuarios no incluye actualmente edicion de perfil, cambio de contrasena ni recuperacion de contrasena; solo registro, verificacion, login y logout.
