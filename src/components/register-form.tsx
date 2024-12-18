'use client';

import axios from 'axios';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await axios.post('http://localhost:3001/api/auth/register', {
      email,
      password,
    });

    if (response.status === 201) {
      router.push('/auth/login');
    } else {
      console.error('Sign-in error:', response);
    }
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
        Register
      </Button>
    </form>
  );
}

export default RegisterForm;
