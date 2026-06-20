// PERSISTENT STAFF ACCOUNTS DATABASE (15 accounts across the 3 core ranks)
let savedDatabase = JSON.parse(localStorage.getItem('staff_database'));
let userDatabase = savedDatabase && Array.isArray(savedDatabase) ? savedDatabase : [
    { username: "Admin", password: "2312daiw@(#&H", rank: "Foundership+" },
    { username: "Calvin2014c", password: "nR403^@#", rank: "Foundership+" },
    { username: "Frustrated_Ninja", password: "Password123", rank: "Foundership+" },
    { username: "Josh", password: "Joshcandy0321", rank: "Foundership+" },
    { username: "Admin2", password: "Password123", rank: "Foundership+" },
    { username: "Bloodyboy0025", password: "80106535", rank: "Admin+" },
    { username: "Boom_amir", password: "308623407642", rank: "Moderation" },
    { username: "TrialMod", password: "TrialTestingModerationTesting:D", rank: "Moderation" },
    { username: "wfkdawfokajdoe", password: "Password123", rank: "Moderation" },
    { username: "q902ie9qdi", password: "Password123", rank: "Moderation" },
    { username: "iu0qhw2yed9hkalmcs'f", password: "Password123", rank: "Moderation" },
    { username: "IQ028EIQWPp[lJwfdojfmFKIUEJ", password: "Password123", rank: "Moderation" },
    { username: "widuw8yeudi2j", password: "Password123", rank: "Moderation" },
    { username: "2iud8uhnskj", password: "Password123", rank: "Moderation" },
    { username: "qi3ufd0iqjc", password: "qipwfjh0wif", rank: "Moderation" }
];

// SHIFT TRACKING GLOBAL RUNTIMES
let shiftStartTime = null;

window.addEventListener('DOMContentLoaded', function() {
    
    // --- AUTOLOGIN SESSION CHECKER ---
    const activeSession = JSON.parse(localStorage.getItem('active_staff_session'));
    if (activeSession) {
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
            // Guard clause: stop logout if they are actively clocked into a shift
            if (shiftStartTime) {
                alert("⚠️ Please clock out of your active shift before logging out of the command console!");
                return;
            }
            localStorage.removeItem('active_staff_session'); 
            location.reload(); 
        });
    }

    // WORKSPACE DISPLAY GENERATION ENGINE
    function launchMainWorkspace(userProfile) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainSystem').style.display = 'block';
        
        document.getElementById('activeUserDisplay').innerText = userProfile.username;
        document.getElementById('activeRankDisplay').innerText = userProfile.rank;

        applyPermissions(userProfile.rank);
    }

    // =========================================================================
    // --- HANDLER 1: SUBMIT COMPONENT INFRACTION FORM (Pushes to Discord) ---
    // =========================================================================
    const incidentForm = document.getElementById('incidentForm');
    if (incidentForm) {
        incidentForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const action = document.getElementById('action').value;
            const reason = document.getElementById('reason').value;
            const notes = document.getElementById('notes').value || 'No attachments.';
            
            const activeSession = JSON.parse(localStorage.getItem('active_staff_session'));
            const staffExecutor = activeSession ? activeSession.username : 'Unknown Staff';
            const staffRank = activeSession ? activeSession.rank : 'N/A';

            const incidentPayload = {
                embeds: [{
                    title: `🚨 New Infraction Logged`,
                    color: 16724534, // Red side border stripe
                    fields: [
                        { name: "👤 Player Username", value: username, inline: true },
                        { name: "🔨 Action Taken", value: `**${action}**`, inline: true },
                        { name: "📜 Rule Violated", value: reason, inline: false },
                        { name: "📝 Notes / Proof", value: notes, inline: false },
                        { name: "🛠️ Logged By", value: `${staffExecutor} (${staffRank})`, inline: true }
                    ],
                    timestamp: new Date().toISOString()
                }]
            };

            // ⚠️ PASTE YOUR URL
            const infractionWebhookUrl = "https://discord.com/api/webhooks/1518034185351200950/PL0NSWZwaAY-WgVkVNtN1BXijbdzX20SDFguq0-M4-13RWXIiAk8i39m8Uco6sNM0pAY";

            fetch(infractionWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(incidentPayload)
            })
            .then(response => {
                if (response.ok) {
                    alert(`✅ Log for ${username} successfully saved to the cloud database!`);
                    incidentForm.reset();
                } else {
                    alert("❌ Cloud connection failed. Check your Webhook configurations.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("❌ Network connection lost. Log was dropped.");
            });
        });
    }

    // =========================================================================
    // --- HANDLER 2: STAFF SHIFT TRACKING LAYER (Pushes to Discord) ---
    // =========================================================================
    const btnStartShift = document.getElementById('btnStartShift');
    const btnEndShift = document.getElementById('btnEndShift');
    const shiftStatusDisplay = document.getElementById('shiftStatusDisplay');

    if (btnStartShift) {
        btnStartShift.addEventListener('click', function() {
            shiftStartTime = new Date();
            
            btnStartShift.style.display = 'none';
            btnEndShift.style.display = 'block';
            shiftStatusDisplay.innerHTML = `🟢 Status: On Duty (Clocked in at ${shiftStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
            shiftStatusDisplay.style.color = '#2e7d32';
        });
    }

    if (btnEndShift) {
        btnEndShift.addEventListener('click', function() {
            if (!shiftStartTime) return;

            const shiftEndTime = new Date();
            const timeDifferenceMs = shiftEndTime - shiftStartTime;
            const totalMinutes = Math.floor(timeDifferenceMs / 1000 / 60);
            
            const activeSession = JSON.parse(localStorage.getItem('active_staff_session'));
            const staffExecutor = activeSession ? activeSession.username : 'Unknown Staff';
            const staffRank = activeSession ? activeSession.rank : 'N/A';

            // Instantly clear UI states
            btnStartShift.style.display = 'block';
            btnEndShift.style.display = 'none';
            shiftStatusDisplay.innerHTML = `🔴 Status: Off Duty`;
            shiftStatusDisplay.style.color = '';

            const shiftPayload = {
                embeds: [{
                    title: `⏱️ Staff Shift Logged`,
                    color: 3066993, // Green side border stripe
                    fields: [
                        { name: "🛠️ Staff Member", value: `**${staffExecutor}**`, inline: true },
                        { name: "📋 Current Rank", value: staffRank, inline: true },
                        { name: "⏳ Total Duration", value: `${totalMinutes} Minute(s)`, inline: false },
                        { name: "🛫 Started At", value: shiftStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), inline: true },
                        { name: "🛬 Ended At", value: shiftEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), inline: true }
                    ],
                    timestamp: new Date().toISOString()
                }]
            };

            // ⚠️ PASTE YOUR SHIFT LOGGING WEBHOOK URL HERE ⚠️
            const shiftWebhookUrl = "https://discord.com/api/webhooks/1518034604525752381/OW_ytWMrFwRJMNzGfbswR-c3qbJSZ8iS4vBUIDmW9tghi5XAp2caIElYXZdkxGJ1o5Tu";

            fetch(shiftWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shiftPayload)
            })
            .then(response => {
                if (response.ok) {
                    alert(`✅ Your shift has been uploaded! Total duration recorded: ${totalMinutes} minute(s).`);
                } else {
                    alert("❌ Shift data calculated, but cloud webhook transaction failed.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("❌ Connection timed out. Could not reach cloud relays.");
            });

            // Wipe temporary memory tracking variable
            shiftStartTime = null;
        });
    }

    // --- ACCIDENT CONTROL: BLOCKS TAB CLOSURES DURING ACTIVE SHIFTS ---
    window.addEventListener('beforeunload', function(e) {
        if (shiftStartTime) {
            e.preventDefault();
            e.returnValue = 'You are currently clocked in! Please clock out before closing the panel.';
        }
    });
});

// --- DYNAMIC PERMISSIONS RULE HANDLER ---
function applyPermissions(rank) {
    const optAdminBan = document.getElementById('optAdminBan');
    if (!optAdminBan) return;

    if (rank === "Foundership+" || rank === "Admin+") {
        optAdminBan.style.display = 'block';
    } else {
        optAdminBan.style.display = 'none';
    }
}
