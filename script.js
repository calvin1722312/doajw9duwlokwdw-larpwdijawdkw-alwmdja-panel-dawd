// PERSISTENT STAFF ACCOUNTS DATABASE
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
    { username: "Jase", password: "Jase2021!!!", rank: "Foundership+" },
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
    
    // --- MENU TAB SWITCHING ENGINE ---
    const tabMappings = [
        { btn: document.getElementById('navShifts'), content: document.getElementById('tabContentShifts'), title: "Staff Shifts" },
        { btn: document.getElementById('navPunishments'), content: document.getElementById('tabContentPunishments'), title: "User Punishments" },
        { btn: document.getElementById('navPromotions'), content: document.getElementById('tabContentPromotions'), title: "Staff Updates & Discipline" }
    ];

    tabMappings.forEach(tab => {
        if (tab.btn) {
            tab.btn.addEventListener('click', function() {
                // LOCKOUT RULE: Block User Punishments page if not actively clocked in
                if (tab.btn.id === 'navPunishments' && !shiftStartTime) {
                    alert("🔒 Access Denied: You must clock into an active Staff Shift before you can log user punishments!");
                    return; // Stops the page from loading completely
                }

                // Cleanly remove active state from all items and hide everything first
                tabMappings.forEach(t => { 
                    if(t.btn) t.btn.classList.remove('active'); 
                    if(t.content) t.content.style.display = 'none'; 
                });

                // Display the newly selected view layer
                tab.btn.classList.add('active');
                if (tab.content) {
                    tab.content.style.display = 'block'; // Force visibility on click
                }
                
                const viewTitle = document.getElementById('viewTitle');
                if (viewTitle) viewTitle.innerText = tab.title;
            });
        }
    });

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

        // Hide secondary workspaces on initial login, only show the Shifts view
        if (document.getElementById('tabContentPunishments')) document.getElementById('tabContentPunishments').style.display = 'none';
        if (document.getElementById('tabContentPromotions')) document.getElementById('tabContentPromotions').style.display = 'none';
        if (document.getElementById('tabContentShifts')) document.getElementById('tabContentShifts').style.display = 'block';
        
        // Ensure home button is visually highlighted active
        if (document.getElementById('navShifts')) document.getElementById('navShifts').classList.add('active');

        applyPermissions(userProfile.rank);
    }

    // =========================================================================
    // --- SYSTEM FORM 1: USER PUNISHMENT LOG ENTRY (Using Roblox Username) ---
    // =========================================================================
    const incidentForm = document.getElementById('incidentForm');
    if (incidentForm) {
        incidentForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // DOUBLE CHECK PERMISSION SYSTEM
            if (!shiftStartTime) {
                alert("❌ Action Aborted: Your shift has ended. You can no longer submit records.");
                return;
            }

            const targetUsername = document.getElementById('username').value;
            const action = document.getElementById('action').value;
            const reason = document.getElementById('reason').value;
            const notes = document.getElementById('notes').value || 'No attachments.';
            
            const activeSession = JSON.parse(localStorage.getItem('active_staff_session'));
            const staffExecutor = activeSession ? activeSession.username : 'Unknown Staff';
            const staffRank = activeSession ? activeSession.rank : 'N/A';

            const incidentPayload = {
                embeds: [{
                    title: `🚨 New User Punishment Logged`,
                    color: 16724534, // Red
                    fields: [
                        { name: "👤 Offender (Roblox Username)", value: `**${targetUsername}**`, inline: true },
                        { name: "🔨 Punishment Issued", value: `**${action}**`, inline: true },
                        { name: "📜 Rule Violated", value: reason, inline: false },
                        { name: "📝 Proof / Notes", value: notes, inline: false },
                        { name: "🛠️ Issued By Staff", value: `${staffExecutor} (${staffRank})`, inline: true }
                    ],
                    timestamp: new Date().toISOString()
                }]
            };

            const infractionWebhookUrl = "https://discord.com/api/webhooks/1518034185351200950/PL0NSWZwaAY-WgVkVNtN1BXijbdzX20SDFguq0-M4-13RWXIiAk8i39m8Uco6sNM0pAY";

            fetch(infractionWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(incidentPayload)
            })
            .then(response => {
                if (response.ok) {
                    alert(`✅ Punishment log for player "${targetUsername}" successfully sent!`);
                    incidentForm.reset();
                } else {
                    alert("❌ Cloud connection failed. Check your Webhook configurations.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("❌ Network connection error.");
            });
        });
    }

    // =========================================================================
    // --- SYSTEM FORM 2: STAFF SHIFT TRACKER ---
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

            btnStartShift.style.display = 'block';
            btnEndShift.style.display = 'none';
            shiftStatusDisplay.innerHTML = `🔴 Status: Off Duty`;
            shiftStatusDisplay.style.color = '';

            const shiftPayload = {
                embeds: [{
                    title: `⏱️ Staff Shift Logged`,
                    color: 3066993, // Green
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

            const shiftWebhookUrl = "https://discord.com/api/webhooks/1518034604525752381/OW_ytWMrFwRJMNzGfbswR-c3qbJSZ8iS4vBUIDmW9tghi5XAp2caIElYXZdkxGJ1o5Tu";

            // If user ends their shift while on the punishment screen, bump them safely back home
            const currentActiveTab = document.querySelector('.nav-item.active');
            if (currentActiveTab && currentActiveTab.id === 'navPunishments') {
                document.getElementById('navShifts').click(); 
            }

            fetch(shiftWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shiftPayload)
            })
            .then(response => {
                if (response.ok) {
                    alert(`✅ Your shift has been uploaded! Total duration recorded: ${totalMinutes} minute(s).`);
                } else {
                    alert("❌ Shift data transaction failed.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("❌ Connection timed out.");
            });

            shiftStartTime = null;
        });
    }

    // =========================================================================
    // --- SYSTEM FORM 3: STAFF ROSTER UPDATES & MANAGEMENT ACTIONS (SPLIT WEBHOOKS) ---
    // =========================================================================
    const promotionForm = document.getElementById('promotionForm');
    if (promotionForm) {
        promotionForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const targetStaffId = document.getElementById('targetStaffId').value;
            const mgmtAction = document.getElementById('mgmtAction').value;
            const newRank = document.getElementById('newRank').value;
            const mgmtReason = document.getElementById('mgmtReason').value;
            
            const activeSession = JSON.parse(localStorage.getItem('active_staff_session'));
            const managerName = activeSession ? activeSession.username : 'Unknown Executive';
            const managerRank = activeSession ? activeSession.rank : 'N/A';

            let embedColor = 3447003; // Default Blue
            let targetWebhookUrl = "";

            // --- SPLIT LOGIC ASSIGNMENTS ---
            if (mgmtAction === "Promotion") {
                embedColor = 3066993; // Green
                targetWebhookUrl = "https://discord.com/api/webhooks/1518043825820536986/XMTlTFeIsPR8yzq41eXw5X7JEHlC5pteujgl8N-hoQoh2K6z9BXP8QnCnSbIHHFRYCHr";
            } else {
                if (mgmtAction === "Demotion") embedColor = 15105570;     // Orange
                if (mgmtAction === "Suspension") embedColor = 15844367;   // Yellow
                if (mgmtAction === "Fired") embedColor = 12595844;        // Dark Red
                targetWebhookUrl = "https://discord.com/api/webhooks/1518044001817596025/-pF0xJ-9cT8pC4vmTCTtr45buVy_MJhnG8fGRvEn58jaHvXOYwVirExKW3u8JPe3F9d2";
            }

            const promoPayload = {
                embeds: [{
                    title: `👔 Official Staff Status & Disciplinary Log`,
                    color: embedColor,
                    fields: [
                        { name: "👤 Target Staff Member", value: `<@${targetStaffId}>`, inline: true },
                        { name: "⚡ Action Taken", value: `**${mgmtAction}**`, inline: true },
                        { name: "📋 New Rank Designation", value: newRank, inline: false },
                        { name: "📝 Reason / Notes", value: mgmtReason, inline: false },
                        { name: "👑 Authorized By", value: `${managerName} (${managerRank})`, inline: true }
                    ],
                    timestamp: new Date().toISOString()
                }]
            };

            fetch(targetWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(promoPayload)
            })
            .then(response => {
                if (response.ok) {
                    alert(`✅ Staff action (${mgmtAction}) for ID ${targetStaffId} securely sent!`);
                    promotionForm.reset();
                } else {
                    alert("❌ Webhook configuration break detected.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("❌ Connection lost.");
            });
        });
    }

    // --- ACCIDENT CONTROL: BLOCKS TAB CLOSURES ---
    window.addEventListener('beforeunload', function(e) {
        if (shiftStartTime) {
            e.preventDefault();
            e.returnValue = 'You are currently clocked in!';
        }
    });
});

// --- DYNAMIC PERMISSIONS RULE HANDLER ---
function applyPermissions(rank) {
    const optAdminBan = document.getElementById('optAdminBan');
    const navPromotions = document.getElementById('navPromotions');

    const lowerRank = rank.toLowerCase();

    if (optAdminBan) {
        if (lowerRank.includes('admin') || lowerRank.includes('management') || lowerRank.includes('founder')) {
            optAdminBan.style.display = 'block';
        } else {
            optAdminBan.style.display = 'none';
        }
    }

    if (navPromotions) {
        const listContainer = navPromotions.closest('li');
        if (listContainer) {
            if (lowerRank.includes('management') || lowerRank.includes('founder')) {
                listContainer.style.display = 'block';
            } else {
                listContainer.style.display = 'none';
            }
        }
    }
}
