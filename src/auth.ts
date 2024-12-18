import axios from 'axios';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize({ email, password }) {
        try {
          const response = await axios.post<{
            accessToken: string;
            refreshToken: string;
          }>('http://localhost:3001/api/auth/login', {
            email,
            password,
          });

          const userResponse = await axios.get<{
            id: string;
            email: string;
          }>('http://localhost:3001/api/auth/me', {
            headers: {
              Authorization: `Bearer ${response.data.accessToken}`,
            },
          });

          return {
            email: userResponse.data.email,
            id: userResponse.data.id,
            accessToken: response.data.accessToken,
          };
        } catch (error) {
          console.error('Sign-in error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
  pages: {
    signIn: '/auth/login',
    newUser: '/dashboard',
  },
});
