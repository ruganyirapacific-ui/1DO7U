const $=s=>document.querySelector(s);
$('#year').textContent=new Date().getFullYear();
$('#menuToggle').addEventListener('click',()=>$('#mainNav').classList.toggle('open'));

const API_URL = 'https://onedo7u-backen.onrender.com';

fetch(API_URL + '/api/public').then(r=>{
 if(!r.ok) throw new Error('Backend '+r.status);
 return r.json();
}).then(d=>{
 $('#statMembers').textContent=d.stats?.members??0;
 $('#statNews').textContent=d.stats?.activities??0;
 $('#statMeetings').textContent=d.stats?.meetings??0;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 $('#publicAnnouncements').innerHTML=d.announcements?.length?
 d.announcements.map(a=>`<article class="news-card"><span class="tag">${esc(a.type)}</span><h3>${esc(a.title)}</h3><p>${esc(a.text)}</p><small>${new Date(a.createdAt).toLocaleDateString('fr-FR')}</small></article>`).join(''):'<div class="empty-card">Aucune annonce pour le moment.</div>';
 $('#publicMeetings').innerHTML=d.meetings?.length?
 d.meetings.map(m=>`<article class="meeting-item"><span>${new Date(m.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'})}</span><div><b>${esc(m.title)}</b><small>${esc(m.place)} · ${new Date(m.date).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</small></div></article>`).join(''):'<p>Aucune réunion annoncée.</p>';
}).catch(e=>{
 console.error(e);
 $('#publicAnnouncements').innerHTML='<div class="empty-card">Backend en démarrage... rafraîchis dans 30s ('+e.message+')</div>';
});