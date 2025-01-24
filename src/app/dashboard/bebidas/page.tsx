"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fireCrude } from "@/lib/crude.firebase";
import {  Clock } from "lucide-react";
import { getBadgeVariant, getStatusColor } from "@/lib/utils";


export default function KitchenManagementComponent() {
  const [orders, setOrders] = useState<Order[]>([]);



  useEffect(() => {
    const bebidasCategories = [
        "Cafés",
        "Bebidas",
      ];
    const getOrders = () => {
      fireCrude.listenToOrders("orders", bebidasCategories, (orders: Order[]) => {
        const formattedOrders = orders
          .map((order) => ({
            ...order,
            items: order.items.filter((item) => bebidasCategories.includes(item.category)),
          }))
          .filter((order) => order.items.length > 0);
        setOrders(formattedOrders);
      });
    };
    getOrders();
  }, []);

  return (
    <div className="flex flex-col justify-start items-center w-full pt-10 bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-gray-100">
        Bebidas Solicitadas
      </h1>
      <div className="w-full max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatePresence>
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className={`${getStatusColor(
                    order.status
                  )} border-2 bg-gray-800 text-gray-100`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-3xl">
                        Mesa: {order.table}
                      </CardTitle>
                      <div className="flex flex-row gap-2 justify-center items-center">
                      </div>
                    </div>
                    <CardDescription className="flex items-center text-xl text-gray-300">
                      <Clock className="w-6 h-6 mr-2" />
                      {new Date(order.timestamp).toLocaleTimeString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside text-xl space-y-2">
                      {order.items.map((item, index) => (
                        <li key={index + item.price}>
                          {item.quantity}x {item.name}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center mt-4"></CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
