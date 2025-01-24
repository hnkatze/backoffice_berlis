"use client"

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { modulos } from '@/lib/utils'
import { useEffect, useState } from 'react'



export function DashboardComponent() {
  const [formData, setFormData] = useState({
    name: '',
  sucursal: 'Bonito Oriental',})
  useEffect(() => {
    const getUserData = async () => {
      const response = await fetch('/api/auth')
      .then((response) => response.json())
      setFormData({...formData, name: response.name});
    }
    getUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const router = useRouter()

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Bienvenido, {formData.name}</h1>
        <p className="text-xl mb-8 text-gray-600">Sucursal: {formData.sucursal}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modulos.map((modulo, index) => (
            <motion.div
              key={modulo.titulo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 border-slate-400`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    {modulo.titulo}
                  </CardTitle>
                  <div className={`p-2 rounded-full bg-gray-100`}>
                    <modulo.icono className={`h-8 w-8 `} />
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    className={`w-full mt-4 text-black border-amber-300 bg-slate-300 hover:text-white `}
                    onClick={() => router.push(modulo.ruta)}
                  >
                    Acceder
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}