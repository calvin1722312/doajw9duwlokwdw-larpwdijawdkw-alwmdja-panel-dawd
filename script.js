// PERSISTENT INCIDENT LOGS (Saves logged infractions inside localStorage for the local user)
let localCacheLogs = JSON.parse(localStorage.getItem('staff_incident_logs')) || [];

// =========================================================================
// 🌐 GLOBAL STAFF ACCOUNTS DATABASE (Update this list for your whole team!)
// =========================================================================
let userDatabase = [
    { username: "Admin", password: "2312daiw@(#&H", rank: "Foundership Team" },
    { username: "StaffMember1", password: "Password123!", rank: "Moderation Team" },
    { username: "AdminMember2", password: "SecurePass321!", rank: "Administration Team+" }
];
// =========================================================================

window.addEventListener('DOMContentLoaded', function() {
    
    // --- AUTOLOGIN SESSION CHECKER ---
    const activeSession = JSON.parse(localStorage.getItem('active_staff_session'));
    if (activeSession) {
        // Double check that the cached session user still exists in our global database
        let validUser = userDatabase.find(u => u.username === activeSession.username && u.password === activeSession.password);
        if (validUser) {
            launchMainWorkspace(validUser);
        } else {
            localStorage.removeItem('active_staff_session');
        }
    }

    // --- FORM SUBSCRIPTION LOGIN PROCESS ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const uInput = document.getElementById('loginUser').value;
            const pInput = document.getElementById('loginPass').value;
            const errorBox = document.getElementById('loginError');

            let matchedUser = userDatabase.find(u => u.username === uInput && u.password === pInput);

            if (matchedUser) {
                localStorage.setItem('active_staff_session', JSON.stringify(matchedUser));
                launchMainWorkspace(matchedUser);
            } else {
                errorBox.style.display = 'block';
                document.getElementById('loginPass').value = '';
            }
        });
    }

    // --- LOGOUT ACTION LOGIC ---
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function() {
            localStorage.removeItem('active_staff_session'); 
            document.getElementById('mainSystem').style.display = 'none';
            document.getElementById('loginScreen').style.display = 'flex';
            if(loginForm) loginForm.reset();
        });
    }

    // WORKSPACE DISPLAY GENERATION ENGINE
    function launchMainWorkspace(userProfile) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainSystem').style.display = 'block';
        
        document.getElementById('activeUserDisplay').innerText = userProfile.username;
        document.getElementById('activeRankDisplay').innerText = userProfile.rank;

        applyPermissions(userProfile.rank);
        renderRecentFeed();
    }

    // --- NAVIGATION TAB LAYER HANDLERS ---
    const navConsole = document.getElementById('navConsole');
    const navCenter = document.getElementById('navCenter');
    const navAccounts = document.getElementById('navAccounts');

    const viewConsoleLayer = document.getElementById('viewConsoleLayer');
    const viewCenterLayer = document.getElementById('viewCenterLayer');
    const viewAccountsLayer = document.getElementById('viewAccountsLayer');
    const viewTitle = document.getElementById('viewTitle');

    function clearActiveTabs() {
        if(navConsole) navConsole.classList.remove('active');
        if(navCenter) navCenter.classList.remove('active');
        if(navAccounts) navAccounts.classList.remove('active');
        if(viewConsoleLayer) viewConsoleLayer.classList.remove('active-view');
        if(viewCenterLayer) viewCenterLayer.classList.remove('active-view');
        if(viewAccountsLayer) viewAccountsLayer.classList.remove('active-view');
    }

    if(navConsole) {
        navConsole.addEventListener('click', function() {
            clearActiveTabs();
            navConsole.classList.add('active');
            viewConsoleLayer.classList.add('active-view');
            viewTitle.innerText = "Incident Form";
        });
    }

    if(navCenter) {
        navCenter.addEventListener('click', function() {
            clearActiveTabs();
            navCenter.classList.add('active');
            viewCenterLayer.classList.add('active-view');
            viewTitle.innerText = "Search Log Center";
            renderLogCenterTable(localCacheLogs);
        });
    }

    if(navAccounts) {
        navAccounts.addEventListener('click', function() {
            clearActiveTabs();
            navAccounts.classList.add('active');
            viewAccountsLayer.classList.add('active-view');
            viewTitle.innerText = "System Accounts Roster";
        });
    }

    // --- SUBMIT COMPONENT INFRACTION FORM ---
    const incidentForm = document.getElementById('incidentForm');
    if (incidentForm) {
        incidentForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const action = document.getElementById('action').value;
            const reason = document.getElementById('reason').value;
            const notes = document.getElementById('notes').value;
            const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            localCacheLogs.push({ username: username, action: action, reason: reason, notes: notes, time: timeString });
            localStorage.setItem('staff_incident_logs', JSON.stringify(localCacheLogs));

            incidentForm.reset();
            renderRecentFeed();
        });
    }

    // --- REAL-TIME DATA FILTER INPUT ---
    const searchInput = document.getElementById('logSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase().trim();
            const filtered = localCacheLogs.filter(function(log) {
                return log.username.toLowerCase().includes(query);
            });
            renderLogCenterTable(filtered);
        });
    }
});

// --- DYNAMIC PERMISSIONS RULE HANDLER ---
function applyPermissions(rank) {
    const adminTab = document.getElementById('navAdminOnly');
    const optAdminBan = document.getElementById('optAdminBan');

    if (!adminTab || !optAdminBan) return;

    if (rank === "Foundership Team") {
        adminTab.style.display = 'block';
        optAdminBan.style.display = 'block';
    } else if (rank === "Administration Team+") {
        adminTab.style.display = 'none';
        optAdminBan.style.display = 'block';
    } else {
        adminTab.style.display = 'none';
        optAdminBan.style.display = 'none';
    }
}

// --- RENDER RECENT PANEL STREAM ---
function renderRecentFeed() {
    const container = document.getElementById('recentFeed');
    if (!container) return;
    container.innerHTML = '';
    const quickList = localCacheLogs.slice(-4).reverse();

    if (quickList.length === 0) {
        container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem;">No entries logged yet.</div>';
        return;
    }

    quickList.forEach(function(log) {
        const badgeClass = log.action.toLowerCase().replace(' ', '');
        const item = document.createElement('div');
        item.className = 'record-item';
        item.innerHTML = `
            <div class="record-meta-top">
                <span class="record-target">${log.username}</span>
                <span class="badge badge-${badgeClass}">${log.action}</span>
            </div>
            <div style="font-size: 0.85rem; margin-bottom: 4px;"><strong>Rule:</strong> ${log.reason}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${log.notes || 'No attachments.'}</div>
        `;
        container.appendChild(item);
    });
}

// --- RENDER COMPLETE DATA SEARCH TABLE ---
function renderLogCenterTable(dataset) {
    const tbody = document.getElementById('logCenterTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (dataset.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">No records found.</td></tr>';
        return;
    }

    const invertedDataset = dataset.slice().reverse();
    invertedDataset.forEach(function(log) {
        const badgeClass = log.action.toLowerCase().replace(' ', '');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: 700;">${log.username}</td>
            <td><span class="badge badge-${badgeClass}">${log.action}</span></td>
            <td style="font-size: 0.9rem;">${log.reason}</td>
            <td style="color: var(--text-muted); font-size: 0.85rem;">${log.notes || '—'}</td>
            <td style="color: var(--text-muted); font-size: 0.8rem;">${log.time}</td>
        `;
        tbody.appendChild(tr);
    });
}
