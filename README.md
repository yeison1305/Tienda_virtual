# VOID Culture — Tienda Virtual

E-commerce moderno con panel de administración, sistema de newsletter masivo y pago contra entrega.

---

## Tech Stack

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 18, Vite 6, Tailwind CSS, React Router 6, Framer Motion, Lucide Icons |
| **Backend** | Node.js 20+, Express 5, Prisma ORM, PostgreSQL (Supabase), Nodemailer (Gmail), JWT |
| **Infra** | Supabase (DB + Storage), npm workspaces |

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
- **Pagos**: Contra entrega — el cliente paga en efectivo al recibir (el esqueleto Wompi con webhook queda listo para integrar pagos en línea después)
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
- npm
- Cuenta Supabase (PostgreSQL + Storage) + Gmail App Password para emails

### 1. Clonar e instalar

```bash
git clone https://github.com/TU_USUARIO/TU_REPO.git
cd Tienda_virtual

# Frontend
cd Tienda && npm install

# Backend
cd ../backend && npm install
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
cd backend && npm run dev    # http://localhost:4000

# Terminal 2: Frontend
cd Tienda && npm run dev     # http://localhost:5173
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
npm run dev        # Vite dev server
npm run build      # Producción → dist/
npm run preview    # Preview build

# Backend
cd backend
npm run dev        # tsx watch src/server.ts
npm run build      # tsc → dist/
npm start          # node dist/server.js

# Prisma
npx prisma studio
npx prisma migrate dev
npx prisma db seed
npx prisma generate
```

---

## Deploy (frontend y backend separados)

| Servicio | Frontend | Backend | DB |
|----------|----------|---------|-----|
| **Recomendado** | Vercel / Netlify | Railway / Render / Fly.io | Supabase (managed PG) |
| **Build cmd** | `npm run build` | `npm run build` | — |
| **Output** | `dist/` | `dist/` | — |

### Backend (Railway / Render / Fly.io)

1. Sube la carpeta `backend/` como servicio Node.
2. Configura las variables de entorno (las mismas de `backend/.env`):
   - `DATABASE_URL`, `DIRECT_URL` (Postgres de Supabase, `pgbouncer=true` en la primera)
   - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
   - `JWT_SECRET` (obligatoria — genera una con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `EMAIL_USER`, `EMAIL_PASS` (App Password de Gmail), `EMAIL_FROM`
   - `FRONTEND_URL` = URL pública del frontend (para CORS)
   - `PORT` (el que asigne la plataforma), `NODE_ENV=production`
3. Build: `npm run build` · Start: `npm start` (usa `dist/`).
4. La primera vez ejecuta las migraciones: `npx prisma migrate deploy`.

### Frontend (Vercel / Netlify)

1. Sube la carpeta `Tienda/`.
2. En Vercel: Framework = Vite · Build = `npm run build` · Output = `dist`.
   En Netlify: Build = `npm run build` · Publish directory = `dist`.
3. Variable de entorno: `VITE_API_URL` = URL pública del backend (ej. `https://tu-backend.up.railway.app/api`). Si no la defines, el frontend asume `/api` en el mismo dominio.
4. Las imágenes ya se guardan con URL absoluta de Supabase, no requieren rewrites.

**Notas**:
- CORS del backend acepta solo el origen de `FRONTEND_URL`; en dev es `http://localhost:5173`.
- Los pedidos nacen `PENDING` (pago contra entrega): el admin los pasa a `PAID` al cobrar y luego `SHIPPED` / `DELIVERED`.

---

## Licencia

MIT — Libre uso, modificación y distribución.