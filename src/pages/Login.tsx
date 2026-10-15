import React, { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LogIn, Mail, Lock, AlertCircle, Loader2, ArrowRight } from "lucide-react"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginSchema, type LoginInput } from "@/lib/validators"
import { useAuth } from "@/contexts/AuthContext"

export default function Login() {
  const { signIn, isConfigured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from = (location.state as any)?.from?.pathname || "/dashboard"

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginInput) => {
    setErrorMsg(null)
    setIsSubmitting(true)
    try {
      const { error } = await signIn(data.email, data.password)
      if (error) {
        setErrorMsg(error.message || "Failed to sign in. Please verify your credentials.")
      } else {
        navigate(from, { replace: true })
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred during sign in.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="साधना में पुनः स्वागत है"
      subtitle="Sign in to your private Radha Naam sadhana portal"
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {!isConfigured && (
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs">
            <span className="font-semibold block mb-0.5">Note on Supabase Configuration</span>
            Supabase credentials are not connected yet. You can explore public features or connect your project in <code className="bg-background/80 px-1 rounded">.env</code>.
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="devotee@radha.org"
                className="pl-10"
                autoComplete="email"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-xs text-devotional-indigo dark:text-devotional-lavender hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                autoComplete="current-password"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-gradient-to-r from-devotional-indigo to-indigo-600 hover:from-devotional-indigo hover:to-indigo-500 font-semibold gap-2 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Enter Your Sadhana</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            Don't have a personal account yet?{" "}
            <Link
              to="/register"
              className="font-semibold text-devotional-indigo dark:text-devotional-lavender hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
