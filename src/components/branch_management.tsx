"use client";

import { useEffect, useState } from "react";
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
import { Edit, Trash2 } from "lucide-react";
import { fireCrude } from "@/lib/crude.firebase";

export function BranchManagement() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [newBranch, setNewBranch] = useState<Omit<NewBranch, "id">>({
    name: "",
    latitude: 0,
    longitude: 0,
    radius: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  
  useEffect(() => {
    const getBranches = async (
    ) => { const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sucursales`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Branch[] = (await response.json()).map((branch: any) => ({
      ...branch,
      id: branch._id,
    }));
    setBranches(data);
    } ;
    getBranches();
  }, []);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBranch((prev) => ({
      ...prev,
      [name]: name === "name" ? value : parseFloat(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingId) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sucursales/${editingId}`,{
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBranch),
      })
      if (!response.ok) {
        return;}else{
      setBranches(
        branches.map((branch) =>
          branch.id === editingId ? { ...newBranch, id: editingId } : branch
        )
      );
      setEditingId(null);
    }
    } else {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sucursales`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBranch),
      })
      const { _id } = await response.json();
      setBranches([...branches, { ...newBranch, id: _id }]);
    }
    setNewBranch({ name: "", latitude: 0, longitude: 0, radius: 0 });
  };

  const editBranch = async (branch: Branch) => {
    setNewBranch(branch);
    setEditingId(branch.id);
  };

  const deleteBranch = async (id: string) => {
    await fireCrude.deleteBranch(id);
    setBranches(branches.filter((branch) => branch.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Sucursales</CardTitle>
        <CardDescription>Agregar o editar sucursales</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4 mb-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Nombre de la Sucursal</Label>
              <Input
                id='name'
                name='name'
                value={newBranch.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='latitude'>Latitud</Label>
              <Input
                id='latitude'
                name='latitude'
                type='number'
                step='any'
                value={newBranch.latitude}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='longitude'>Longitud</Label>
              <Input
                id='longitude'
                name='longitude'
                type='number'
                step='any'
                value={newBranch.longitude}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='radius'>Radio (metros)</Label>
              <Input
                id='radius'
                name='radius'
                type='number'
                value={newBranch.radius}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <Button type='submit'>
            {editingId ? "Actualizar Sucursal" : "Agregar Sucursal"}
          </Button>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Latitud</TableHead>
              <TableHead>Longitud</TableHead>
              <TableHead>Radio (m)</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell>{branch.name}</TableCell>
                <TableCell>{branch.latitude}</TableCell>
                <TableCell>{branch.longitude}</TableCell>
                <TableCell>{branch.radius}</TableCell>
                <TableCell>
                  <div className='flex space-x-2'>
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={() => editBranch(branch)}>
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='destructive'
                      size='icon'
                      onClick={() => deleteBranch(branch.id)}>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
