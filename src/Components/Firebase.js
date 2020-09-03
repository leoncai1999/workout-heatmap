import firebase from 'firebase'

var firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: "workout-heatmap.firebaseapp.com",
    databaseURL: "https://workout-heatmap.firebaseio.com",
    projectId: "workout-heatmap",
    storageBucket: "workout-heatmap.appspot.com",
    messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

firebase.initializeApp(firebaseConfig);

export default firebase;