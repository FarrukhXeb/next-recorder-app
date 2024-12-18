'use client';

import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from './ui/button';

type Props = {
  session: Session | null;
};

export default function Navbar({ session }: Props) {
  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="flex gap-2">
      <Link href="/">Home</Link>
      <Link href="/dashboard">Dashboard</Link>
      {session ? (
        <Button onClick={handleLogout}>Logout</Button>
      ) : (
        <Link href="/auth/login">Login</Link>
      )}
      {!session && <Link href="/auth/register">Register</Link>}
    </div>
  );
}
