"use client"

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()
    const { register, isAuthenticated } = useAuth()

    const [name, setName] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')
    const [showPassword, setShowPassword] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState('')

    React.useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard')
        }
    }, [isAuthenticated, router])

    const passwordChecks = {
        length: password.length >= 8,
        match: password === confirmPassword && confirmPassword.length > 0,
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!passwordChecks.length) {
            setError('Password must be at least 8 characters')
            return
        }

        if (!passwordChecks.match) {
            setError('Passwords do not match')
            return
        }

        setIsLoading(true)

        try {
            await register(email, password, name)
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background to-primary/5">
            <div className="w-full max-w-md space-y-6">
                <div className="flex justify-center">
                    <Link href="/">
                        <Image src="/logo-light.png" alt="TechWell" width={160} height={48} className="dark:hidden" priority />
                        <Image src="/logo-dark.png" alt="TechWell" width={160} height={48} className="hidden dark:block" priority />
                    </Link>
                </div>
                <Card className="border-muted shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                        <CardDescription>Join TechWell and start your journey</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">
                                    Full Name
                                </label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    {passwordChecks.length ? (
                                        <Check className="h-3 w-3 text-green-500" />
                                    ) : (
                                        <X className="h-3 w-3 text-muted-foreground" />
                                    )}
                                    <span className={passwordChecks.length ? 'text-green-500' : 'text-muted-foreground'}>
                                        At least 8 characters
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium">
                                    Confirm Password
                                </label>
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                                {confirmPassword && (
                                    <div className="flex items-center gap-2 text-xs">
                                        {passwordChecks.match ? (
                                            <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                            <X className="h-3 w-3 text-red-500" />
                                        )}
                                        <span className={passwordChecks.match ? 'text-green-500' : 'text-red-500'}>
                                            {passwordChecks.match ? 'Passwords match' : 'Passwords do not match'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-muted-foreground">Already have an account? </span>
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

