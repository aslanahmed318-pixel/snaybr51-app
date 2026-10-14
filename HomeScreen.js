import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { auth, db, storage } from './firebase';

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

import GiftAnimation from './GiftAnimation';

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('مستخدم جديد');
  const [userId, setUserId] = useState('');
  const [coins, setCoins] = useState(2000000);
  const [avatar, setAvatar] = useState('');
  const [searchId, setSearchId] = useState('');
  const [rooms, setRooms] = useState([]);
  const [editVisible, setEditVisible] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [giftVisible, setGiftVisible] = useState(false);
  const [activeGift, setActiveGift] = useState({
    icon: '🎁',
    name: 'هدية',
  });

  useEffect(() => {
    let mounted = true;
    let unsubscribeRooms;

    const start = async () => {
      try {
        if (!auth.currentUser) {
          navigation.replace('Login');
          return;
        }

        const loaded = await loadUser();

        if (!loaded || !mounted) return;

        unsubscribeRooms = onSnapshot(
          collection(db, 'rooms'),
          (snapshot) => {
            if (!mounted) return;

            const list = snapshot.docs.map((item) => ({
              id: item.id,
              ...item.data(),
            }));

            list.sort(
              (a, b) =>
                (b.createdAt?.seconds || 0) -
                (a.createdAt?.seconds || 0)
            );

            setRooms(list);
          },
          (error) => {
            console.log('Rooms error:', error.code);
          }
        );
      } catch (error) {
        console.log('Home error:', error.code, error.message);
        Alert.alert('خطأ', 'تعذر تحميل الحساب.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    start();

    return () => {
      mounted = false;
      if (unsubscribeRooms) unsubscribeRooms();
    };
  }, []);

  const loadUser = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      navigation.replace('Login');
      return false;
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const publicRef = doc(db, 'publicProfiles', currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      Alert.alert(
        'الحساب غير مكتمل',
        'سجّل الخروج ثم أنشئ الحساب مجددًا، أو راجع بيانات حسابك قبل المتابعة.'
      );
      return false;
    }

    const data = userSnap.data();

    const savedName =
      data.username || currentUser.displayName || 'مستخدم جديد';

    const savedId = data.userId || '';
    const savedAvatar = data.avatar || '';
    const savedCoins =
      typeof data.coins === 'number' ? data.coins : 2000000;

    setUsername(savedName);
    setNewUsername(savedName);
    setUserId(savedId);
    setAvatar(savedAvatar);
    setCoins(savedCoins);

    // إنشاء الملف العام إذا كان مفقودًا.
    const publicSnap = await getDoc(publicRef);

    if (!publicSnap.exists() && savedId) {
      await setDoc(publicRef, {
        uid: currentUser.uid,
        userId: savedId,
        username: savedName,
        avatar: savedAvatar,
      });
    }

    return true;
  };

  const pickAvatar = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert('صلاحية مطلوبة', 'اسمح للتطبيق بالوصول إلى الصور.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Pick avatar error:', error.code);
      Alert.alert('خطأ', 'تعذر اختيار الصورة.');
    }
  };

  const uploadAvatar = async (uri) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setUploadingImage(true);

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const imageRef = ref(storage, `avatars/${currentUser.uid}.jpg`);

      await uploadBytes(imageRef, blob);

      const downloadURL = await getDownloadURL(imageRef);

      const batch = writeBatch(db);

      batch.update(doc(db, 'users', currentUser.uid), {
        avatar: downloadURL,
      });

      batch.update(doc(db, 'publicProfiles', currentUser.uid), {
        avatar: downloadURL,
      });

      await batch.commit();

      setAvatar(downloadURL);
      Alert.alert('تم الحفظ', 'تم حفظ الصورة بنجاح.');
    } catch (error) {
      console.log('Avatar error:', error.code, error.message);
      Alert.alert(
        'تعذر حفظ الصورة',
        'تأكد من إعدادات صلاحيات Firebase Storage ووجود الملف العام.'
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const saveProfile = async () => {
    const name = newUsername.trim();
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    if (name.length < 2) {
      Alert.alert('تنبيه', 'الاسم يجب أن يكون حرفين على الأقل.');
      return;
    }

    try {
      const batch = writeBatch(db);

      batch.update(doc(db, 'users', currentUser.uid), {
        username: name,
      });

      batch.update(doc(db, 'publicProfiles', currentUser.uid), {
        username: name,
      });

      await batch.commit();

      setUsername(name);
      setEditVisible(false);
      Alert.alert('تم الحفظ', 'تم تحديث اسم الحساب.');
    } catch (error) {
      console.log('Save name error:', error.code, error.message);
      Alert.alert('خطأ', 'تعذر حفظ الاسم. تحقق من وجود الملف العام.');
    }
  };

  const searchUser = async () => {
    const id = searchId.trim().toLowerCase();

    if (!/^[a-z0-9_]{3,20}$/.test(id)) {
      Alert.alert('ID غير صالح', 'أدخل ID صحيحًا من 3 إلى 20 خانة.');
      return;
    }

    try {
      const idSnap = await getDoc(doc(db, 'userIds', id));

      if (!idSnap.exists()) {
        Alert.alert('نتيجة البحث', 'لم يتم العثور على المستخدم.');
        return;
      }

      const targetUid = idSnap.data().uid;

      if (!targetUid) {
        Alert.alert('خطأ', 'بيانات المعرّف غير مكتملة.');
        return;
      }

      const profileSnap = await getDoc(
        doc(db, 'publicProfiles', targetUid)
      );

      if (!profileSnap.exists()) {
        Alert.alert('نتيجة البحث', 'الملف العام غير موجود.');
        return;
      }

      const profile = profileSnap.data();

      Alert.alert(
        'تم العثور على المستخدم',
        `الاسم: ${profile.username || 'مستخدم'}\nID: ${profile.userId || id}`
      );
    } catch (error) {
      console.log('Search error:', error.code, error.message);
      Alert.alert('خطأ', 'تعذر البحث. تحقق من قواعد Firestore.');
    }
  };

  const createRoom = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      navigation.replace('Login');
      return;
    }

    try {
      const roomNumber = Date.now().toString().slice(-6);

      const roomRef = doc(collection(db, 'rooms'));

      await setDoc(roomRef, {
        name: `غرفة ${username}`,
        roomNumber,
        ownerUid: currentUser.uid,
        ownerName: username,
        ownerAvatar: avatar,
        users: 1,
        maxUsers: 100,
        isActive: true,
        createdAt: serverTimestamp(),
      });

      Alert.alert('تم إنشاء الغرفة 🎙️', `رقم الغرفة: ${roomNumber}`);
    } catch (error) {
      console.log('Create room error:', error.code, error.message);
      Alert.alert('خطأ', 'تعذر إنشاء الغرفة.');
    }
  };

  const sendGift = (giftName, price, giftIcon) => {
    Alert.alert(
      'الهدايا قيد التجهيز 🎁',
      'إرسال الهدايا وخصم العملات متوقف مؤقتًا حتى نجهز نظام رصيد آمن.'
    );
  };

  const logout = async () => {
    try {
      await auth.signOut();
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('خطأ', 'تعذر تسجيل الخروج.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>جاري تحميل الحساب...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <TouchableOpacity onPress={pickAvatar} style={styles.avatar}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>👤</Text>
            )}
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.muted}>ID: {userId || 'غير محدد'}</Text>
          </View>

          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => {
              setNewUsername(username);
              setEditVisible(true);
            }}
          >
            <Text>تعديل</Text>
          </TouchableOpacity>
        </View>

        {uploadingImage && (
          <View style={styles.card}>
            <ActivityIndicator />
            <Text>جاري حفظ الصورة...</Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.muted}>رصيد العملات التجريبي</Text>
            <Text style={styles.coins}>🪙 {coins.toLocaleString()}</Text>
          </View>
          <Text style={styles.muted}>الشحن غير مفعّل</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>🔎 البحث عن مستخدم</Text>
          <TextInput
            style={styles.input}
            value={searchId}
            onChangeText={setSearchId}
            placeholder="ID مثل user123"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.button} onPress={searchUser}>
            <Text style={styles.buttonText}>بحث</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.menuButton} onPress={createRoom}>
            <Text style={styles.menuIcon}>🎙️</Text>
            <Text>إنشاء غرفة</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() =>
              Alert.alert('الميكروفون', 'سيتم تفعيل المايك عند ربط Agora.')
            }
          >
            <Text style={styles.menuIcon}>🎤</Text>
            <Text>الصوت</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() =>
              Alert.alert('VIP', 'متجر VIP قيد التجهيز.')
            }
          >
            <Text style={styles.menuIcon}>👑</Text>
            <Text>متجر VIP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() =>
              Alert.alert('المتجر', 'الشحن غير مفعّل حاليًا.')
            }
          >
            <Text style={styles.menuIcon}>🪙</Text>
            <Text>المتجر</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>🎙️ الغرف العامة</Text>

          {rooms.length === 0 ? (
            <Text style={styles.empty}>لا توجد غرف حاليًا.</Text>
          ) : (
            rooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                style={styles.room}
                onPress={() =>
                  Alert.alert(
                    'الغرفة',
                    `${room.name || 'غرفة صوتية'}\nرقم الغرفة: ${
                      room.roomNumber || 'غير محدد'
                    }\nالدخول الصوتي لم يُفعّل بعد.`
                  )
                }
              >
                {room.ownerAvatar ? (
                  <Image
                    source={{ uri: room.ownerAvatar }}
                    style={styles.roomAvatar}
                  />
                ) : (
                  <Text style={styles.menuIcon}>🎙️</Text>
                )}

                <View style={{ flex: 1 }}>
                  <Text style={styles.roomName}>
                    {room.name || 'غرفة صوتية'}
                  </Text>
                  <Text style={styles.muted}>
                    المالك: {room.ownerName || 'غير معروف'}
                  </Text>
                  <Text style={styles.muted}>
                    رقم الغرفة: {room.roomNumber || 'غير محدد'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>🎁 الهدايا التجريبية</Text>
          <View style={styles.grid}>
            {[
              ['🌹', 'وردة', 100],
              ['❤️', 'قلب', 500],
              ['👑', 'تاج', 1000],
              ['💎', 'ماسة', 5000],
            ].map(([icon, name, price]) => (
              <TouchableOpacity
                key={name}
                style={styles.gift}
                onPress={() => sendGift(name, price, icon)}
              >
                <Text style={styles.menuIcon}>{icon}</Text>
                <Text>{name}</Text>
                <Text style={styles.muted}>🪙 {price}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.logout} onPress={logout}>
          <Text style={styles.buttonText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </ScrollView>

      <GiftAnimation
        visible={giftVisible}
        giftIcon={activeGift.icon}
        giftName={activeGift.name}
        senderName={username}
        duration={2200}
        onFinish={() => setGiftVisible(false)}
      />

      <Modal
        visible={editVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>تعديل الحساب</Text>
            <TextInput
              style={styles.input}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="اسم الحساب"
              maxLength={30}
            />

            <TouchableOpacity style={styles.button} onPress={saveProfile}>
              <Text style={styles.buttonText}>حفظ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => setEditVisible(false)}
            >
              <Text>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  content: { padding: 16, paddingBottom: 40 },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f6fa',
  },
  loadingText: { marginTop: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontSize: 30 },
  profileInfo: { flex: 1 },
  username: { fontSize: 18, fontWeight: 'bold', textAlign: 'right' },
  muted: { color: '#777', fontSize: 12, marginTop: 5 },
  smallButton: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 10,
  },
  coins: { fontSize: 22, fontWeight: 'bold', marginTop: 6 },
  title: {
    width: '100%',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 13,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#222',
    padding: 13,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    alignItems: 'center',
  },
  menuIcon: { fontSize: 28, marginBottom: 6 },
  empty: { color: '#888', padding: 12 },
  room: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    gap: 12,
  },
  roomAvatar: { width: 46, height: 46, borderRadius: 23 },
  roomName: { fontWeight: 'bold', textAlign: 'right' },
  gift: {
    width: '48%',
    backgroundColor: '#f7f7f7',
    borderRadius: 14,
    alignItems: 'center',
    padding: 14,
    marginBottom: 8,
  },
  logout: {
    backgroundColor: '#b3261e',
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
});
