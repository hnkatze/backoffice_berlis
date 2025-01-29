"use client"

import { useState, useEffect } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'


interface InventoryItem {
  quantity: number;
  unit: string;
  minimumQuantity: number;
  menuItem: string;
  isActive: boolean;
}

interface Inventory {
  id: string;
  sucursalId: string;
  managerId: string;
  date: Date;
  items: InventoryItem[];
}

export default function Page() {
  const [inventory, setInventory] = useState<Inventory | null>(null)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [sucursales, setSucursales] = useState<BranchesList[]>([])
  const [selectedSucursal, setSelectedSucursal] = useState<string>('')
  const [newItem, setNewItem] = useState<InventoryItem>({
    quantity: 0,
    unit: '',
    minimumQuantity: 2,
    menuItem: '',
    isActive: true
  })

  useEffect(() => {
    fetchMenuItems();
    fetchSucursales();
  }, []);

  useEffect(() => {
    if (selectedSucursal) {
        fetchInventoryItems(selectedSucursal);
      fetchInventory(selectedSucursal);
    }
  }, [selectedSucursal]);

  const fetchSucursales = async () => {
    // sucursales/list
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sucursales/list`)
      const data = await response.json()
      setSucursales(data)
    } catch (error) {
      console.error('Error fetching sucursales:', error)
      toast.error('Error al cargar las sucursales')
    }
}

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu-items`)
      const data = await response.json()
      setMenuItems(data)
    } catch (error) {
      console.error('Error fetching menu items:', error)
      toast.error('Error al cargar los ítems del menú')
    }
  }

  const fetchInventory = async (sucursalId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/${sucursalId}`)
      const data = await response.json()
      if(data){
        console.log(data)
        setInventory(data)
        // setInventoryItems(data.items)
      }
 
    } catch (error) {
      console.error('Error fetching inventory:', error)
      toast.error('Error al cargar el inventario')
    }
  }
  const fetchInventoryItems = async (sucursalId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/${sucursalId}/items`)
      const data = await response.json()
      setInventoryItems(data.items)
    } catch (error) {
      console.error('Error fetching inventory items:', error)
      toast.error('Error al cargar los ítems del inventario')
    }
  }
  const handleAddEmptyInventory = async () => {
    try {
      const emptyInventory = {
        sucursalId: selectedSucursal,
        date: new Date(),
        items: menuItems.map(item => ({
          quantity: 0,
          unit: '',
          minimumQuantity: 2,
          menuItem: item.id,
          isActive: true
        }))
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emptyInventory),
      })
      if (response.ok) {
        toast.success('Inventario vacío creado exitosamente')
        fetchInventory(selectedSucursal)
      } else {
        throw new Error('Error al crear el inventario vacío')
      }
    } catch (error) {
      console.error('Error creating empty inventory:', error)
      toast.error('Error al crear el inventario vacío')
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inventory) return

    try {
      const updatedInventory = {
        ...inventory,
        items: [...inventory.items, newItem]
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/${inventory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedInventory),
      })
      if (response.ok) {
        toast.success('Ítem agregado exitosamente')
        fetchInventory(selectedSucursal)
        setNewItem({
          quantity: 0,
          unit: '',
          minimumQuantity: 2,
          menuItem: '',
          isActive: true
        })
      } else {
        throw new Error('Error al agregar el ítem')
      }
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('Error al agregar el ítem')
    }
  }

  const handleUpdateItem = async (index: number, updatedItem: InventoryItem) => {
    if (!inventory) return

    try {
      const updatedItems = [...inventory.items]
      updatedItems[index] = updatedItem
      const updatedInventory = {
        ...inventory,
        items: updatedItems
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/${inventory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedInventory),
      })
      if (response.ok) {
        toast.success('Ítem actualizado exitosamente')
        fetchInventory(selectedSucursal)
      } else {
        throw new Error('Error al actualizar el ítem')
      }
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error('Error al actualizar el ítem')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Gestión de Inventario</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Seleccionar Sucursal</CardTitle>
          <CardDescription>Elija una sucursal para ver o crear su inventario</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedSucursal}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar sucursal" />
            </SelectTrigger>
            <SelectContent>
              {sucursales.map((sucursal) => (
                <SelectItem key={sucursal.id} value={sucursal.id}>
                  {sucursal.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedSucursal && !inventory && (
            <Button onClick={handleAddEmptyInventory} className="mt-4">
              Crear Inventario Vacío
            </Button>
          )}
        </CardContent>
      </Card>

      {inventory && (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Agregar Nuevo Ítem al Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="menuItem">Ítem del Menú</Label>
                    <Select onValueChange={(value) => setNewItem({...newItem, menuItem: value})} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar ítem" />
                      </SelectTrigger>
                      <SelectContent>
                        {menuItems.map((item) => (
                          <SelectItem key={item.id} value={item.id?.toString() ?? ''}>
                            {item.item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Cantidad</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      value={newItem.quantity} 
                      onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unidad</Label>
                    <Input 
                      id="unit" 
                      value={newItem.unit} 
                      onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimumQuantity">Cantidad Mínima</Label>
                    <Input 
                      id="minimumQuantity" 
                      type="number" 
                      value={newItem.minimumQuantity} 
                      onChange={(e) => setNewItem({...newItem, minimumQuantity: Number(e.target.value)})}
                      required 
                    />
                  </div>
                </div>
                <Button type="submit">Agregar Ítem</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventario Actual</CardTitle>
              <CardDescription>Fecha: {new Date(inventory.date).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ítem</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Cantidad Mínima</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.items && inventory.items.length > 0 ? (
                    inventoryItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{menuItems.find(mi => mi.id === item.menuItem)?.item || 'N/A'}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.minimumQuantity}</TableCell>
                        <TableCell>{item.isActive ? 'Activo' : 'Inactivo'}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              handleUpdateItem(index, {...item, isActive: !item.isActive});
                            }}
                          >
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6}>No hay datos disponibles</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}