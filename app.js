const $=s=>document.querySelector(s);
$('#year').textContent=new Date().getFullYear();
$('#menuToggle').addEventListener('click',()=>$('#mainNav').classList.toggle('open'));
fetch('/api/public').then(r=>r.json()).then(d=>{
 $('#statMembers').textContent=d.stats.members;$('#statNews').textContent=d.stats.activities;$('#statMeetings').textContent=d.stats.meetings;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 $('#publicAnnouncements').innerHTML=d.announcements.length?d.announcements.map(a=>`<article class="news-card"><span class="tag">${esc(a.type)}</span><h3>${esc(a.title)}</h3><p>${esc(a.text)}</p><small>${new Date(a.createdAt).toLocaleDateString('fr-FR')}</small></article>`).join(''):'<div class="empty-card">Les nouvelles annonces apparaîtront ici.</div>';
 $('#publicMeetings').innerHTML=d.meetings.length?d.meetings.map(m=>`<article class="meeting-item"><span>${new Date(m.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'})}</span><div><b>${esc(m.title)}</b><small>${esc(m.place)} · ${new Date(m.date).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</small></div></article>`).join(''):'<p>Aucune réunion annoncée pour le moment.</p>';
}).catch(()=>{});
