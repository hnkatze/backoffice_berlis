import { clsx, type ClassValue } from "clsx"
import { Coffee, Users, Warehouse, FileText, ChefHat, Beer } from "lucide-react";
import { twMerge } from "tailwind-merge"
import { municipios } from "./Municipios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const timestampToDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return (
    date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }) +
    " " +
    date.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
};
export const formatDateString = (dateString: string) => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
  const formattedTime = date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return ` ${formattedDate}  ${formattedTime}`;
};

export const timeSince = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return `${interval} years ago`;
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return `${interval} months ago`;
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return `${interval} days ago`;
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return `${interval} hours ago`;
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return `${interval} minutes ago`;
  }
  return `${Math.floor(seconds)} seconds ago`;
};

export const dateDifference = (dateString1: string, dateString2: string) => {
  const date1 = new Date(dateString1);
  const date2 = new Date(dateString2);

  if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
    return "0 mnts";
  }

  const differenceInTime = Math.abs(date2.getTime() - date1.getTime());
  const differenceInMinutes = Math.ceil(differenceInTime / (1000 * 60));
  return `${differenceInMinutes} mnts`;
};

export const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "pendiente":
      return "bg-yellow-100 border-yellow-300";
    case "entregado":
      return "bg-green-100 border-green-300";
    case "pagado":
      return "bg-blue-100 border-blue-300";
    default:
      return "bg-gray-100 border-gray-300";
  }
};
export const getBadgeVariant = (status: Order["status"] | undefined) => {
  switch (status) {
    case "pendiente":
      return "default";
    case "entregado":
      return "secondary";
    case "en cocina":
      return "destructive";
    default:
      return "outline";
  }
};


export function validarIdentidadHonduras(dni: string): boolean {
  console.log({dni});
  if (dni.length !== 13 || !/^\d+$/.test(dni)) {
    return false;
  }

  // Extraer partes del DNI
  const municipio = dni.slice(0, 4);
  const year = parseInt(dni.slice(4, 8), 10);
  console.log({municipio, year});


  // Validar municipio
  const municipioValido = municipios.some((m) => m.codigo === municipio);
  if (!municipioValido) {
    return false;
  }

  // Validar año
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) {
    return false;
  }

  // Si pasa todas las validaciones
  return true;
}
export enum userRoles {
  admin = "admin",
  waiter = "waiter",
  kitchen = "kitchen",
  customer = "Customer",
}

export const ordersFromBackend = (orders: HistoryBackend[]): Order[] => {
  return orders.map((order) => {
    return {
      id: order._id,
      table: order.table,
      items: order.items,
      total: order.total,
      status: order.status as Order["status"],
      timestamp: new Date(order.timesTamp).toISOString(),
      timeDelay: new Date(order.delay).toISOString(),
    };
  });
}
export const menuItemEmpty: MenuItem = {
  category: "",
  id: "",
  item: "",
  description: "",
  price: 0,
  portions: [],
};


export const modulos = [
  { titulo: 'Sucursales', icono: Coffee, ruta: '/dashboard/sucursales', roles: ['admin'] },
  { titulo: 'Personal', icono: Users, ruta: '/dashboard/personal', roles: ['admin', 'gerente'] },
  { titulo: 'Inventario', icono: Warehouse, ruta: '/dashboard/inventario', roles: ['admin', 'gerente'] },
  { titulo: 'Órdenes', icono: FileText, ruta: '/dashboard/ordenes', roles: ['admin', 'gerente', 'cajero', 'cocina', 'bebidas'] },
  { titulo: 'Cocina', icono: ChefHat, ruta: '/dashboard/cocina', roles: ['admin', 'gerente', 'cocina'] },
  { titulo: 'Bebidas', icono: Beer, ruta: '/dashboard/bebidas', roles: ['admin', 'gerente', 'bebidas'] },
]