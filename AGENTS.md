# PROMSSAC - Documentación del Proyecto

## Stack Tecnológico

### Frontend
- **Framework:** React 18 + TypeScript 5.8
- **Build:** Vite 5 + SWC
- **Routing:** React Router v6
- **Estado:** TanStack React Query + Context API (AuthContext)
- **Estilos:** Tailwind CSS 3.4
- **UI:** Radix UI primitives + shadcn/ui + lucide-react
- **Mapas:** MapLibre GL + Leaflet
- **WS:** STOMP.js + SockJS
- **Gráficos:** Recharts
- **Formato:** date-fns, xlsx-js-style
- **Tests:** Vitest

### Backend
- **Framework:** Spring Boot 3.4.4 (Java 17)
- **Build:** Maven
- **ORM:** Spring Data JPA + Hibernate (ddl-auto: validate)
- **BD:** PostgreSQL
- **Auth:** JWT (jjwt 0.12.6) + Spring Security
- **Rate Limiting:** Bucket4j 8.10.1
- **WS:** STOMP over WebSocket + SockJS
- **Mails:** MailerSend SDK
- **GPS:** Entel OnWay API
- **Consultas RENIEC/SUNAT:** Factiliza API
- **Geocodificación:** Nominatim

---

## Estructura del Frontend

### Convenciones de código
- **No agregar comentarios** a menos que se solicite explícitamente
- Seguir el estilo existente del código
- Usar `@/` alias para imports (ej: `@/components/ui/button`)
- Naming: PascalCase para componentes, camelCase para funciones/variables

### Carpetas principales

```
frontend/src/
├── components/
│   ├── clients/        # Componentes de clientes
│   ├── common/         # Componentes compartidos (FullscreenLoadOrError)
│   ├── completarOrden/ # Componentes del wizard de completar orden
│   ├── flota/          # Componentes de flota en vivo
│   ├── gps/            # Componentes GPS tracker
│   ├── layout/         # AppLayout, Sidebar, Topbar, Footer
│   ├── maps/           # Componentes de mapas (PromssacMap)
│   ├── orders/         # Tablas, filtros, diálogos de órdenes
│   ├── routes/         # Componentes de rutas
│   ├── ui/             # shadcn/ui primitives (button, dialog, input, etc.)
│   └── vehicles/       # Componentes de vehículos
├── contexts/
│   └── AuthContext.tsx  # Auth: login/logout, permisos, localStorage
├── domain/
│   ├── permissions.ts  # IDs de permisos y tipos AuthUser/LoginResponse
│   ├── clients.ts      # tipos Cliente
│   ├── orders.ts       # tipos Orden
│   ├── routes.ts       # tipos Ruta
│   ├── vehicles.ts     # tipos Vehiculo
│   ├── fleet.ts        # tipos Flota
│   ├── webUsers.ts     # tipos UsuarioWeb
│   ├── mobileUsers.ts  # tipos UsuarioMovil
│   └── ...             # otros tipos
├── hooks/              # Custom hooks
├── lib/
│   ├── api.ts          # API helper (apiGet, apiPost, apiPut, multipart, etc.)
│   ├── utils.ts        # Utilidades generales (cn de tailwind-merge)
│   ├── formatCurrency.ts
│   ├── pagination.ts
│   └── ...             # otros utilities
├── pages/              # Páginas (una por ruta)
├── services/           # API clients específicos
│   ├── endpoints.ts    # Constantes de endpoints
│   ├── api.ts → lib/api.ts
│   ├── orders.api.ts
│   ├── clients.api.ts
│   ├── routes.api.ts
│   ├── vehicles.api.ts
│   ├── fleet.api.ts
│   ├── notifications.api.ts
│   ├── alertas.api.ts
│   ├── estados.api.ts
│   ├── webUsers.api.ts
│   ├── mobileUsers.api.ts
│   ├── webRoles.api.ts
│   ├── gps.api.ts
│   └── ...
└── App.tsx             # Routing principal
```

### Routing completo (App.tsx)

| Path | Componente | Permiso | Descripción |
|---|---|---|---|
| `/login` | Login | público | Login |
| `/enlace-cliente/:orderId` | EnlaceCliente | público | Enlace cliente externo |
| `/` | Dashboard | protegido | Dashboard principal |
| `/vehiculos` | Vehiculos | protegido | Gestión de vehículos |
| `/rutas` | Rutas | `g1` | Lista de rutas |
| `/rutas/:id` | DetalleRuta | `g1` | Detalle de ruta |
| `/ordenes` | Ordenes | `g2` | Lista de órdenes |
| `/ordenes/detalle/:orderId` | DetalleOrden | `g2` | Detalle de orden |
| `/ordenes/completar` | CompletarOrden | protegido | Wizard completar orden |
| `/ordenes/productos` | OrdenProductos | protegido | Productos de órdenes |
| `/flota` | Flota | `g3` | Flota en vivo |
| `/clientes` | Clientes | `g4` | Lista de clientes |
| `/clientes/detalle/:id` | DetalleCliente | `g4` | Detalle de cliente |
| `/importar/:id` | DetalleImportacion | protegido | Resultado importación |
| `/usuarios/web` | UsuariosWeb | `a2` | Usuarios web |
| `/usuarios/web/nuevo` | NuevoUsuarioWeb | `a2-1` | Crear usuario web |
| `/usuarios/web/:id/editar` | EditarUsuario | `a2` | Editar usuario web |
| `/usuarios/web/perfil` | PerfilUsuario | protegido | Mi perfil |
| `/usuarios/movil` | UsuariosMovil | `a2` | Usuarios móvil |
| `/usuarios/movil/nuevo` | NuevoUsuarioMovil | `a2-2` | Crear usuario móvil |
| `/usuarios/movil/:id/editar` | NuevoUsuarioMovil | `a2` | Editar usuario móvil |
| `/configuracion/subestados` | Estados | `a4` | Config. estados/subestados |
| `/configuracion/alertas` | Alertas | `g6` | Lista de alertas |
| `/configuracion/alertas/parametros` | ConfiguracionAlertas | `a4` | Config. alertas |
| `/configuracion/notificaciones` | Notificaciones | `a4` | Notificaciones enviadas |
| `/configuracion/notificaciones/nueva` | NuevaNotificacion | `a4` | Nueva notificación |
| `/usuarios/roles` | RolesUsuario | `a2` | Roles web |
| `/usuarios/roles/nuevo` | NuevoRol | `a2` | Crear rol |
| `/usuarios/roles/:id/editar` | EditarRol | `a2` | Editar rol |
| `*` | NotFound | protegido | 404 |

### Sistema de permisos

IDs de permisos en `frontend/src/domain/permissions.ts`:

**Generales (operaciones):**
- `g1` → Rutas
- `g2` → Órdenes (sub: `g2-1` crear, `g2-2` editar, `g2-3` editar gestión, `g2-4` eliminar)
- `g3` → Flota
- `g4` → Clientes
- `g6` → Alertas

**Ajustes (configuración):**
- `a1` → Cuenta
- `a2` → Usuarios (sub: `a2-1` crear web, `a2-2` crear móvil)
- `a3` → Vehículos
- `a4` → Configuración avanzada (estados, alertas, notificaciones)

El `Sidebar` filtra items usando `SIDEBAR_PERMISSION_MAP` y `hasPermission()`. Usar `PermissionRoute` con el permiso ID en las rutas. Usar `usePermission(permisoId)` o `hasPermission()` dentro de componentes.

### AuthContext

- `useAuth()` → `{ user, token, isAuthenticated, isLoading, login(usuario, contrasena), logout(), hasPermission(permisoId) }`
- Token y user persisten en `localStorage` (`auth_token`, `auth_user`)
- `login()` POST a `/api/v1/auth/login`
- `hasPermission()` verifica `user.permissions[permisoId] === true`

### API Helper (`frontend/src/lib/api.ts`)

- Base URL: `VITE_API_BASE` env var
- Token: `localStorage.getItem("auth_token")` → header `Authorization: Bearer <token>`
- Funciones: `apiGet`, `apiPost`, `apiPostNoContent`, `apiPut`, `apiPatch`, `apiPatchJson`, `apiDelete`
- Multipart: `apiPostMultipartJson`, `apiPutMultipartJson` (FormData con JSON blob + archivo opcional)
- Errores: intenta `res.json().error`, fallback a `res.statusText`

---

## Estructura del Backend

### Capas y carpetas

```
backend/src/main/java/com/promssac/backend/
├── PromssacBackendApplication.java
├── config/              # Config: Security, CORS, RateLimit, WebSocket, DataSeeders
├── controller/          # REST controllers
├── exception/           # GlobalExceptionHandler, BusinessException, etc.
├── integration/         # Integraciones externas (MailerSend)
├── model/
│   ├── dto/request/     # Request DTOs
│   ├── dto/response/    # Response DTOs
│   ├── entity/          # JPA entities
│   └── enums/           # Enumeraciones
├── repository/          # Spring Data JPA repositories
├── security/            # JWT filters, RateLimitFilter, SecurityHeadersFilter
├── service/             # Interfaces de servicio
│   └── impl/            # Implementaciones
├── time/                # FleetTimeZones
├── util/                # Utilidades (IpUtils)
└── validation/          # Validators personalizados
```

### Entities (14)

| Entidad | Tabla | PK | Descripción |
|---|---|---|---|
| `AlertaConfig` | `alertas_config` | UUID | Config de alertas (entregado, demora, minutos) |
| `Cliente` | `clientes` | UUID | Clientes (IIEE: colegios) con ubicación |
| `ComentarioOrden` | `comentarios_orden` | UUID | Comentarios en órdenes con archivos |
| `DispositivoFlota` | `dispositivos_flota` | UUID | Dispositivos GPS por vehículo |
| `Estado` | `estados` | UUID | Estados/subestados (árbol self-ref) |
| `NotificacionEnviada` | `notificaciones_enviadas` | UUID | Historial de notificaciones email |
| `Orden` | `ordenes` | UUID | Órdenes de entrega |
| `OrdenProducto` | `orden_productos` | UUID | Productos de una orden |
| `RolWeb` | `roles_web` | UUID | Roles con permisos JSON |
| `Ruta` | `rutas` | UUID | Rutas de despacho |
| `UbicacionUsuario` | `ubicaciones_usuarios` | UUID | Última ubicación de usuario móvil |
| `UsuarioMovil` | `usuarios_movil` | UUID | Usuarios de app móvil |
| `UsuarioWeb` | `usuarios_web` | UUID | Usuarios web |
| `Vehiculo` | `vehiculos` | UUID | Vehículos de flota |

### Enums (4)

- `EstadoVehiculo`: `ACTIVO`, `EN_RUTA`, `MANTENIMIENTO`, `INACTIVO`
- `ModoPermisoUsuarioWeb`: `ROL`, `PERSONALIZADO`
- `ModoVehiculoUsuarioMovil`: `LIST`, `CREATE`
- `TipoVehiculo`: `FURGON`, `CAMION`, `MOTO`, `CAMIONETA`

### Controllers y endpoints clave

| Controller | Base path | Endpoints |
|---|---|---|
| AuthController | `/api/v1/auth` | `POST /login` |
| OrdenController | `/api/v1/ordenes` | CRUD + completar-datos, estado, asignacion-masiva |
| ClienteController | `/api/v1/clientes` | CRUD + search, autocomplete-email, importacion/lote |
| VehiculoController | `/api/v1/vehiculos` | CRUD + opciones |
| RutaController | `/api/v1/rutas` | CRUD + ordenes |
| UsuarioWebController | `/api/v1/usuarios-web` | CRUD + activo |
| UsuarioMovilController | `/api/v1/usuarios-movil` | CRUD + foto (multipart) |
| RolWebController | `/api/v1/roles-web` | CRUD + opciones, activo |
| EstadoController | `/api/v1/estados` | padres, hijos/por-padre, CRUD + activo |
| GpsController | `/api/v1/gps` | ubicacion, ubicaciones |
| FlotaController | `/api/v1/flota` | dispositivos, onway-map |
| ComentarioController | `/api/v1/ordenes/{numeroOrden}/comentarios` | GET, POST (multipart) |
| NotificationController | `/api/v1/notificaciones` | enviar, GET paginado |
| AlertaConfigController | `/api/v1/alertas` | GET/PUT config |
| GeocodificacionController | `/api/v1/geocodificacion` | reversa, buscar |
| FileServeController | `/api/v1/files` | GET comentarios/{filename} |
| ConsultaDocumentoController | `/api/v1/consultas` | GET dni/{dni}, GET ruc/{ruc} |

### Security

- **Auth:** JWT en header `Authorization: Bearer <token>`
- **Session:** STATELESS, CSRF disabled
- **Endpoints públicos:** `/api/v1/auth/**`, `/ws/**`, `/ws`
- **Endpoints protegidos:** `/api/v1/**` requiere autenticación
- **Rate Limiting:** Login 5/min (burst 3), API 120/min (burst 30) por IP
- **WebSocket:** STOMP sobre SockJS, endpoint `/ws`, broker `/topic`, JWT en conexión

### application.properties clave

- `spring.profiles.active` = `${SPRING_PROFILES_ACTIVE:dev}`
- `spring.jpa.hibernate.ddl-auto=validate`
- Archivos multimedia: `app.mobile-user-photo-dir=data/usuarios-movil-fotos`
- Upload max: 10MB (individual), 12MB (request)

---

## Comandos

```bash
# Backend
cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Frontend
cd frontend && npm run dev

# Build frontend
cd frontend && npm run build

# Lint frontend
cd frontend && npm run lint

# Tests frontend
cd frontend && npm test
```

## Convenciones importantes

1. **No agregar comentarios** a menos que se solicite explícitamente
2. Los permisos se pasan como string `"g1"`, `"a4"`, etc.
3. Las páginas se importan dinámicamente con `lazy()` en App.tsx (import estático actual, pero se puede cambiar)
4. Los servicios API siguen el patrón de `orders.api.ts` o `clients.api.ts`
5. Los tipos/domain van en `frontend/src/domain/`
6. Las páginas van en `frontend/src/pages/`
7. Los componentes reutilizables van en `frontend/src/components/`
8. Los hooks van en `frontend/src/hooks/`
