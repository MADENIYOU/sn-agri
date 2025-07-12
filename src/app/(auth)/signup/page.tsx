
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const signupSchema = z.object({
  fullName: z.string().min(1, { message: 'Le nom complet est requis.' }),
  email: z.string().email({ message: 'Veuillez entrer une adresse email valide.' }),
  password: z.string().min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères.' }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    const error = await signup(data.email, data.password, data.fullName);

    if (error) {
       toast({
        variant: 'destructive',
        title: "Erreur lors de l'inscription",
        description: error.message || 'Une erreur est survenue. Veuillez réessayer.',
      });
      setLoading(false);
    } else {
      toast({
        title: 'Compte créé avec succès !',
        description: 'Veuillez vérifier votre email pour confirmer votre compte.',
      });
      router.push('/login');
      // No automatic redirect, user must confirm email
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Créer un compte</CardTitle>
        <CardDescription>
          Entrez vos informations pour créer un compte et rejoindre la communauté.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
             <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="full-name">Nom complet</Label>
                  <FormControl>
                    <Input id="full-name" placeholder="Moussa Faye" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="email">Email</Label>
                  <FormControl>
                    <Input id="email" type="email" placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="password">Mot de passe</Label>
                  <FormControl>
                    <Input id="password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer un compte
            </Button>
          </CardContent>
        </form>
      </Form>
      <CardFooter className="text-sm">
        <p>
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="underline">
            Se connecter
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

    