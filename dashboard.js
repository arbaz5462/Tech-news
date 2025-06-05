// Firebase configuration
const firebaseConfig = {
    // Add your Firebase config here (same as in app.js)
    apiKey: "YOUR_API_KEY",
    authDomain: "your-app.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-app.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Check authentication state
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // User is signed in
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            document.getElementById('userName').textContent = userDoc.data().name;
        }
        loadDashboardData(user.uid);
    } else {
        // User is not signed in, redirect to home
        window.location.href = '/';
    }
});

// Sign out function
function signOut() {
    auth.signOut().then(() => {
        window.location.href = '/';
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
}

// Load dashboard data
async function loadDashboardData(userId) {
    try {
        // Load recent activity
        const activities = await db.collection('activities')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();

        const activityList = document.getElementById('activityList');
        activityList.innerHTML = '';

        activities.forEach(doc => {
            const activity = doc.data();
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <p>${activity.description}</p>
                <small>${formatDate(activity.timestamp)}</small>
            `;
            activityList.appendChild(activityItem);
        });

        // Load project stats
        const projects = await db.collection('projects')
            .where('members', 'array-contains', userId)
            .get();
        
        // Update project count
        document.querySelector('.dashboard-card:nth-child(1) .stat-number')
            .textContent = projects.size;

        // Load team members
        const teamMembers = new Set();
        for (const project of projects.docs) {
            project.data().members.forEach(member => teamMembers.add(member));
        }
        
        // Update team count
        document.querySelector('.dashboard-card:nth-child(2) .stat-number')
            .textContent = teamMembers.size;

        // Load tasks
        const tasks = await db.collection('tasks')
            .where('assignedTo', '==', userId)
            .where('status', '==', 'open')
            .get();
        
        // Update task count
        document.querySelector('.dashboard-card:nth-child(3) .stat-number')
            .textContent = tasks.size;

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Helper function to format dates
function formatDate(timestamp) {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
} 