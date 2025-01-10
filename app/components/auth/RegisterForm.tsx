const checkAndCreateUserDoc = async (userId: string, email: string, name: string, authProvider: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Se l'utente non esiste, crea un nuovo documento
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
      authProvider: authProvider // Aggiungi il provider di autenticazione
    });
  } else {
    // Se l'utente esiste, aggiorna solo i campi necessari
    await setDoc(userRef, {
      lastLoginAt: new Date().toISOString(),
      authProvider: authProvider // Aggiorna il provider di autenticazione
    }, { merge: true }); // Usa merge: true per non sovrascrivere i campi esistenti
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await checkAndCreateUserDoc(result.user.uid, result.user.email || '', result.user.displayName || '', 'email');
    router.push('/dashboard');
  } catch (err) {
    console.error(err);
    setError('Failed to login. Please check your credentials.');
  } finally {
    setLoading(false);
  }
};

const handleGoogleLogin = async () => {
  setLoading(true);
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await checkAndCreateUserDoc(result.user.uid, result.user.email || '', result.user.displayName || '', 'google');
    router.push('/dashboard');
  } catch (err) {
    console.error(err);
    setError('Failed to login with Google.');
  } finally {
    setLoading(false);
  }
};
