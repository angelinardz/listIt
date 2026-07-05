import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://fyirerhfezxgtxgxuwor.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Wsd0tVztW-NorlIFkJuj0Q_6N3W5ydW";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function requireAuth(onUser){
  const overlay = document.createElement('div');
  overlay.className = 'auth-overlay';
  overlay.innerHTML = `
    <div class="auth-card">
      <h1 class="auth-title">🥕 ListIt</h1>
      <p class="auth-sub">Sign in to your list</p>
      <div class="auth-tabs">
        <button type="button" class="auth-tab active" data-mode="login">Log in</button>
        <button type="button" class="auth-tab" data-mode="signup">Sign up</button>
      </div>
      <form id="authForm">
        <input type="email" id="authEmail" placeholder="Email" required autocomplete="email" />
        <input type="password" id="authPassword" placeholder="Password" required autocomplete="current-password" minlength="6" />
        <button type="submit" class="auth-submit" id="authSubmit">Log in</button>
      </form>
      <div class="auth-error" id="authError"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  let mode = 'login';
  const tabs = overlay.querySelectorAll('.auth-tab');
  const submitBtn = overlay.querySelector('#authSubmit');
  const errorBox = overlay.querySelector('#authError');
  const form = overlay.querySelector('#authForm');
  const emailInput = overlay.querySelector('#authEmail');
  const passwordInput = overlay.querySelector('#authPassword');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      mode = tab.dataset.mode;
      tabs.forEach(t => t.classList.toggle('active', t === tab));
      submitBtn.textContent = mode === 'login' ? 'Log in' : 'Sign up';
      errorBox.textContent = '';
      errorBox.classList.remove('auth-success');
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.textContent = '';
    errorBox.classList.remove('auth-success');
    submitBtn.disabled = true;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const { error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    submitBtn.disabled = false;

    if(error){
      errorBox.textContent = error.message;
      return;
    }

    if(mode === 'signup'){
      errorBox.classList.add('auth-success');
      errorBox.textContent = 'Account created. If email confirmation is on, check your inbox, then log in.';
    }
  });

  let started = false;
  supabase.auth.onAuthStateChange((_event, session) => {
    if(session?.user && !started){
      started = true;
      overlay.remove();
      onUser(session.user);
    }
  });
}

export async function logout(){
  await supabase.auth.signOut();
  location.reload();
}
