const key='bracket-theme';
const scheme=matchMedia('(prefers-color-scheme: dark)');
export function getTheme(){let saved;try{saved=localStorage.getItem(key);}catch{}return saved==='light'||saved==='dark'?saved:scheme.matches?'dark':'light';}
export function applyTheme(theme=getTheme()){
 document.documentElement.dataset.theme=theme;
 document.documentElement.style.colorScheme=theme;
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#131720':'#f3f2ec');
 const button=document.querySelector('[data-action="theme"]');
 if(button){button.setAttribute('aria-label',theme==='dark'?'Switch to light mode':'Switch to dark mode');button.title=button.getAttribute('aria-label');button.setAttribute('aria-pressed',String(theme==='dark'));}
 return theme;
}
export function toggleTheme(){const next=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem(key,next);}catch{}return applyTheme(next);}
scheme.addEventListener('change',()=>{let saved;try{saved=localStorage.getItem(key);}catch{}if(!saved)applyTheme();});
applyTheme();
