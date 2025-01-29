

interface Portion {
  size: string;
  price: number;
}


interface MenuItem {
  category?: string;
  id?: string;
  item: string;
  description: string;
  price?: number;
  portions?: Portion[];
}




// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface MenuCategory {
  [key: string]: MenuItem[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface CartItem extends MenuItem {
  quantity: number;
  selectedSize?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ItemsMenu {
  id?: string;
  category: string;
  item: string;
  description: string;
  portions?: Portion[];
  price?: number;
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  category: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Order {
  id?: string;
  table: string;
  items: OrderItem[];
  total: number;
  status: "pendiente" | "en cocina" | "entregado" | "pagado";
  timestamp: string;
  timeDelay?: string;
  callWaiter?: boolean;
  categories?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Branch {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface BranchesList{
  id: string;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface NewBranch {
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: "admin" | "waiter";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UserAuth {
  email: string;
  name: string;
  uid: string;
  image: string;
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface RegisterUser {
  uid: string;
  email: string;
  fullName: string;
  identity: string;
  phone: string;
  password: string;
  confirmPassword: string;
  image: string;
  userType: "admin" | "waiter" | "kitchen" | "customer";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface HistoryBackend {
  _id?: string;
  casier: string;
  items: OrderItem[];
  status: string;
  table: string;
  delay: Date;
  timesTamp: Date;
  total: number;
}




