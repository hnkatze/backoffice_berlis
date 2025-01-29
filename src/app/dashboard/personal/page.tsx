"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Employee {
  id: string;
  name: string;
  role: "admin" | "gerent" | "cashier" | "kitchen" | "drinks";
  sucursalId: string;
  password: string;
}

interface Sucursal {
  id: string;
  name: string;
}

export default function Page() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [selectedSucursal, setSelectedSucursal] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    password: "",
    role: "" as Employee["role"],
    sucursalId: "",
  });

  useEffect(() => {
    fetchEmployees();
    fetchSucursales();
  }, []);

  const getNameSucursal = (id: string) => {
    const sucursal = sucursales.find((s) => s.id === id);
    return sucursal?.name || "N/A";
  };

  const fetchEmployees = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/employee/list`
    );
    const jsonData = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Employee[] = jsonData.map((emp: any) => ({
      ...emp,
      id: emp._id,
    }));
    setEmployees(data);
  };

  const fetchSucursales = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/sucursales/list`
    );
    const data: Sucursal[] = await response.json();
    setSucursales(data);
  };
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employee/update/${editingId}`,
        {
          method: "Put",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEmployee),
        }
      );
      if (!response.ok) {
        return;
      } else {
        setEditingId(null);
        setNewEmployee({
          name: "",
          password: "",
          role: "" as Employee["role"],
          sucursalId: "",
        });
        await fetchEmployees();
      }
    } else {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employee/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEmployee),
        }
      );
      if (!response.ok) {
        return;
      } else {
        setNewEmployee({
          name: "",
          password: "",
          role: "" as Employee["role"],
          sucursalId: "",
        });
        await fetchEmployees();
      }
    }
  };
  const onCleanFomr = () => {
    setEditingId(null);
    setNewEmployee({
      name: "",
      password: "",
      role: "" as Employee["role"],
      sucursalId: "",
    });
  }

  const editEmployee = async (id: string) => {
    const employee = employees.find((emp) => emp.id === id);
    if (!employee) return;

    setEditingId(employee.id);
    setSelectedSucursal(employee.sucursalId);

    setNewEmployee({
      name: employee.name,
      password: employee.password,
      role: employee.role,
      sucursalId: employee.sucursalId,
    });
  };
  const filteredEmployees = selectedSucursal
    ? employees.filter((emp) => emp.sucursalId === selectedSucursal)
    : employees;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Gestión de Personal</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Agregar Nuevo Empleado</CardTitle>
          <CardDescription>
            Ingrese los datos del nuevo empleado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={newEmployee.name}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={newEmployee.password}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={newEmployee.role}
                  onValueChange={(value) =>
                    setNewEmployee({
                      ...newEmployee,
                      role: value as Employee["role"],
                    })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="gerent">Gerente</SelectItem>
                    <SelectItem value="cashier">Cajero</SelectItem>
                    <SelectItem value="kitchen">Cocina</SelectItem>
                    <SelectItem value="drinks">Bebidas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sucursal">Sucursal</Label>
                <Select
                  value={newEmployee.sucursalId}
                  onValueChange={(value) =>
                    setNewEmployee({ ...newEmployee, sucursalId: value })
                  }
                  required
                >
                  <SelectTrigger>
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
              </div>
            </div>
            <div className="flex flex-row gap-4">
              <Button type="submit">{editingId ? 'Editar Empleado' : 'Agregar Empleado'}</Button>
              <Button type="button" onClick={onCleanFomr}>Limpiar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Empleados</CardTitle>
          <CardDescription>
            <div className="flex items-center space-x-2">
              <span>Filtrar por sucursal:</span>
              <Select onValueChange={setSelectedSucursal}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todas las sucursales" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las sucursales</SelectItem>
                  {sucursales.map((sucursal) => (
                    <SelectItem key={sucursal.id} value={sucursal.id}>
                      {sucursal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Sucursal</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{getNameSucursal(employee.sucursalId)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editEmployee(employee.id)}
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
