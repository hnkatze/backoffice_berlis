

# Backoffice con Next.js y NestJS

Este proyecto es un sistema de gestión de backoffice diseñado para manejar diferentes roles de usuario (admin, gerente, cajero, cocina y bebidas). Está construido con **Next.js** para el frontend y **NestJS** para la API backend.

## Características

- **Roles de usuario:** Acceso diferenciado basado en roles (admin, gerente, cajero, cocina, bebidas).
- **Middleware de control de acceso:** Gestión de permisos para garantizar que cada usuario acceda solo a las rutas permitidas según su rol.
- **API RESTful:** Proporcionada por NestJS para manejar datos y operaciones del sistema.
- **Diseño modular:** Escalable para nuevas funcionalidades y roles.

---

## Tecnologías utilizadas

### Frontend
- **Next.js**: Framework de React para SSR (Server-Side Rendering) y SSG (Static Site Generation).
- **TypeScript**: Tipado estático para mayor seguridad y mantenimiento.
- **Middleware**: Gestión de rutas protegidas según roles.

### Backend
- **NestJS**: Framework modular para construir APIs robustas y escalables.
- **JWT**: Autenticación basada en JSON Web Tokens.
- **PostgreSQL/MySQL**: Base de datos relacional para almacenar datos de usuarios, roles y más.

---

## Roles y acceso a rutas

### Definición de roles y rutas

Cada rol tiene acceso a un conjunto específico de rutas:

```typescript
const rolePaths: { [key: string]: string[] } = {
  admin: ['/dashboard', '/dashboard/ordenes', '/dashboard/cocina', '/dashboard/bebidas', '/dashboard/back'],
  gerent: ['/dashboard', '/dashboard/ordenes', '/dashboard/cocina', '/dashboard/bebidas', '/dashboard/back'],
  cashier: ['/dashboard', '/dashboard/ordenes'],
  kitchen: ['/dashboard', '/dashboard/cocina'],
  drinks: ['/dashboard', '/dashboard/bebidas'],
};
```

### Ejemplo de acceso por rol:

- **Admin**: Acceso completo al sistema.
- **Gerente**: Acceso completo al sistema.
- **Cajero**: Solo puede acceder al tablero general y a las órdenes.
- **Cocina**: Acceso al tablero general y a las órdenes relacionadas con la cocina.
- **Bebidas**: Acceso al tablero general y a las órdenes relacionadas con bebidas.

---

## Middleware de control de acceso

El middleware valida si el usuario tiene permisos para acceder a una ruta específica.

### Implementación del middleware:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token');
  const role = token?.role;

  const currentPath = req.nextUrl.pathname;
  const allowedPaths = rolePaths[role] || [];

  if (!allowedPaths.includes(currentPath)) {
    return NextResponse.redirect(new URL('/403', req.url));
  }

  return NextResponse.next();
}
```

### Configuración del middleware:

El middleware debe ser configurado en el archivo `middleware.ts` en la raíz del proyecto.

```typescript
export const config = {
  matcher: ['/dashboard/:path*'],
};
```

---

## Instalación y configuración

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/usuario/backoffice-next-nest.git
   cd backoffice-next-nest
   ```

2. **Instalar dependencias del frontend y backend:**

   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

3. **Configurar las variables de entorno:**

   Crear un archivo `.env` en las carpetas `frontend` y `backend` y agregar las variables necesarias, como la URL de la API, claves JWT, y configuración de la base de datos.

4. **Iniciar el proyecto:**

   ```bash
   # Frontend
   cd frontend
   npm run dev

   # Backend
   cd ../backend
   npm run start:dev
   ```

5. **Acceder a la aplicación:**

   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API Backend: [http://localhost:4000](http://localhost:4000)

---

## Estructura del proyecto

### Frontend (Next.js)

```
frontend/
├── components/
├── pages/
│   ├── _app.tsx
│   ├── index.tsx
│   ├── dashboard/
│   │   ├── ordenes.tsx
│   │   ├── cocina.tsx
│   │   ├── bebidas.tsx
├── middleware.ts
├── styles/
├── utils/
```

### Backend (NestJS)

```
backend/
├── src/
│   ├── auth/
│   ├── users/
│   ├── roles/
│   ├── orders/
│   ├── database/
```

---

## Próximas mejoras

- **Panel de configuración de roles.**
- **Notificaciones en tiempo real con WebSockets.**
- **Reportes avanzados para admins y gerentes.**

---

## Contribución

1. Realizar un fork del repositorio.
2. Crear una rama con la nueva funcionalidad: `git checkout -b feature/nueva-funcionalidad`.
3. Hacer commit de los cambios: `git commit -m 'Agregar nueva funcionalidad'`.
4. Enviar un pull request.

---

## Licencia

Este proyecto está licenciado bajo la licencia [MIT](LICENSE).  

