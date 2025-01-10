const checkAndCreateUserDoc = async (userId: string, email: string, name: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Controlla se esiste un utente con la stessa email
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(query(usersRef, where('email', '==', email)));

    if (!querySnapshot.empty) {
      // Se esiste un utente con la stessa email, aggiorna il documento esistente
      const existingUserDoc = querySnapshot.docs[0];
      await setDoc(existingUserDoc.ref, {
        uid: userId, // Aggiungi l'UID del nuovo provider
        authProvider: 'google', // Aggiorna il provider di autenticazione
        lastLoginAt: new Date().toISOString(), // Aggiorna l'ultimo accesso
      }, { merge: true });
    } else {
      // Se non esiste un utente con la stessa email, crea un nuovo documento
      await setDoc(userRef, {
        email,
        displayName: name,
        subscriptionStatus: 'payment_required',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customerId: null,
        subscriptionId: null,
        lastLoginAt: new Date().toISOString(),
        isActive: true,
        paymentMethod: null,
        billingDetails: null,
        authProvider: 'google'
      });
    }
  } else {
    // Se il documento esiste già, aggiorna solo i campi necessari
    await setDoc(userRef, {
      lastLoginAt: new Date().toISOString(),
      authProvider: 'google', // Aggiorna il provider di autenticazione
    }, { merge: true });
  }
};
