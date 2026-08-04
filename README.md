# VOID Culture — Tienda Virtual

E-commerce completo con panel de administración, sistema de newsletter masivo y pago contra entrega. Frontend en Vite + React, backend en Express + Prisma + PostgreSQL (Supabase).

---

## Tech Stack

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 18, Vite 6, Tailwind CSS, React Router 6, Framer Motion, Lucide Icons |
| **Backend** | Node.js 20+, Express 5, Prisma ORM, PostgreSQL (Supabase), Nodemailer (Gmail), JWT |
| **Infra** | Supabase (DB + Storage), Vercel (frontend), Render (backend) |

---

## Features

- **Catálogo**: Productos con variantes (talla, color, stock, SKU), categorías, colecciones, precios tachados
- **Carrito & Checkout**: Persistencia local, flujo completo hasta confirmación
- **Pedidos idempotentes**: Cada checkout genera una `requestKey` única en cliente; el backend rechaza duplicados (doble clic, refresco congelado) y valida stock con transacciones
- **Auth**: Registro/Login JWT, roles `ADMIN` / `CUSTOMER`, refresh automático
- **Panel Admin** (ruta no obvia `/oficina`):
  - Dashboard: métricas (ventas, pedidos, productos, usuarios) + últimos pedidos
  - Productos: tabla + modal CRUD con variantes dinámicas
  - Pedidos: lista, detalle expandible, cambio de estado (PENDING → PAID → SHIPPED → DELIVERED / CANCELLED)
  - Newsletter: lista suscriptores, editor con preview, envío masivo con template HTML
- **Newsletter público**: Suscripción en footer, bienvenida automática
- **Pagos**: Contra entrega — el cliente paga en efectivo al recibir (el esqueleto Wompi con webhook queda listo para integrar pagos en línea después)
- **Email**: Confirmación de pedido + newsletter masivo (lotes de 50, rate-limit seguro)
- **Responsive**: Layout completo para móvil (drawers, bottom-sheets, touch targets), escritorio con sidebars fijas

---

## Estructura del repo

```
Tienda_virtual/
├── Tienda/                 # Frontend (Vite + React)
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/admin/       # AdminDashboard, AdminProducts, AdminOrders, AdminNewsletter
│   │   │   ├── components/        # UI (shadcn), sections, auth
│   │   │   ├── context/           # AuthContext, CartContext
│   │   │   ├── services/api.ts    # Cliente tipado a /api
│   │   │   ├── constants.ts       # ADMIN_PATH (ruta del panel admin)
│   │   │   └── App.tsx            # Rutas + AdminRoute protection
│   │   └── main.tsx
│   ├── index.html
│   └── package.json
├── backend/                # API Express + Prisma
│   ├── src/
│   │   ├── controllers/           # adminController, authController, productController, orderController
│   │   ├── middleware/            # requireAuth, requireAdmin
│   │   ├── routes/                # adminRoutes, auth, products, orders, newsletter, webhooks
│   │   ├── services/emailService.ts
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma          # Models: User, Product, Variant, Order, NewsletterSubscription
│   │   └── migrations/            # Baseline aplicado + futuras migraciones
│   ├── prisma.config.ts           # Config de Prisma CLI (usa DIRECT_URL para migraciones)
│   └── package.json
└── .gitignore
```

---

## Getting Started

### Prerrequisitos
- Node.js 20+
- npm
- Cuenta Supabase (PostgreSQL + Storage) + Gmail App Password para emails

### 1. Clonar e instalar

```bash
git clone https://github.com/yeison1305/Tienda_virtual.git
cd Tienda_virtual

# Frontend
cd Tienda && npm install

# Backend
cd ../backend && npm install
```

### 2. Variables de entorno

**Backend** (`backend/.env` — copia de `backend/.env.example`):
```env
DATABASE_URL="postgresql://user:pass@host:6543/db?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:5432/db"

JWT_SECRET="tu-secreto-largo-y-seguro"
PORT=4000
FRONTEND_URL="http://localhost:5173"

EMAIL_USER="tu@gmail.com"
EMAIL_PASS="tu-gmail-app-password"
EMAIL_FROM='"VOID Culture" <noreply@void.co>'

# Opcional: Wompi
WOMPI_PUBLIC_KEY=
WOMPI_PRIVATE_KEY=
WOMPI_EVENTS_SECRET=
```

> `DATABASE_URL` apunta al pooler de Supabase (`:6543` + `pgbouncer=true`), `DIRECT_URL` a la conexión directa (`:5432`) — necesaria para migraciones/DDL.

**Frontend** (`Tienda/.env` opcional para dev):
```env
VITE_API_URL=http://localhost:4000/api
```

### 3. Base de datos

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed   # crea categorías + 4 productos demo
```

### 4. Desarrollo (dos terminales)

```bash
# Terminal 1: Backend
cd backend && npm run dev    # http://localhost:4000

# Terminal 2: Frontend
cd Tienda && npm run dev     # http://localhost:5173
```

### 5. Primer admin

```sql
-- En Supabase SQL Editor o psql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'tu@email.com';
```

Login → redirige automático al panel admin.

---

## Admin Panel

| Ruta | Descripción |
|------|-------------|
| `/oficina` | Dashboard: KPIs + últimos 5 pedidos |
| `/oficina/productos` | CRUD productos + variantes (modal) |
| `/oficina/pedidos` | Tabla con estados, detalle expandible |
| `/oficina/newsletter` | Editor + preview suscriptores + envío masivo |

**Protección**: la ruta del panel se define en `Tienda/src/app/constants.ts` (`ADMIN_PATH`) y es intencionalmente no obvia. `AdminRoute` verifica `user.role === 'ADMIN'` en cliente; `requireAdmin` valida JWT + rol en servidor. **La URL no es seguridad**: el backend valida en cada request.

---

## API Endpoints (resumen)

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/products
GET    /api/products/:id
GET    /api/categories

POST   /api/orders
GET    /api/orders/my-orders
POST   /api/webhooks/wompi

POST   /api/newsletter/subscribe

# Admin (requiere Bearer token ADMIN)
GET    /api/admin/stats
GET    /api/admin/products
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id
GET    /api/admin/orders
PUT    /api/admin/orders/:id/status
GET    /api/admin/categories
POST   /api/admin/categories
DELETE /api/admin/categories/:id
GET    /api/admin/newsletter/subscribers
POST   /api/admin/newsletter/send
```

---

## Newsletter

- **Suscripción**: `POST /api/newsletter/subscribe` → email de bienvenida
- **Envío admin**: `POST /api/admin/newsletter/send` con body:
```json
{
  "subject": "Asunto",
  "title": "Título principal",
  "message": "Cuerpo con\nsaltos de línea",
  "ctaText": "Ver colección",
  "ctaLink": "https://tutienda.com/novedades",
  "imageUrl": "https://..."   // opcional
}
```
- Template HTML: logo, imagen hero, título, mensaje, botón CTA, footer con unsubscribe
- Envío en lotes de 50 con 1s delay entre lotes

---

## Deploy

### Frontend — Vercel

1. En [vercel.com](https://vercel.com) → *Add New Project* → importar el repo (privado funciona igual).
2. **Root Directory: `Tienda`** → Vercel detecta Vite automáticamente (Build `npm run build`, Output `dist`).
3. Environment Variables:
   - `VITE_API_URL=https://<tu-backend>.onrender.com/api` ← **obligatoria** (sin ella el frontend busca `/api` en vercel.app y da 404)
4. Deploy → URL tipo `https://tienda-virtual.vercel.app`. Esa URL va al backend como `FRONTEND_URL`.

### Backend — Render

1. En [render.com](https://render.com) → *New → Web Service* → conectar el repo.
2. **Root Directory: `backend`** · Runtime **Node** (usa el `engines` del package.json).
3. **Build Command**:
   ```
   npm install && npx prisma generate && npm run build
   ```
4. **Start Command**:
   ```
   npx prisma migrate deploy && node dist/server.js
   ```
   (El `migrate deploy` es idempotente: no-op si ya está aplicado — red de seguridad para cambios futuros de schema.)
5. Environment Variables (mismas que `backend/.env`):
   | Variable | Valor |
   |----------|-------|
   | `DATABASE_URL` | Supabase pooler `:6543` con `?pgbouncer=true` |
   | `DIRECT_URL` | Supabase directa `:5432` |
   | `SUPABASE_URL` | `https://<ref>.supabase.co` |
   | `SUPABASE_SERVICE_KEY` | Service role key |
   | `JWT_SECRET` | Generar: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `EMAIL_USER` / `EMAIL_PASS` | Gmail + App Password |
   | `EMAIL_FROM` | `"VOID Culture" <noreply@void.co>` |
   | `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | (opcional) Proveedor SMTP alternativo — ej. Brevo: `smtp-relay.brevo.com`, `587`, `false` |
   | `SMTP_USER` / `SMTP_PASS` | (opcional) Credenciales del proveedor; si faltan usa `EMAIL_USER` / `EMAIL_PASS` |
   | `FRONTEND_URL` | URL final de Vercel **sin barra final** (para CORS) |
   | `NODE_ENV` | `production` (Render inyecta `PORT` solo) |

6. **Nota free tier**: Render duerme el servicio tras ~15 min de inactividad → el primer request tarda ~50 s (cold start). Si es problema, plan Starter.

**Notas**:
- CORS del backend acepta solo el origen de `FRONTEND_URL`; en dev es `http://localhost:5173`.
- Las imágenes se guardan con URL absoluta de Supabase Storage, no requieren rewrites.
- Los pedidos nacen `PENDING` (pago contra entrega): el admin los pasa a `PAID` al cobrar y luego `SHIPPED` / `DELIVERED`.

---

## Scripts útiles

```bash
# Frontend
cd Tienda
npm run dev        # Vite dev server
npm run build      # Producción → dist/

# Backend
cd backend
npm run dev        # tsx watch src/server.ts
npm run build      # tsc → dist/
npm start          # node dist/server.js

# Prisma
npx prisma studio
npx prisma migrate deploy   # aplica migraciones en producción
npx prisma db seed
npx prisma generate
```

---

## Licencia

MIT — Libre uso, modificación y distribución.
