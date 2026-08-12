"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginStatus() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    })();
  }, [supabase.auth]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {user ? (
        <li>
          <button className="btn btn-primary" onClick={handleLogout}>
            로그아웃
          </button>
        </li>
      ) : (
        <>
          <li>
            <Link href="/login">로그인</Link>
          </li>
          <li>
            <Link href="/register">회원가입</Link>
          </li>
        </>
      )}
    </>
  );
}
