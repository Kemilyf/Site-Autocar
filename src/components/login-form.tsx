"use client";
import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { LoaderCircle,LogIn } from "lucide-react";
export function LoginForm() {
  const [email,setEmail]=useState("");const [password,setPassword]=useState("");
  const [error,setError]=useState("");const [loading,setLoading]=useState(false);
  const router=useRouter();
  async function submit(e:FormEvent) {
    e.preventDefault();setError("");setLoading(true);
    try {
      const supabase=createSupabaseBrowserClient();
      const {error}=await supabase.auth.signInWithPassword({email,password});
      if(error) throw error;
      router.replace("/admin");router.refresh();
    } catch(e) {setError(e instanceof Error?e.message:"Não foi possível iniciar sessão.");}
    finally {setLoading(false);}
  }
  return <form className="auth-form" onSubmit={submit}>
    <label>E-mail<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required/></label>
    <label>Palavra-passe<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>
    {error&&<p className="form-error">{error}</p>}
    <button className="button button-full" disabled={loading}>{loading?<LoaderCircle className="spin"/>:<LogIn size={17}/>} Entrar</button>
  </form>;
}