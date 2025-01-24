"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PlusCircle,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { categoryIcons } from "./funtions-auxiliars";
import { fireCrude } from "@/lib/crude.firebase";

export default function InventoryManagement({
  inventoryFirebase,
}: {
  readonly inventoryFirebase: MenuItem[];
}) {
  const [inventory, setInventory] = useState<MenuItem[]>(inventoryFirebase);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({});
  const [portions, setPortions] = useState<Portion[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [sortColumn, setSortColumn] = useState<keyof MenuItem>("item");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  const filterItems = () => {
    if (search.trim() === "") {
      setInventory(inventoryFirebase);
    } else {
      setInventory(
        inventoryFirebase.filter(
          (item) =>
            item.item.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase()) ||
            item.category?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  };

  const clearFilters = () => {
    setSearch("");
    setInventory(inventoryFirebase);
  };

  const handlePortionChange = (
    index: number,
    field: keyof Portion,
    value: string
  ) => {
    const updatedPortions = portions.map((p, i) =>
      i === index
        ? { ...p, [field]: field === "price" ? parseFloat(value) : value }
        : p
    );
    setPortions(updatedPortions);
  };

  const handlerSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
      category: value,
    }));
  };

  const addPortion = () => {
    setPortions([...portions, { size: "", price: 0 }]);
  };

  const removePortion = (index: number) => {
    setPortions(portions.filter((_, i) => i !== index));
  };

  const addItem = async () => {
    if (newItem.item && newItem.description) {
      const itemToAdd: ItemsMenu = {
        category: newItem.category ?? "",
        item: newItem.item,
        description: newItem.description,
        ...(portions.length > 0 ? { portions } : { price: newItem.price }),
      };
      await fireCrude.addItemMenu(itemToAdd);
      setInventory((prev) => [...prev, itemToAdd]);
      setNewItem({});
      setPortions([]);
      toast("Item agregado correctamente");
    }
  };

  const updateItem = async (id: string) => {
    if (newItem.item && newItem.description && editingId !== null) {
      const itemToUpdate: ItemsMenu = {
        category: newItem.category ?? "",
        id: id,
        item: newItem.item,
        description: newItem.description,
        ...(portions.length > 0 ? { portions } : { price: newItem.price }),
      };
      await fireCrude.updateItemMenu(id, itemToUpdate);
      setInventory((prev) =>
        prev.map((item) => (item.id === editingId ? itemToUpdate : item))
      );
      setNewItem({});
      setPortions([]);
      setEditingId(null);
      toast("Item actualizado correctamente");
    }
  };

  const editItem = (item: MenuItem) => {
    setNewItem(item);
    setPortions(item.portions || []);
    setEditingId(item.id ?? null);
  };

  const deleteItem = async (id: string) => {
    await fireCrude.deleteItemMenu(id);
    setInventory(inventory.filter((item) => item.id !== id.toString()));
  };

  const sortedInventory = [...inventory].sort((a, b) => {
    const aValue = a[sortColumn] ?? "";
    const bValue = b[sortColumn] ?? "";
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedInventory.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className='container mx-auto p-4'>
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Inventario</CardTitle>
          <CardDescription>Agregar o editar items del menú</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingId) {
                updateItem(editingId);
              } else {
                addItem();
              }
            }}
            className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='category'>Categoría</Label>
                <select
                  id='category'
                  name='category'
                  value={newItem.category ?? ""}
                  onChange={handlerSelectChange}
                  required
                  className='w-full p-2 border rounded'>
                  <option value='' disabled>
                    Selecciona una categoría
                  </option>
                  {Object.keys(categoryIcons).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='item'>Nombre del Item</Label>
                <Input
                  id='item'
                  name='item'
                  value={newItem.item ?? ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='description'>Descripción</Label>
                <Input
                  id='description'
                  name='description'
                  value={newItem.description ?? ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            {portions.length === 0 && (
              <div className='space-y-2'>
                <Label htmlFor='price'>Precio (L)</Label>
                <Input
                  id='price'
                  name='price'
                  type='number'
                  value={newItem.price ?? ""}
                  onChange={handleInputChange}
                />
              </div>
            )}
            {portions.map((portion, index) => (
              <div
                key={`${portion.size}-${index}`}
                className='grid grid-cols-3 gap-2 items-end'>
                <div>
                  <Label htmlFor={`size-${index}`}>Tamaño</Label>
                  <Input
                    id={`size-${index}`}
                    value={portion.size}
                    onChange={(e) =>
                      handlePortionChange(index, "size", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`price-${index}`}>Precio (L)</Label>
                  <Input
                    id={`price-${index}`}
                    type='number'
                    value={portion.price}
                    onChange={(e) =>
                      handlePortionChange(index, "price", e.target.value)
                    }
                    required
                  />
                </div>
                <Button
                  type='button'
                  variant='destructive'
                  onClick={() => removePortion(index)}>
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            ))}
            <div className='flex justify-between'>
              <Button
                type='button'
                variant='outline'
                onClick={addPortion}
                disabled={newItem.price !== undefined}>
                <PlusCircle className='h-4 w-4 mr-2' />
                Agregar Porción
              </Button>
              <Button type='submit'>
                {editingId ? "Actualizar Item" : "Agregar Item"}
              </Button>
            </div>
          </form>

          <div className='space-y-2 w-11/12 mt-5'>
            <Label htmlFor='search' className='text-xl '>
              Filtrar
            </Label>
            <Input
              id='search'
              name='search'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                filterItems();
              }}
              required
            />
            <Button
              variant='outline'
              onClick={clearFilters}
              disabled={search.trim() === ""}>
              Limpiar Filtros
            </Button>
          </div>

          <div className='flex justify-between items-center my-4'>
            <div className='flex items-center space-x-2'>
              <Label htmlFor='itemsPerPage'>Items por página:</Label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(parseInt(value));
                  setCurrentPage(1);
                }}>
                <SelectTrigger className='w-[100px]'>
                  <SelectValue placeholder='Seleccionar' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='15'>15</SelectItem>
                  <SelectItem value='25'>25</SelectItem>
                  <SelectItem value='35'>35</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-center space-x-2'>
              <Label>Ordenar por:</Label>
              <RadioGroup
                value={sortColumn}
                onValueChange={(value) =>
                  setSortColumn(value as keyof MenuItem)
                }
                className='flex space-x-2'>
                <div className='flex items-center space-x-1'>
                  <RadioGroupItem value='item' id='sort-item' />
                  <Label htmlFor='sort-item'>Item</Label>
                </div>
                <div className='flex items-center space-x-1'>
                  <RadioGroupItem value='price' id='sort-price' />
                  <Label htmlFor='sort-price'>Precio</Label>
                </div>
              </RadioGroup>
            </div>
            <div className='flex items-center space-x-2'>
              <Label>Orden:</Label>
              <RadioGroup
                value={sortOrder}
                onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
                className='flex space-x-2'>
                <div className='flex items-center space-x-1'>
                  <RadioGroupItem value='asc' id='sort-asc' />
                  <Label htmlFor='sort-asc'>Ascendente</Label>
                </div>
                <div className='flex items-center space-x-1'>
                  <RadioGroupItem value='desc' id='sort-desc' />
                  <Label htmlFor='sort-desc'>Descendente</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Table className='mt-8'>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Precio / Porciones</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.item}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    {item.price
                      ? `${item.price}L`
                      : item.portions
                          ?.map((p) => `${p.size}: ${p.price}L`)
                          .join(", ")}
                  </TableCell>
                  <TableCell>
                    <div className='flex space-x-2'>
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() => editItem(item)}>
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='destructive'
                        size='icon'
                        onClick={() => deleteItem(item.id ?? "")}>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className='flex justify-between items-center mt-4'>
            <Button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}>
              <ChevronLeft className='h-4 w-4 mr-2' />
              Anterior
            </Button>
            <span>
              Página {currentPage} de{" "}
              {Math.ceil(inventory.length / itemsPerPage)}
            </span>
            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={
                currentPage === Math.ceil(inventory.length / itemsPerPage)
              }>
              Siguiente
              <ChevronRight className='h-4 w-4 ml-2' />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
