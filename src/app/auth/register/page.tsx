import { auth } from '@/auth';
import RegisterForm from '@/components/register-form';
import { redirect } from 'next/navigation';

const Register = async () => {
  const session = await auth();

  if (session) {
    return redirect('/dashboard');
  }
  return <RegisterForm />;
};

export default Register;
