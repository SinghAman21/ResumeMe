import { Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/use-theme"

export default function ModeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Toggle theme to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="relative overflow-hidden border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]  transition-all hover:bg-[var(--secondary)] hover:text-[var(--secondary-foreground)] cursor-pointer"
    >
      <motion.div
        initial={false}
        animate={{ 
          scale: [0.8, 1.1, 1]
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10"
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5 text-yellow-500" />
        ) : (
          <Moon className="h-5 w-5 text-blue-500" />
        )}
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
