'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth?mode=login');
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-xs text-slate-400">
      Loading sign in...
    </div>
  );
}
