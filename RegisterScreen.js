import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

import {
  createUserWithEmailAndPassword,
} from 'firebase/auth';

import {
  doc,
  setDoc,
  getDocs,
  query,
  collection,
  where,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from './firebase';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [loading, setLoading] = useState(false);

  const register = async () => {
    if (
      !email.trim() ||
      !password ||
      !username.trim() ||
      !uniqueId.trim()
    ) {
      Alert.alert('تنبيه', 'يرجى تعبئة جميع الحقول');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'كلمة المرور',
        'يجب أن تكون كلمة المرور 6 أحرف أو أكثر'
      );
      return;
    }

    const cleanId = uniqueId.trim().toLowerCase();

    // السماح بالحروف والأرقام و _
    if (!/^[a-z0-9_]+$/.test(cleanId)) {
      Alert.alert(
        'ID غير صالح',
        'استخدم الحروف الإنجليزية والأرقام والرمز _ فقط'
      );
      return;
    }

    try {
      setLoading(true);

      // التأكد أن الـ ID غير مستخدم
      const idQuery = query(
        collection(db, 'users'),
        where('uniqueId', '==', cleanId)
      );

      const idSnapshot = await getDocs(idQuery);

      if (!idSnapshot.empty) {
        Alert.alert(
          'ID مستخدم',
          'هذا الـ ID موجود مسبقًا، اختر ID آخر'
        );
        setLoading(false);
        return;
      }

      // إنشاء حساب Firebase
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const user = userCredential.user;

      // إنشاء بيانات المستخدم في Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        uniqueId: cleanId,
        username: username.trim(),
        photoURL: '',
        coins: 2000000,
        vipLevel: 0,
        createdAt: serverTimestamp(),
      });

      Alert.alert(
        'تم إنشاء الحساب 🎉',
        `مرحبًا ${username.trim()}`
      );

      // الانتقال للرئيسية
      navigation.replace('Home');
    } catch (error) {
      console.log(error);

      if (error.code === 'auth/email-already-in-use') {
        Alert.alert(
          'البريد مستخدم',
          'هذا البريد الإلكتروني مسجل مسبقًا'
        );
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert(
          'البريد الإلكتروني',
          'البريد الإلكتروني غير صحيح'
        );
      } else if (error.code === 'auth/weak-password') {
        Alert.alert(
          'كلمة المرور',
          'كلمة المرور ضعيفة'
        );
      } else {
        Alert.alert(
          'حدث خطأ',
          error.message || 'تعذر إنشاء الحساب'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        إنشاء حساب
      </Text>

      <Text style={styles.subtitle}>
        أنشئ حسابك وابدأ بـ 2,000,000 عملة تجريبية 🪙
      </Text>

      <TextInput
        style={styles.input}
        placeholder="اسم المستخدم"
        value={username}
        onChangeText={setUsername}
        maxLength={30}
      />

      <TextInput
        style={styles.input}
        placeholder="ID المميز مثال: user123"
        value={uniqueId}
        onChangeText={setUniqueId}
        autoCapitalize="none"
        maxLength={20}
      />

      <TextInput
        style={styles.input}
        placeholder="البريد الإلكتروني"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="كلمة المرور"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={register}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            إنشاء الحساب
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.loginButton}
      >
        <Text style={styles.loginText}>
          لدي حساب بالفعل — تسجيل الدخول
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 25,
  },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  loginButton: {
    marginTop: 20,
    alignItems: 'center',
  },

  loginText: {
    color: '#333',
    fontSize: 15,
  },
});
