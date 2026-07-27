# Proyecto: [Nombre del cliente] — eCommerce Streetwear

## Contexto
Este proyecto nace de un mockup de alta fidelidad hecho en Figma Make (`High-Fidelity_eCommerce_Mockup.zip`).
El mockup original traía 4 conceptos de diseño (A, B, C, D). **El cliente eligió el Concepto C (Streetwear oscuro)**.
Ese es el único diseño que se debe llevar a producción. Los conceptos A, B y D deben ignorarse o eliminarse — no son parte del alcance.

Marca placeholder usada en el mockup: "VOID". Confirmar con el cliente si el nombre/logo real es distinto antes de hardcodear textos de marca.

## Stack técnico (heredado del mockup, mantener)
- React + Vite
- Tailwind CSS v4
- shadcn/ui (componentes en `src/app/components/ui`)
- Radix UI (primitives)
- `motion` (Framer Motion) para animaciones
- lucide-react para iconos

## Identidad visual del Concepto C (Streetwear)
- Tipografía: **Manrope** (pesos 300–800), importada vía Google Fonts en `src/styles/fonts.css`
- Paleta: fondo negro casi puro `#080808`, secciones alternas `#0F0F0F`, tarjetas `#181818`, texto blanco con opacidades (`white/60`, `white/40`, `white/20`...) para jerarquía
- Tono: mayúsculas, tracking amplio (`tracking-[0.3em]`, `tracking-[0.5em]`), tipografía "font-black" para titulares agresivos
- Botones primarios: fondo blanco, texto negro, todo en mayúsculas, tracking amplio
- Botones secundarios: borde blanco/30, transparente
- Micro-interacciones: hover con scale sutil, transiciones de opacidad, ticker infinito animado

## Secciones de la página (en orden, del mockup original)
1. Nav fija (logo centrado, menú, búsqueda, carrito con badge)
2. Hero full-screen con imagen + overlay + CTA doble
3. Ticker animado infinito (texto en loop horizontal)
4. Grid de categorías (5 columnas, imagen + hover)
5. Grid de productos (4 columnas, wishlist, descuento, quick-add al hover)
6. Sección promo full-width con imagen y CTA
7. Colecciones con tabs filtrables
8. Beneficios (envíos, devoluciones, etc. — grid de 5)
9. Inspiración / galería tipo Instagram (masonry)
10. Reviews de clientes
11. Newsletter (input + botón)
12. Footer (links, métodos de pago)

## Pendientes conocidos (NO inventar, esperar al cliente)
- **Logo real**: por ahora no hay logo. Usar el texto placeholder tal cual está o un logo temporal en texto; dejar el componente de logo aislado y fácil de reemplazar por una imagen/SVG después.
- **Fotografía de producto y hero real**: el mockup usa URLs de Unsplash como placeholder. NO usar estas URLs en producción final — son solo para maquetar. Dejar la data de imágenes centralizada (un solo archivo de "assets"/"data") para poder reemplazarlas fácilmente cuando lleguen las fotos reales del cliente.
- Copys/textos en español neutro, revisar con el cliente antes de publicar.

## Reglas generales para el desarrollo
- Refactorizar el `App.tsx` monolítico (1200+ líneas, con los 4 conceptos mezclados) en componentes separados por sección: `Nav`, `Hero`, `Ticker`, `CategoryGrid`, `ProductGrid`, `PromoBanner`, `CollectionsTabs`, `Benefits`, `InspirationGrid`, `Reviews`, `Newsletter`, `Footer`.
- Cada componente en su propio archivo dentro de `src/app/components/sections/`.
- Centralizar la data mock (productos, categorías, colecciones, reviews, beneficios) en `src/app/data/` como se hace ahora, pero en archivos separados por tipo, no todo en `App.tsx`.
- Mantener mobile-first / responsive real: el mockup usa grids fijos (`grid-cols-5`, `grid-cols-4`, `grid-cols-3`) pensados para desktop — hay que agregar breakpoints (`sm:`, `md:`, `lg:`) para que colapsen bien en mobile.
- No usar posicionamiento absoluto salvo que sea necesario (overlays de imagen, badges); preferir flexbox/grid.
- Mantener el sistema de diseño (colores, tracking, mayúsculas) consistente en cualquier componente nuevo que se agregue.
- Componentes de `src/app/components/ui/` (shadcn) se pueden seguir usando y ampliando; no reinventar inputs/botones desde cero si ya existe el primitivo.
- Código en inglés (nombres de variables/funciones), copy visible al usuario en español.

## Backend (decidido)
- **Runtime**: Node.js + Express
- **Base de datos**: PostgreSQL
- **ORM**: Prisma (migraciones y tipado consistente entre frontend/backend)
- **Auth**: JWT (access + refresh token), passwords con bcrypt
- **Pasarela de pagos**: Wompi (soporta PSE, Nequi y tarjetas — coincide con los métodos ya mostrados en el footer del mockup). Flujo: checkout con Widget/Payment Link de Wompi → confirmación vía webhook firmado, nunca confiar solo en el redirect del front.
- **Panel de administración**: sí, para que el cliente pueda gestionar productos, inventario, pedidos y ver ventas. Rutas protegidas por rol (`admin` vs `customer`) en el mismo backend, panel como app/rutas separadas del storefront público.

### Modelo de datos inicial (borrador)
- `User` (id, email, password_hash, role, created_at)
- `Product` (id, name, description, price, compare_at_price, category_id, images[], active)
- `ProductVariant` (id, product_id, size, color, stock, sku)
- `Category` (id, name, slug)
- `Order` (id, user_id, status, total, payment_status, wompi_transaction_id, created_at)
- `OrderItem` (id, order_id, variant_id, quantity, unit_price)
- `Address` (id, user_id, line1, city, department, phone)

### Estructura de carpetas sugerida
```
/frontend        (el proyecto React actual)
/backend
  /src
    /routes      (products, orders, auth, admin, webhooks)
    /controllers
    /services    (wompiService.ts, authService.ts)
    /middleware  (auth.ts, requireAdmin.ts)
    /prisma      (schema.prisma, migrations/)
```

## Fuera de alcance por ahora
- App móvil nativa
- Multi-idioma / multi-moneda
- Integraciones de envío automatizadas (por ahora manual o campo simple de tracking)