"use client";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
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

  // 회원가입 진행
  const handleSignUp = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp(authForm);
    if (error) {
      alert("회원가입 실패: ", error.message);
    } else {
      alert("회원가입 성공");
      router.push("/");
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

  return (
    <div className="about_content shadow">
      <h2>회원가입</h2>
      <div className="contact_form">
        <form onSubmit={handleSignUp}>
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
            <input type="submit" className="primary-btn" value="회원가입" />
          </p>
        </form>
        <hr />
        <button onClick={signInWithGoogle}>구글 로그인</button>
      </div>
    </div>
  );
}
