import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { dateDifference, formatDateString, ordersFromBackend } from "@/lib/utils";

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  useEffect(() => {
    const getOrdersToHistory = async () => {
     await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history`).then((response) => {
        return response.json();
      }).then((data) => {
        setOrders(ordersFromBackend(data));
      });

    };
    getOrdersToHistory();
  }, []);

  const getOrdersByDate = async () => {
    const token =await fetch('/api/token').then(async (response) => {
      const res = await response.json();
      return res.token;
    });
 
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history/date`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({start: `${startDate}`, end: `${endDate}`})
    }).then((response) => {
      return response.json();
    }).then((data) => {
       setOrders(ordersFromBackend(data));
    });
  }


  const totalSum = useMemo(() => {
    return orders.reduce((sum, order) => sum + order.total, 0);
  }, [orders]);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className='container mx-auto p-4'>
      <Card>
        <CardHeader>
          <CardTitle>Historial de Órdenes</CardTitle>
          <CardDescription>
            Visualiza y filtra el historial de órdenes
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <div>
              <Label htmlFor='startDate'>Fecha Inicio</Label>
              <Input
                id='startDate'
                type='date'
                value={startDate.toISOString().split("T")[0]}
                onChange={(e) => setStartDate(new Date(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor='endDate'>Fecha Fin</Label>
              <Input
                id='endDate'
                type='date'
                value={endDate.toISOString().split("T")[0]}
                onChange={(e) => setEndDate(new Date(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor='ordersPerPage'>Órdenes por página</Label>
              <Select
                value={ordersPerPage.toString()}
                onValueChange={(value) => {
                  setOrdersPerPage(parseInt(value));
                  setCurrentPage(1);
                }}>
                <SelectTrigger id='ordersPerPage'>
                  <SelectValue placeholder='Seleccionar cantidad' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='10'>10</SelectItem>
                  <SelectItem value='20'>20</SelectItem>
                  <SelectItem value='50'>50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button onClick={() => {getOrdersByDate()}}>Buscar</Button>
            </div>
          </div>
          {currentOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mesa</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Tiempo de Entrega</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.table}</TableCell>
                    <TableCell>
                      {order.items.map((item, index) => (
                        <div key={index + item.price}>
                          {item.quantity}x {item.name}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>L. {order.total}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{formatDateString(order.timestamp)}</TableCell>
                    <TableCell>
                      {dateDifference(order.timestamp, order.timeDelay ?? "")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <CardContent>
              <p>No hay Ordenes en el Historial</p>
            </CardContent>
          )}
          <div className='mt-4 flex justify-between items-center'>
            <div>
              <p className='text-sm text-gray-600'>
                Mostrando {indexOfFirstOrder + 1} -{" "}
                {Math.min(indexOfLastOrder, orders.length)} de{" "}
                {orders.length} órdenes
              </p>
              <p className='font-bold'>Total: L. {totalSum}</p>
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='icon'
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}>
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <span>{currentPage}</span>
              <Button
                variant='outline'
                size='icon'
                onClick={() => paginate(currentPage + 1)}
                disabled={indexOfLastOrder >= orders.length}>
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
