import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

export const registerUser = async (userData) => {
  try {
    const { email, password, firstName, lastName } = userData;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName: `${firstName} ${lastName}` });
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      firstName,
      lastName,
      email,
      createdAt: serverTimestamp(),
      isActive: true,
      lastLogin: serverTimestamp()
    });
    return { message: 'Kullanıcı başarıyla kaydedildi', userId: user.uid };
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      throw { message: 'Bu e-posta adresi zaten kullanılıyor' };
    } else if (error.code === 'auth/invalid-email') {
      throw { message: 'Geçersiz e-posta adresi' };
    } else if (error.code === 'auth/weak-password') {
      throw { message: 'Şifre çok zayıf. En az 6 karakter olmalıdır' };
    } else {
      throw { message: error.message || 'Kayıt sırasında bir hata oluştu' };
    }
  }
}; 