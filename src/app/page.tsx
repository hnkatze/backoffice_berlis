"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Coffee, Lock, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Login() {
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setError('')

    try {
      const respuesta = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name:nombreUsuario, password:contrasena }),
      })

      if (respuesta.ok) {
        router.push('/dashboard')
      } else {
        const datos = await respuesta.json()
        setError(datos.mensaje || 'Ocurrió un error durante el inicio de sesión.')
      }
    } catch {
      setError('Ocurrió un error inesperado. Por favor, intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-rose-100 to-teal-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md bg-slate-300 text-black ">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center justify-center">
              <Coffee className="mr-2 h-6 w-6" />
              Backoffice Café Berlin
            </CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder al backoffice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={manejarEnvio}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreUsuario">Nombre de Usuario</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="nombreUsuario"
                      type="text"
                      placeholder="Ingresa tu nombre de usuario"
                      value={nombreUsuario}
                      onChange={(e) => setNombreUsuario(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contrasena">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="contrasena"
                      type="password"
                      placeholder="Ingresa tu contraseña"
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full mt-6 bg-green-400 hover:bg-blue-600 hover:text-white"  disabled={cargando}>
                {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              ¿Olvidaste tu contraseña? Contacta al administrador.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}