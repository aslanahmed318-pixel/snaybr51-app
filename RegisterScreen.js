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
  getDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from './firebase';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const register = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();
    const cleanId = userId.trim().toLowerCase();

    if (!cleanEmail || !password || !cleanUsername || !cleanId) {
      Alert.alert('تنبيه', 'يرجى تعبئة جميع الحقول');
      return;
    }

    if (password.length < 6) {
      Alert.alert('كلمة المرور', 'يجب أن تكون 6 أحرف أو أكثر');
      return;
    }

    if (!/^[a-z0-9_]{3,20}$/.test(cleanId)) {
      Alert.alert(
        'ID غير صالح',
        'استخدم 3 إلى 20 حرفًا إنجليزيًا أو رقمًا أو _ فقط'
      );
      return;
    }

    let createdUser = null;

    try {
      setLoading(true);

      const idRef = doc(db, 'userIds', cleanId);

      // التأكد من أن المعرّف غير محجوز.
      const idSnapshot = await getDoc(idRef);

      if (idSnapshot.exists()) {
        Alert.alert('ID مستخدم', 'اختر معرّفًا آخر');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      createdUser = userCredential.user;

      const batch = writeBatch(db);

      batch.set(doc(db, 'users', createdUser.uid), {
        uid: createdUser.uid,
        userId: cleanId,
        username: cleanUsername,
        email: cleanEmail,
        avatar: '',
        coins: 2000000,
        createdAt: serverTimestamp(),
      });

      batch.set(idRef, {
        uid: createdUser.uid,
        userId: cleanId,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      Alert.alert(
        'تم إنشاء الحساب 🎉',
        `مرحبًا ${cleanUsername}`
      );

      navigation.replace('Home');
    } catch (error) {
      console.log('Register error:', error.code, error.message);

      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('البريد مستخدم', 'هذا البريد مسجل مسبقًا');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('البريد الإلكتروني', 'تحقق من صحة البريد');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('كلمة المرور', 'كلمة المرور ضعيفة');
      } else if (
        error.code === 'permission-denied' ||
        error.code === 'firestore/permission-denied'
      ) {
        Alert.alert(
          'صلاحيات قاعدة البيانات',
          'لم تسمح قواعد Firestore بحجز المعرّف أو إنشاء الملف الشخصي. لا تغيّر القواعد عشوائيًا.'
        );
      } else {
        Alert.alert(
          'تعذر إنشاء الحساب',
          'حدث خطأ أثناء التسجيل. تحقق من اتصال الإنترنت وإعدادات Firebase.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>إنشاء حساب</Text>

      <Text style={styles.subtitle}>
        ابدأ بـ 2,000,000 عملة تجريبية 🪙
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
        placeholder="ID المميز، مثال: user123"
        value={userId}
        onChangeText={setUserId}
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
        style={[styles.button, loading && styles.disabledButton]}
        onPress={register}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>إنشاء الحساب</Text>
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
  disabledButton: {
    opacity: 0.6,
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
