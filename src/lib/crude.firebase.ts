import { authFire, firestore } from "@/config/firebase.config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
  onSnapshot,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  writeBatch,
  setDoc,
  where,
  query,
} from "firebase/firestore";

const menuCategoryCache = new Map<string, MenuCategory>();

class FirebaseServiceCrude {
  itemsMenuCollection = collection(firestore, "menu");
  ordersCollection = collection(firestore, "orders");
  cacheCollections = collection(firestore, "history");
  cache = new Map<string, ItemsMenu>();

  async updateOrderStatus(
    orderId: string,
    newStatus: Order["status"]
  ): Promise<void> {
    const timeDelay = new Date().toISOString();
    const orderDoc = doc(firestore, "orders", orderId);
    await updateDoc(orderDoc, {
      status: newStatus,
      ...(newStatus === "entregado" && { timeDelay: timeDelay }),
    });
  }
  async overwriteOrder(orderId: string, order: Order): Promise<void> {
    const orderDoc = doc(firestore, "orders", orderId);
    await setDoc(orderDoc, order);
  }

  listenToOrder(orderId: string, callback: (order: Order) => void): void {
    const orderDoc = doc(firestore, "orders", orderId);
    onSnapshot(orderDoc, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as Order);
      } else {
        console.error("Order not found");
      }
    });
  }

  listenToHistory(callback: (history: Order[]) => void): void {
    onSnapshot(this.cacheCollections, (snapshot) => {
      const history: Order[] = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Order)
      );
      callback(history);
    });
  }
  async getItemsMenu(): Promise<MenuCategory> {
    if (menuCategoryCache.size > 0) {
      return Array.from(menuCategoryCache.values())[0];
    }
    if (this.cache.size > 0) {
      const data: MenuCategory = Array.from(this.cache.values()).reduce(
        (acc: MenuCategory, item: ItemsMenu) => {
          const category = item.category;
          const menuItem: MenuItem = {
            item: item.item,
            description: item.description,
            price: item.price,
            portions: item.portions,
          };
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(menuItem);
          return acc;
        },
        {}
      );
      menuCategoryCache.set("menu", data);
      console.log({ data });
      return data;
    }
    const querySnapshot = await getDocs(this.itemsMenuCollection);
    const items = querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as ItemsMenu)
    );
    console.log({ items });
    items.forEach((item) => this.cache.set(item.id as string, item));
    const data: MenuCategory = items.reduce(
      (acc: MenuCategory, item: ItemsMenu) => {
        const category = item.category;
        const menuItem: MenuItem = {
          item: item.item,
          description: item.description,
          price: item.price,
          portions: item.portions,
        };
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(menuItem);
        return acc;
      },
      {}
    );
    menuCategoryCache.set("menu", data);
    console.log({ data });
    return data;
  }

  async getInventory(): Promise<MenuItem[]> {
    const querySnapshot = await getDocs(this.itemsMenuCollection);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as MenuItem)
    );
  }

  async addItemMenu(item: ItemsMenu): Promise<void> {
    const docRef = await addDoc(this.itemsMenuCollection, item);
    this.cache.set(docRef.id, { id: docRef.id, ...item });
  }

  async updateItemMenu(id: string, item: Partial<ItemsMenu>): Promise<void> {
    console.log({ id, item });
    const itemDoc = doc(firestore, "menu", id);
    await updateDoc(itemDoc, item);
    const cachedItem = this.cache.get(id);
    if (cachedItem) {
      this.cache.set(id, { ...cachedItem, ...item });
    }
  }

  async deleteItemMenu(id: string): Promise<void> {
    const itemDoc = doc(firestore, "menu", id);
    await deleteDoc(itemDoc);
    this.cache.delete(id);
  }

  async deleteOrderAndSendToHistory(orderId: string): Promise<void> {
    const orderDocRef = doc(firestore, "orders", orderId);
    const orderSnapshot = await getDoc(orderDocRef);

    if (!orderSnapshot.exists()) {
      throw new Error("Order not found");
    }
    const orderData = orderSnapshot.data() as Order;
    const historyDocRef = doc(firestore, "history", orderId);

    const batch = writeBatch(firestore);
    batch.set(historyDocRef, orderData);
    batch.delete(orderDocRef);
    await batch.commit();
  }

  async uploadMenuToFirebase(menu: MenuCategory) {
    const menuCollection = collection(firestore, "menu");

    for (const [category, items] of Object.entries(menu)) {
      for (const item of items) {
        const itemData: ItemsMenu = {
          category,
          item: item.item,
          description: item.description,
          ...(item.portions
            ? { portions: item.portions }
            : { price: item.price }),
        };

        try {
          await addDoc(menuCollection, itemData);
          console.log(`Uploaded ${item.item} to Firebase`);
        } catch (error) {
          console.error("Error uploading item to Firebase:", error);
        }
      }
    }
  }

  async addNewBranch(branch: NewBranch): Promise<string> {
    const branchCollection = collection(firestore, "branches");
    const docRef = await addDoc(branchCollection, branch);
    return docRef.id;
  }

  async getBranches(): Promise<Branch[]> {
    const branchCollection = collection(firestore, "branches");
    const querySnapshot = await getDocs(branchCollection);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Branch)
    );
  }

  async deleteBranch(branchId: string): Promise<void> {
    const branchDoc = doc(firestore, "branches", branchId);
    await deleteDoc(branchDoc);
  }

  async updateBranch(branch: Branch): Promise<void> {
    const branchDoc = doc(firestore, "branches", branch.id);
    await updateDoc(branchDoc, { ...branch });
  }

  async sendOrder(order: Order): Promise<string> {
    try {
      const docRef = await addDoc(this.ordersCollection, order);
      return docRef.id;
    } catch (error) {
      console.error("Error sending order to Firebase:", error);
      throw error;
    }
  }


  async callToWaiter(orderId: string, isNeedHelp: boolean): Promise<void> {
    const orderDoc = doc(firestore, "orders", orderId);
    await updateDoc(orderDoc, { callWaiter: isNeedHelp });
  }

  
  listenToOrders(sucursal: string, categoryItem: string[], callback: (orders: Order[]) => void): void {
 
    const collect = collection(firestore, sucursal);
    const q = categoryItem.length > 0 ? query(collect, where("categories", "array-contains-any", categoryItem)) : collect;

    onSnapshot(q, (snapshot) => {
      const orders: Order[] = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Order)
      );
      console.log({ orders });
      callback(orders);
    });
  }

  //funciones de incio y registro de usuario
  async logingWithGoogle(): Promise<UserAuth | undefined> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(authFire, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const firebaseUser = result.user;
    if (credential && firebaseUser) {
      const user: UserAuth = {
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || "",
        uid: firebaseUser.uid,
        image: firebaseUser.photoURL || "",
      };
      return user;
    } else {
      console.error("No credential or user found");
      return undefined;
    }
  }
  async authenticateUser(email: string, password: string): Promise<RegisterUser> {
    const usersCollection = collection(firestore, "users");
    const q = query(usersCollection, where("email", "==", email), where("password", "==", password));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error("User not found");
    }
    const userDoc = querySnapshot.docs[0];
    return { ...userDoc.data() } as RegisterUser;
  }
  async logout(): Promise<void> {
    await authFire.signOut();
  }

  async LoginGoogleLogin(): Promise<RegisterUser | undefined> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(authFire, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const firebaseUser = result.user;
    if (credential && firebaseUser) {
      const user = await this.getUserByUid(firebaseUser.uid);
      if (user) {
        return user;
      } else {
        return undefined;
      }

    } else {
      console.error("No credential or user found");
      return undefined;
    }
  }
  async registerUser(user: RegisterUser): Promise<boolean> {
    const usersCollection = collection(firestore, "users");
    await addDoc(usersCollection, user);
    return true;
  }
  async getUserByUid(uid: string): Promise<RegisterUser | undefined> {
    const usersCollection = collection(firestore, "users");
    const q = query(usersCollection, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return undefined;
    }
    const userDoc = querySnapshot.docs[0];
    return { ...userDoc.data() } as RegisterUser;
  }

}
export const fireCrude: FirebaseServiceCrude = new FirebaseServiceCrude();
