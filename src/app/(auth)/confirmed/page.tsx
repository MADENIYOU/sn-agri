
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ConfirmedPage() {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
        <CardTitle className="text-2xl">Email Confirmé !</CardTitle>
        <CardDescription>
          Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant vous connecter.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href="/login">Aller à la page de connexion</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
