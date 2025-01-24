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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { fireCrude } from "@/lib/crude.firebase";

import { Bell, Clock } from "lucide-react";
import { getStatusColor, getBadgeVariant } from "@/lib/utils";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";


export function OrderManagementComponent() {
  const [orders, setOrders] = useState<Order[]>([]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    console.log({ orderId, newStatus });
    if (newStatus === "pagado") {
      await fireCrude.updateOrderStatus(orderId, newStatus).then(async () => {
        await fireCrude.deleteOrderAndSendToHistory(orderId);
      });

    } else {
      await fireCrude.updateOrderStatus(orderId, newStatus);
      setOrders(
        orders.map((order) =>
          order.id === String(orderId) ? { ...order, status: newStatus } : order
        )
      );
    }
  };

  useEffect(() => {
    const getOrders = () => {
      fireCrude.listenToOrders("orders",[], (orders) => {
        const formattedOrders = orders
          .map((order) => ({
            ...order,
          }))
          .filter((order) => order.items.length > 0);
        setOrders(formattedOrders);
      });
    };
    getOrders();
  }, []);

  return (
    <div className='flex flex-col justify-center items-center w-full pt-10'>
      <h1 className='text-3xl font-bold mb-6'>Gestión de Órdenes</h1>
      <div className='w-full max-w-7xl px-4'>
        <Card>
          <CardHeader>
            <CardTitle>Órdenes en Curso</CardTitle>
            <CardDescription>Gestionar órdenes actuales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              <AnimatePresence>
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}>
                    <Card className={`${getStatusColor(order.status)} border`}>
                      <CardHeader>
                        <div className='flex justify-between items-center'>
                          <CardTitle>Mesa: {order.table}</CardTitle>
                          <div className=' flex flex-row gap-2 justify-center items-center'>
                            <Badge variant={getBadgeVariant(order.status)}>
                              {order.status}
                            </Badge>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge
                                    onClick={() =>
                                      fireCrude.callToWaiter(
                                        order?.id ?? "",
                                        false
                                      )
                                    }
                                    variant={
                                      order?.callWaiter
                                        ? "destructive"
                                        : "secondary"
                                    }>
                                    <Bell className='w-4 h-4 mr-1' />
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    La mesa {order.table} ha solicitado ayuda.
                                    Si ya has atendido la mesa, presiona aquí.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        <CardDescription className='flex items-center'>
                          <Clock className='w-4 h-4 mr-1' />
                          {new Date(order.timestamp).toLocaleTimeString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className='list-disc list-inside'>
                          {order.items.map((item, index) => (
                            <li key={index + item.price}>
                              {item.quantity}x {item.name}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter className='flex justify-between items-center'>
                        <div className='flex items-center font-bold'>
                          L. {order.total}
                        </div>
                        <Select
                          onValueChange={(value) =>
                            handleStatusChange(
                              order.id!,
                              value as Order["status"]
                            )
                          }>
                          <SelectTrigger className='w-[140px] bg-white font-semibold'>
                            <SelectValue placeholder='Cambiar estado' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='pendiente'>Pendiente</SelectItem>
                            <SelectItem value='en cocina'>En Cocina</SelectItem>
                            <SelectItem value='entregado'>Entregado</SelectItem>

                            <SelectItem value='pagado' disabled={order.status != "entregado"}>Pagado</SelectItem>
                          </SelectContent>
                        </Select>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
