import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowRight } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel?: () => void;
}

export default function AdminLogin({ onLoginSuccess, onCancel }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.admin.login.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await loginMutation.mutateAsync({ username, password });
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || "فشل تسجيل الدخول. تحقق من بيانات الدخول.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-gold/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-gold/40 shadow-2xl shadow-gold/20 bg-background/95 backdrop-blur">
        <CardHeader className="text-center border-b border-gold/20 pb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-4 mx-auto">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold/60"></div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gold to-gold/70 bg-clip-text text-transparent">لوحة تحكم المسؤول</CardTitle>
          <CardDescription className="text-gold/60 mt-2">أدخل بيانات الدخول الخاصة بك</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5 pt-6">
            {error && (
              <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">اسم المستخدم</label>
              <Input
                type="text"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="border-gold/20 focus:border-gold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">كلمة السر</label>
              <Input
                type="password"
                placeholder="أدخل كلمة السر"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="border-gold/20 focus:border-gold"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isLoading || !username || !password}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg shadow-green-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>دخول</span>
                    <span>→</span>
                  </span>
                )}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  onClick={onCancel}
                  className="border-2 border-gold/40 text-gold hover:bg-gold/10 hover:border-gold/60 font-semibold transition-all duration-300"
                >
                  <ArrowRight className="ml-2 h-4 w-4" />
                  رجوع
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
