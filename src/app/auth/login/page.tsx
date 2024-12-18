import { auth } from '@/auth';
import SigninForm from '@/components/signin-form';
import { redirect } from 'next/navigation';

const SignIn = async () => {
  const session = await auth();

  if (session) {
    return redirect('/dashboard');
  }

  return <SigninForm />;
};

export default SignIn;
