const $ = s => document.querySelector(s);

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[c]));

// ========================================
// CONFIGURATION DU BACKEND DO7U
// ========================================

const API_URL = 'https://onedo7u-backen-1.onrender.com';

// ========================================
// FONCTION API
// ========================================

async function api(path, opt = {}) {

    const r = await fetch(`${API_URL}${path}`, {
        ...opt,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(opt.headers || {})
        }
    });

    const d = await r.json().catch(() => ({}));

    if (!r.ok) {
        throw Error(d.error || 'Erreur serveur');
    }

    return d;
}

// ========================================
// OUTILS
// ========================================

const fd = f => Object.fromEntries(new FormData(f).entries());

function toast(t) {
    const e = $('#memberToast');
    e.textContent = t;
    e.classList.add('show');

    setTimeout(() => e.classList.remove('show'), 3000);
}

function date(v) {
    return new Date(v).toLocaleString('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}

// ========================================
// CHARGEMENT DE L'ESPACE MEMBRE
// ========================================

async function load() {

    const d = await api('/api/member/me');

    $('#memberLogin').classList.add('hidden');
    $('#memberDashboard').classList.remove('hidden');

    $('#memberName').textContent = d.member.name;

    // ====================================
    // ANNONCES
    // ====================================

    $('#memberAnnouncements').innerHTML = d.announcements.length
        ? d.announcements.map(a => `
            <article class="surface-card">

                <span class="tag">${esc(a.type)}</span>

                <h3>${esc(a.title)}</h3>

                <p>${esc(a.text)}</p>

                <small>${date(a.createdAt)}</small>

                <div class="post-actions">

                    <button
                        data-react="${a.id}"
                        class="${a.likedByMe ? 'is-liked' : ''}"
                    >
                        ♥ ${a.reactionCount} J’aime
                    </button>

                </div>

                <div class="comments">

                    ${a.comments.map(c => `
                        <p>
                            <b>${esc(c.memberName)}</b> :
                            ${esc(c.text)}
                        </p>
                    `).join('')}

                    <form data-comment="${a.id}" class="inline-form">

                        <input
                            name="text"
                            required
                            placeholder="Ajouter un commentaire"
                        >

                        <button>Envoyer</button>

                    </form>

                </div>

            </article>
        `).join('')
        : '<p class="empty-state">Aucune annonce pour le moment.</p>';

    // ====================================
    // DISCUSSIONS
    // ====================================

    $('#memberDiscussions').innerHTML = d.discussions.map(x => `
        <article class="surface-card">

            <b>${esc(x.memberName)}</b>

            <p>${esc(x.text)}</p>

            <small>${date(x.createdAt)}</small>

        </article>
    `).join('') || `
        <p class="empty-state">
            Aucun avis pour le moment. Soyez le premier à participer !
        </p>
    `;

    // ====================================
    // RÉUNIONS
    // ====================================

    $('#memberMeetings').innerHTML = d.meetings.map(m => {

        const a = d.attendance.find(x => x.meetingId === m.id);

        return `
            <article class="surface-card">

                <span class="tag">RÉUNION</span>

                <h3>${esc(m.title)}</h3>

                <p>
                    <b>Date :</b> ${esc(m.date)}
                    <br>
                    <b>Lieu :</b> ${esc(m.place)}
                </p>

                <p>${esc(m.agenda || '')}</p>

                ${m.minutes ? `
                    <details>
                        <summary>Lire le compte rendu</summary>
                        <p>${esc(m.minutes)}</p>
                    </details>
                ` : ''}

                <form data-attend="${m.id}" class="attendance-form">

                    <label>
                        Ma réponse

                        <select name="status">

                            <option value="maybe"
                                ${a?.status === 'maybe' ? 'selected' : ''}>
                                À confirmer
                            </option>

                            <option value="present"
                                ${a?.status === 'present' ? 'selected' : ''}>
                                Je serai présent(e)
                            </option>

                            <option value="absent"
                                ${a?.status === 'absent' ? 'selected' : ''}>
                                Absent(e)
                            </option>

                        </select>

                    </label>

                    <button>Enregistrer</button>

                </form>

            </article>
        `;

    }).join('') || `
        <p class="empty-state">
            Aucune réunion annoncée.
        </p>
    `;

    // ====================================
    // COTISATIONS
    // ====================================

    $('#memberPayments').innerHTML = d.contributions.length
        ? d.contributions.map(c => `
            <article class="surface-card payment-item">

                <div>

                    <b>${esc(c.month)}</b>

                    <p>
                        ${Number(c.amount).toLocaleString('fr-FR')} BIF
                    </p>

                    <small>
                        Enregistré le ${date(c.paidAt)}
                    </small>

                </div>

                <span class="paid">
                    PAYÉ ✓
                </span>

            </article>
        `).join('')
        : `
            <p class="empty-state">
                Aucun paiement enregistré pour votre compte.
                Si vous avez déjà payé, contactez l’administration.
            </p>
        `;
}

// ========================================
// CONNEXION MEMBRE
// ========================================

$('#memberLoginForm').onsubmit = async e => {

    e.preventDefault();

    try {

        await api('/api/member/login', {
            method: 'POST',
            body: JSON.stringify(fd(e.target))
        });

        $('#memberLoginError').textContent = '';

        await load();

    } catch (x) {

        $('#memberLoginError').textContent = x.message;

    }

};

// ========================================
// DÉCONNEXION MEMBRE
// ========================================

$('#memberLogout').onclick = async () => {

    try {

        await api('/api/member/logout', {
            method: 'POST'
        });

        location.reload();

    } catch (x) {

        toast(x.message);

    }

};

// ========================================
// PUBLICATION D'UN AVIS
// ========================================

$('#discussionForm').onsubmit = async e => {

    e.preventDefault();

    try {

        await api('/api/member/discussions', {
            method: 'POST',
            body: JSON.stringify(fd(e.target))
        });

        e.target.reset();

        await load();

        toast('Votre avis a été publié.');

    } catch (x) {

        toast(x.message);

    }

};

// ========================================
// RÉACTIONS AUX ANNONCES
// ========================================

document.addEventListener('click', async e => {

    const b = e.target.closest('[data-react]');

    if (!b) return;

    try {

        await api(
            '/api/member/announcements/' + b.dataset.react + '/react',
            {
                method: 'POST',
                body: '{}'
            }
        );

        await load();

    } catch (x) {

        toast(x.message);

    }

});

// ========================================
// COMMENTAIRES ET PRÉSENCES
// ========================================

document.addEventListener('submit', async e => {

    // COMMENTAIRES

    const c = e.target.closest('[data-comment]');

    if (c) {

        e.preventDefault();

        try {

            await api(
                '/api/member/announcements/' + c.dataset.comment + '/comments',
                {
                    method: 'POST',
                    body: JSON.stringify(fd(c))
                }
            );

            await load();

            toast('Commentaire envoyé.');

        } catch (x) {

            toast(x.message);

        }

    }

    // PARTICIPATION AUX RÉUNIONS

    const a = e.target.closest('[data-attend]');

    if (a) {

        e.preventDefault();

        try {

            await api(
                '/api/member/meetings/' + a.dataset.attend + '/attendance',
                {
                    method: 'POST',
                    body: JSON.stringify(fd(a))
                }
            );

            toast('Votre réponse est enregistrée.');

        } catch (x) {

            toast(x.message);

        }

    }

});

// ========================================
// INITIALISATION
// ========================================

load().catch(() => {

    $('#memberLogin').classList.remove('hidden');

    $('#memberDashboard').classList.add('hidden');

});