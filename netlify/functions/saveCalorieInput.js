import admin from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import serviceAccount from '../../src/config/serviceAccountKey.json'; 

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    initializeApp({
        credential: cert(serviceAccount),
    });
}

export const handler = async (event) => {
    // Parse the request body
    let body;
    try {
        body = JSON.parse(event.body);
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON format' }),
        };
    }

    const { userId, foodName, results, totalCalories } = body;

    // Validate input
    if (!userId || !foodName || !Array.isArray(results) || typeof totalCalories !== 'number') {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid input data' }),
        };
    }

    try {
        const db = admin.firestore();
        const userRef = db.collection('users').doc(userId);
        const foodDocRef = userRef.collection('foods').doc(); // Generate a unique ID

        await foodDocRef.set({
            foodName, // Save the food name
            results, // Save all food items
            totalCalories,
            timestamp: admin.firestore.FieldValue.serverTimestamp(), // Optional: Add a timestamp
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Calorie input saved successfully.' }),
        };
    } catch (error) {
        console.error('Error saving calorie input:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to save calorie input', details: error.message }),
        };
    }
};
