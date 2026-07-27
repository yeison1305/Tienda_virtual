# VOID Culture — Tienda Virtual

E-commerce moderno con panel de administración, sistema de newsletter masivo y pasarela de pagos Wompi.

---

## Tech Stack

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 18, Vite 6, Tailwind CSS, React Router 6, Framer Motion, Lucide Icons |
| **Backend** | Node.js 20+, Express 5, Prisma ORM, PostgreSQL (Supabase), Nodemailer (Gmail), JWT |
| **Infra** | Supabase (DB + Auth helpers), pnpm workspaces |

---

## Features

- **Catálogo**: Productos con variantes (talla, color, stock, SKU), categorías, precios tachados
- **Carrito & Checkout**: Persistencia local, flujo completo hasta confirmación
- **Auth**: Registro/Login JWT, roles `ADMIN` / `CUSTOMER`, refresh automático
- **Panel Admin** (`/admin`):
  - Dashboard: métricas (ventas, pedidos, productos, usuarios) + últimos pedidos
  - Productos: tabla + modal CRUD con variantes dinámicas
  - Pedidos: lista, detalle expandible, cambio de estado (PENDING → PAID → SHIPPED → DELIVERED / CANCELLED)
  - Newsletter: lista suscriptores, editor con preview, envío masivo con template HTML
- **Newsletter público**: Suscripción en footer, bienvenida automática
- **Pagos**: Integración Wompi (webhooks listos)
- **Email**: Confirmación de pedido + newsletter masivo (lotes de 50, rate-limit seguro)

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
│   ├── prisma/schema.prisma       # Models: User, Product, Variant, Order, NewsletterSubscription
│   └── package.json
└── .gitignore
```

---

## Getting Started

### Prerrequisitos
- Node.js 20+
- pnpm (`npm i -g pnpm`)
- Cuenta Supabase (PostgreSQL) + Gmail App Password para emails

### 1. Clonar e instalar

```bash
git clone https://github.com/TU_USUARIO/TU_REPO.git
cd Tienda_virtual

# Frontend
cd Tienda && pnpm install

# Backend
cd ../backend && pnpm install
```

### 2. Variables de entorno

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true"
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

**Frontend** (`Tienda/.env` opcional):
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
cd backend && pnpm dev     # http://localhost:4000

# Terminal 2: Frontend
cd Tienda && pnpm dev      # http://localhost:5173
```

### 5. Primer admin

```sql
-- En Supabase SQL Editor o psql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'tu@email.com';
```

Login → redirige automático a `/admin`.

---

## Admin Panel

| Ruta | Descripción |
|------|-------------|
| `/admin` | Dashboard: KPIs + últimos 5 pedidos |
| `/admin/productos` | CRUD productos + variantes (modal) |
| `/admin/pedidos` | Tabla con estados, detalle expandible |
| `/admin/newsletter` | Editor + preview suscriptores + envío masivo |

**Protección**: `AdminRoute` verifica `user.role === 'ADMIN'` en cliente; `requireAdmin` valida JWT + rol en servidor.

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

## Scripts útiles

```bash
# Frontend
cd Tienda
pnpm dev        # Vite dev server
pnpm build      # Producción → dist/
pnpm preview    # Preview build

# Backend
cd backend
pnpm dev        # tsx watch src/server.ts
pnpm build      # tsc → dist/
pnpm start      # node dist/server.js

# Prisma
npx prisma studio
npx prisma migrate dev
npx prisma db seed
npx prisma generate
```

---

## Deploy

| Servicio | Frontend | Backend | DB |
|----------|----------|---------|-----|
| **Recomendado** | Vercel / Netlify | Railway / Render / Fly.io | Supabase (managed PG) |
| **Build cmd** | `pnpm build` | `pnpm build` | — |
| **Output** | `dist/` | `dist/` | — |
| **Env vars** | `VITE_API_URL` | todas las de `.env` | `DATABASE_URL` |

**Notas**:
- Backend: asegurar `FRONTEND_URL` en CORS
- Frontend: `VITE_API_URL` debe apuntar al backend productivo
- Supabase: habilitar `pgbouncer` en `DATABASE_URL` para serverless

---

## Licencia

MIT — Libre uso, modificación y distribución.