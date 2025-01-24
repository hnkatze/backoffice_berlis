"use client";

import React, { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Branch {
  id: string;
  name: string;
}

interface QRCode {
  id: string;
  branchId: string;
  tableNumber: string;
  url: string;
}

interface QRCodeGeneratorProps {
  branches: Branch[];
}

export default function QRCodeGenerator({
  branches,
}: Readonly<QRCodeGeneratorProps>) {
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [tableNumber, setTableNumber] = useState<string>("");
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [filteredBranch, setFilteredBranch] = useState<string>("");
  const qrRef = useRef<HTMLDivElement>(null);

  const handleGenerateQRCode = () => {
    if (!selectedBranch || !tableNumber) {

      return;
    }

    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/${selectedBranch}+${tableNumber}`;
    const newQRCode: QRCode = {
      id: Date.now().toString(),
      branchId: selectedBranch,
      tableNumber,
      url,
    };

    setQRCodes([...qrCodes, newQRCode]);
    downloadQRCode(url, `${selectedBranch}_mesa_${tableNumber}`);

    // Reset form
    setSelectedBranch("");
    setTableNumber("");
  };

  const downloadQRCode = (url: string, fileName: string) => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector("canvas");
      if (canvas) {
        const imageUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = `${fileName}.png`;
        link.click();
      }
    }
  };

  const filteredQRCodes = qrCodes.filter((qr) =>
    filteredBranch && filteredBranch !== "all"
      ? qr.branchId === filteredBranch
      : true
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generador de Códigos QR</CardTitle>
        <CardDescription>
          Genera códigos QR para las mesas de cada sucursal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerateQRCode();
          }}
          className='space-y-4 mb-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='branch'>Sucursal</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder='Selecciona una sucursal' />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='tableNumber'>Número de Mesa</Label>
              <Input
                id='tableNumber'
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder='Ej: 1, 2, 3...'
              />
            </div>
          </div>
          <Button type='submit'>Generar y Descargar QR</Button>
        </form>

        <div className='space-y-4'>
          <div>
            <Label htmlFor='filterBranch'>Filtrar por Sucursal</Label>
            <Select value={filteredBranch} onValueChange={setFilteredBranch}>
              <SelectTrigger>
                <SelectValue placeholder='Todas las sucursales' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todas las sucursales</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sucursal</TableHead>
                <TableHead>Mesa</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQRCodes.map((qr) => (
                <TableRow key={qr.id}>
                  <TableCell>
                    {branches.find((b) => b.id === qr.branchId)?.name}
                  </TableCell>
                  <TableCell>{qr.tableNumber}</TableCell>
                  <TableCell>
                    <Button
                      variant='outline'
                      onClick={() =>
                        downloadQRCode(
                          qr.url,
                          `${qr.branchId}_mesa_${qr.tableNumber}`
                        )
                      }>
                      Descargar QR
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <div ref={qrRef} style={{ display: "none" }}>
        <QRCodeCanvas
          value={`${process.env.NEXT_PUBLIC_BASE_URL}/${selectedBranch}+${tableNumber}`}
          size={256}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"H"}
          imageSettings={{
            src: "/assets/coffee-cup.png",
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
      </div>
    </Card>
  );
}
