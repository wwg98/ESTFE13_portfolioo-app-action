"use client";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const supabase = createClient();
  const router = useRouter();

  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
  });

  const handleAuthChange = (e) => {
    const { name, value } = e.target;

    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  // 로그인 진행
  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword(authForm);
    if (error) {
      alert("로그인 실패: ", error.message);
    } else {
      alert("로그인 성공");
      router.push("/");
      router.refresh();
    }
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error("로그인 실패", error.message);
    }
  };

  const signInWithKakao = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error("로그인 실패", error.message);
    }
  };

  return (
    <div className="about_content shadow">
      <h2>로그인</h2>
      <div className="contact_form">
        <form onSubmit={handleLogin}>
          <p className="field">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="email"
              required
              value={authForm.email}
              onChange={handleAuthChange}
            />
          </p>
          <p className="field">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="비밀번호"
              required
              value={authForm.password}
              onChange={handleAuthChange}
            />
          </p>
          <p className="submit">
            <input type="submit" className="primary-btn" value="로그인" />
          </p>
        </form>
      </div>
      <hr />
      <button onClick={signInWithGoogle}>구글 로그인</button>
      <button onClick={signInWithKakao}>카카오 로그인</button>
    </div>
  );
}
