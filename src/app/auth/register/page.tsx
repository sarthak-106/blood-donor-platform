'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RegisterRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  useEffect(() => {
    if (role) {
      router.replace(`/auth?mode=register&role=${encodeURIComponent(role)}`);
    } else {
      router.replace('/auth?mode=register');
    }
  }, [router, role]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-xs text-slate-400">
      Loading registration...
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-xs text-slate-400">Loading registration...</div>}>
      <RegisterRedirect />
    </Suspense>
  );
}
