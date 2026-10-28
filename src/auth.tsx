import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { Building2, Layers3, LockKeyhole, LogIn, UserPlus, Users } from 'lucide-react';
import { supabase, supabaseConfigured } from './lib/supabase';

export type MarketRole = 'employer' | 'candidate';
export type MarketProfile = {
  id: string;
  display_name: string;
  profile_type: 'client' | 'specialist' | 'both';
  headline: string | null;
  skills: string[];
};
export type MarketAuth = {
  session: Session | null;
  user: User | null;
  profile: MarketProfile | null;
  loading: boolean;
  error: string;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export function useMarketAuth(): MarketAuth {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<MarketProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshProfile = useCallback(async () => {
    if (!supabase || !session?.user) { setProfile(null); return; }
    const { data, error: profileError } = await supabase
      .from('market_profiles')
      .select('id,display_name,profile_type,headline,skills')
      .eq('id', session.user.id)
      .maybeSingle();
    if (profileError) { setError('Не удалось загрузить профиль. Проверьте миграцию базы и политики доступа.'); setProfile(null); return; }
    if (!data) { setError('Профиль ещё не создан. Проверьте SQL-триггер регистрации в Supabase.'); setProfile(null); return; }
    setError('');
    setProfile(data as MarketProfile);
  }, [session]);

  useEffect(() => {
    if (!supabaseConfigured || !supabase) { setLoading(false); return; }
    let alive = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!alive) return;
      if (sessionError) setError('Не удалось проверить сессию. Войдите повторно.');
      setSession(data.session);
      if (!data.session) setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!alive) return;
      setSession(nextSession);
      if (!nextSession) { setProfile(null); setLoading(false); setError(''); }
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session) return;
    let alive = true;
    setLoading(true);
    void (async () => {
      if (!supabase) return;
      const { data, error: profileError } = await supabase
        .from('market_profiles')
        .select('id,display_name,profile_type,headline,skills')
        .eq('id', session.user.id)
        .maybeSingle();
      if (!alive) return;
      if (profileError) setError('Не удалось загрузить профиль. Проверьте миграцию базы и политики доступа.');
      else if (!data) setError('Профиль ещё не создан. Проверьте SQL-триггер регистрации в Supabase.');
      else { setProfile(data as MarketProfile); setError(''); }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [session]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError('Не удалось завершить сеанс. Повторите попытку.');
  }, []);

  return { session, user: session?.user ?? null, profile, loading, error, signOut, refreshProfile };
}

type AuthScreenProps = { message?: string; onAuthChange?: () => void };
export function AuthScreen({ message = '', onAuthChange }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<MarketRole>('employer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(message);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(''); setNotice('');
    if (!supabase) { setError('Supabase не настроен.'); return; }
    if (password.length < 8) { setError('Пароль должен содержать не менее 8 символов.'); return; }
    setBusy(true);
    try {
      if (mode === 'signup') {
        if (!displayName.trim()) { setError('Введите имя или название команды.'); return; }
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: displayName.trim(), profile_type: role === 'employer' ? 'client' : 'specialist' } },
        });
        if (authError) throw authError;
        if (data.session) { setNotice('Аккаунт создан.'); onAuthChange?.(); }
        else setNotice('Проверьте почту и подтвердите адрес, затем войдите в аккаунт.');
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) throw authError;
        onAuthChange?.();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось выполнить запрос. Проверьте данные и повторите.');
    } finally { setBusy(false); }
  }

  return <main className="auth-shell"><section className="auth-card">
    <div className="auth-brand"><div className="brand-mark"><Layers3 size={23}/></div><div><strong>InCORE<span>Market</span></strong><small>WORK. PROVE. GROW.</small></div></div>
    <div className="auth-kicker"><LockKeyhole size={14}/> ЗАЩИЩЁННЫЙ ДОСТУП</div>
    <h1>{mode === 'signin' ? 'Войти в аккаунт' : 'Создать аккаунт'}</h1>
    <p className="auth-intro">У каждого пользователя собственная серверная учётная запись. Доступ к данным ограничивается политиками базы.</p>
    {!supabaseConfigured ? <div className="auth-alert"><strong>Подключение базы не настроено</strong><p>Добавьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в переменные сборки GitHub Actions, затем выполните SQL-миграцию из supabase/migrations.</p><p>Секретный service_role key в браузер и репозиторий добавлять нельзя.</p></div> : <form onSubmit={submit} className="auth-form">
      {mode === 'signup' && <>
        <label>Имя или название команды<input autoComplete="name" value={displayName} onChange={e=>setDisplayName(e.target.value)} required maxLength={120} /></label>
        <fieldset className="auth-role"><legend>Тип аккаунта</legend>
          <button type="button" className={role==='employer'?'auth-role-choice selected':'auth-role-choice'} onClick={()=>setRole('employer')}><Building2 size={18}/><span><strong>Работодатель</strong><small>Публикует задачи и принимает работу</small></span></button>
          <button type="button" className={role==='candidate'?'auth-role-choice selected':'auth-role-choice'} onClick={()=>setRole('candidate')}><Users size={18}/><span><strong>Кандидат / специалист</strong><small>Откликается и выполняет задачи</small></span></button>
        </fieldset>
      </>}
      <label>Электронная почта<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required maxLength={254}/></label>
      <label>Пароль<input type="password" autoComplete={mode==='signin'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} maxLength={128}/><small>Не менее 8 символов</small></label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      {notice && <p className="auth-notice" role="status">{notice}</p>}
      <button className="primary-button auth-submit" type="submit" disabled={busy}>{mode==='signin'?<LogIn size={17}/>:<UserPlus size={17}/>} {busy?'Подождите…':mode==='signin'?'Войти':'Зарегистрироваться'}</button>
      <button className="auth-mode" type="button" onClick={()=>{setMode(mode==='signin'?'signup':'signin');setError('');setNotice('');}}>{mode==='signin'?'Нет аккаунта? Зарегистрироваться':'Уже есть аккаунт? Войти'}</button>
    </form>}
    {message && <p className="auth-notice" role="status">{message}</p>}
    <div className="auth-foot">Идентификация через Supabase Auth · права проверяются на стороне базы</div>
  </section></main>;
}
