import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { User, Mail, Lock, AlertCircle, Loader2, CheckCircle2, ArrowRight } from "lucide-react"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerSchema, type RegisterInput } from "@/lib/validators"
import { useAuth } from "@/contexts/AuthContext"

export default function Register() {
  const { signUp, isConfigured } = useAuth()
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      display_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  })

  const onSubmit = async (data: RegisterInput) => {
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsSubmitting(true)
    try {
      const { data: authData, error } = await signUp(data.email, data.password, data.display_name)
      if (error) {
        setErrorMsg(error.message || "Failed to create account. Please try again.")
      } else {
        if (authData?.session) {
          // If session created immediately (auto-confirm turned on in Supabase)
          navigate("/dashboard", { replace: true })
        } else {
          // Email confirmation link sent
          setSuccessMsg(
            "Account registered successfully! Please check your email to verify your address and then log in."
          )
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="साधना यात्रा प्रारंभ करें"
      subtitle="Create your private Radha Naam Jap tracking account"
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {!isConfigured && (
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs">
            <span className="font-semibold block mb-0.5">Note on Supabase Configuration</span>
            Supabase credentials are not connected yet. Add your project credentials in <code className="bg-background/80 px-1 rounded">.env</code> to enable live registration.
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-semibold">{successMsg}</p>
              <Link to="/login" className="inline-block mt-2 font-bold underline">
                Go to Sign In →
              </Link>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Devotee Display Name</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="display_name"
                  type="text"
                  placeholder="e.g. Radhika Das"
                  className="pl-10"
                  {...register("display_name")}
                />
              </div>
              {errors.display_name && (
                <p className="text-xs text-destructive">{errors.display_name.message}</p>
              )}
            </div>

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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
                  className="pl-10"
                  autoComplete="new-password"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="Re-enter password"
                  className="pl-10"
                  autoComplete="new-password"
                  {...register("confirm_password")}
                />
              </div>
              {errors.confirm_password && (
                <p className="text-xs text-destructive">{errors.confirm_password.message}</p>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Register Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-devotional-indigo dark:text-devotional-lavender hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
