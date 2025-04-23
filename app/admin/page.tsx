import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';  
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return redirect('/unauthorized');
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Selamat datang, { session.user?.username}!</p>
    </div>
  );
}
