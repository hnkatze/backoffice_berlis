"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Package, ClipboardList, QrCode, Home } from "lucide-react";
import InventoryManagement from "./inventory";
import OrderHistory from "./historialOrdenes";
import { fireCrude } from "@/lib/crude.firebase";
import { BranchManagement } from "./branch_management";
import QRCodeGenerator from "./qr-code-generator";

export function BackOfficeComponent() {
  const [inventory, setInventory] = useState<MenuItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    async function getIntentory() {
      const invento = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu-items`).then((res) => res.json());
      const branchess = await fireCrude.getBranches();

      setInventory(invento);
      setBranches(branchess);
    }

    getIntentory();
  }, []);

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-3xl font-bold mb-6'>Panel de Administración</h1>
      <Tabs defaultValue='inventory'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='inventory'>
            <Package className='mr-2' />
            Inventario
          </TabsTrigger>
          <TabsTrigger value='orders'>
            <ClipboardList className='mr-2' />
            Historial De Ordenes
          </TabsTrigger>
          <TabsTrigger value='qr'>
            <QrCode className='mr-2' />
            Generar QR
          </TabsTrigger>
          <TabsTrigger value='sucu'>
            <Home className='mr-2' />
            Sucursales
          </TabsTrigger>
        </TabsList>
        <TabsContent value='inventory'>
          {inventory.length > 0 ? (
            <InventoryManagement inventoryFirebase={inventory} />
          ) : (
            <p>Cargando...</p>
          )}
        </TabsContent>
        <TabsContent value='orders'>
          <OrderHistory />
        </TabsContent>
        <TabsContent value='qr'>
          <QRCodeGenerator branches={branches} />
        </TabsContent>
        <TabsContent value='sucu'>
          <Card>
            <CardHeader>
              <CardTitle>Sucursales</CardTitle>
              <CardDescription>Administrar sucursales</CardDescription>
            </CardHeader>
            <CardContent>
              <BranchManagement  />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
