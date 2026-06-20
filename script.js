// PERSISTENT STAFF ACCOUNTS DATABASE (15 accounts across the 3 core ranks)
let savedDatabase = JSON.parse(localStorage.getItem('staff_database'));
let userDatabase = savedDatabase && Array.isArray(savedDatabase) ? savedDatabase : [
    { username: "Admin", password: "2312daiw@(#&H", rank: "Foundership+" },
    { username: "Calvin2014c", password: "nR403^@#", rank: "Foundership+" },
    { username: "boom_amir", password: "308623407642", rank: "Moderation" },
    { username: "Frustrated_Ninja", password: "3823528521", rank: "Foundership+" },
    { username: "Josh", password: "Joshcandy0321", rank: "Foundership+" },
    { username: "Bloodyboy0025", password: "80106535", rank: "Admin+" },
    { username: "Jase_2021", password: "Jase2021!!!", rank: "Foundership+" },
    { username: "wdoaowjd", password: "Password123", rank: "Moderation" },
    { username: "djawjdk", password: "Password123", rank: "Moderation" },
    { username: "kwmdaklwmdk", password: "Password123", rank: "Moderation" },
    { username: "akwdmakwnfjonw", password: "Password123", rank: "Moderation" },
    { username: "apkfaiwdiji", password: "Password123", rank: "Moderation" },
    { username: "i29e8yq0dijs", password: "Password123", rank: "Moderation" },
    { username: "djwhau9h", password: "Password123", rank: "Moderation" },
    { username: "TrialMod", password: "TrialTestingModerationTesting:D", rank: "Moderation" }
];

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

    // --- SUBMIT COMPONENT INFRACTION FORM (Pushes directly to Discord Cloud) ---
    const incidentForm = document.getElementById('incidentForm');
    if (incidentForm) {
        incidentForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 1. Gather form values
            const username = document.getElementById('username').value;
            const action = document.getElementById('action').value;
            const reason = document.getElementById('reason').value;
            const notes = document.getElementById('notes').value || 'No attachments.';
            
            // Get the active staff member logged into the panel
            const activeSession = JSON.parse(localStorage.getItem('active_staff_session'));
            const staffExecutor = activeSession ? activeSession.username : 'Unknown Staff';
            const staffRank = activeSession ? activeSession.rank : 'N/A';

            // 2. Format a professional Discord Embed Object
            const discordPayload = {
                embeds: [{
                    title: `🚨 New Infraction Logged`,
                    color: 16724534, // Red color hex code in decimal
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

            // ⚠️ REPLACE THIS URL WITH YOUR ACTUAL DISCORD WEBHOOK URL ⚠️
            const webhookUrl = "https://discord.com/api/webhooks/1517965113582161930/ehfk5mnv1MFwU6-qR-_7Px9nIHxffVX5Je_30C8nrrCLttRr10-jWDH3L_DyMFSRnX_-";

            // 3. Fetch POST Request to send data to the Cloud
            fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(discordPayload)
            })
            .then(response => {
                if (response.ok) {
                    alert(`✅ Log for ${username} successfully saved to the cloud!`);
                    incidentForm.reset();
                } else {
                    alert("❌ Cloud connection failed. Check your Webhook URL configuration.");
                }
            })
            .catch(error => {
                console.error('Error sending log:', error);
                alert("❌ Network error. Could not reach cloud services.");
            });
        });
    }
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
