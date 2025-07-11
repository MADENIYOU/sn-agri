import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Connectez-vous à votre compte</CardTitle>
        <CardDescription>
          Entrez votre email ci-dessous pour accéder à votre tableau de bord.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Mot de passe</Label>
            <Link href="#" className="ml-auto inline-block text-sm underline">
              Mot de passe oublié ?
            </Link>
          </div>
          <Input id="password" type="password" />
        </div>
        <Button type="submit" className="w-full">
          Se connecter
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-sm">
        <p>
          Vous n'avez pas de compte ?{" "}
          <Link href="/signup" className="underline">
            S'inscrire
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
