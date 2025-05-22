import { db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const RegisterScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== passwordRepeat) {
      console.error('Şifreler eşleşmiyor');
      return;
    }

    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      // Firestore'a kullanıcı bilgisi ekle
      await db.collection('users').doc(auth.currentUser.uid).set({
        firstName,
        lastName,
        email
      });
      setSuccess('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setPasswordRepeat('');
      setAccepted(false);
    } catch (error) {
      console.error('Kayıt işlemi sırasında bir hata oluştu:', error);
    }
  };

  return (
    <div>
      {/* Form kısmı burada olacak */}
    </div>
  );
};

export default RegisterScreen; 