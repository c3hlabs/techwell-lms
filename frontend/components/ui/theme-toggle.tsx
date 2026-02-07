"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const [theme, setTheme] = React.useState<'light' | 'dark'>('light')
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
        // Get initial theme from localStorage or system preference
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const initialTheme = savedTheme || (systemDark ? 'dark' : 'light')
        setTheme(initialTheme)
        document.documentElement.classList.toggle('dark', initialTheme === 'dark')
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)
        document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }

    if (!mounted) {
        return <Button variant="ghost" size="icon" className="h-9 w-9" />
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 transition-transform hover:scale-110"
        >
            {theme === 'light' ? (
                <Moon className="h-4 w-4 transition-all" />
            ) : (
                <Sun className="h-4 w-4 transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
