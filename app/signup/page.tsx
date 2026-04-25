import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "@/components/auth/signup-form";
import { LogoMark } from "@/components/brand/logo";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <LogoMark className="mx-auto h-14 w-14" />
          <CardTitle className="text-2xl">Criar conta</CardTitle>
          <CardDescription>
            Comece a organizar suas finanças agora mesmo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </main>
  );
}
