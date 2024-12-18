'use client';

import { signIn } from 'next-auth/react';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { useSearchParams } from 'next/navigation';

const SigninForm = () => {
  const [email, setEmail] = useState('farrukhxeb@gmail.com');
  const [password, setPassword] = useState('testing1234');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl || '/dashboard',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <input
        className="w-full"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        className="w-full"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <Button variant="default" type="submit" className="max-w-fit">
        Sign In
      </Button>
    </form>
  );
};

export default SigninForm;
