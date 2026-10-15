import React, { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { passwordResetSchema, type PasswordResetFormData } from "@/lib/validators"
import { useAuth } from "@/contexts/AuthContext"

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = async (data: PasswordResetFormData) => {
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsSubmitting(true)
    try {
      const { error } = await resetPassword(data.email)
      if (error) {
        setErrorMsg(error.message || "Failed to send reset link. Please try again.")
      } else {
        setSuccessMsg("Password reset email sent! Please check your inbox for instructions.")
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="पासवर्ड रीसेट करें"
      subtitle="Enter your email to receive a secure recovery link"
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {successMsg && (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-semibold">{successMsg}</p>
              <Link to="/login" className="inline-block mt-2 font-bold underline">
                Return to Login →
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
              <Label htmlFor="email">Your Account Email</Label>
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

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-gradient-to-r from-devotional-indigo to-indigo-600 font-semibold mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <span>Send Password Reset Link</span>
              )}
            </Button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-border/60">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
