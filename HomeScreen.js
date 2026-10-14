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
      Alert.alert('
