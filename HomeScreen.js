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
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';


export default function HomeScreen({ navigation }) {

  const [loading, setLoading] = useState(true);

  const [username, setUsername] =
    useState('مستخدم جديد');

  const [userId, setUserId] =
    useState('');

  const [coins, setCoins] =
    useState(2000000);

  const [avatar, setAvatar] =
    useState('');

  const [searchId, setSearchId] =
    useState('');

  const [micOn, setMicOn] =
    useState(true);

  const [rooms, setRooms] =
    useState([]);

  const [editVisible, setEditVisible] =
    useState(false);

  const [newUsername, setNewUsername] =
    useState('');

  const [uploadingImage, setUploadingImage] =
    useState(false);


  // --------------------------------
  // تحميل الحساب والغرف
  // --------------------------------

  useEffect(() => {

    let unsubscribeRooms;

    const start = async () => {

      const currentUser = auth.currentUser;

      if (!currentUser) {

        navigation.replace('Login');
        return;
      }

      try {

        await loadUser();

        // تحميل الغرف مباشرة من Firebase

        const roomsRef = collection(
          db,
          'users',
          currentUser.uid,
          'rooms'
        );

        const roomsQuery = query(
          roomsRef,
          orderBy('createdAt', 'desc')
        );

        unsubscribeRooms = onSnapshot(
          roomsQuery,
          (snapshot) => {

            const loadedRooms =
              snapshot.docs.map((item) => ({
                id: item.id,
                ...item.data(),
              }));

            setRooms(loadedRooms);
          },
          (error) => {

            console.log(
              'Rooms listener error:',
              error
            );
          }
        );

      } catch (error) {

        console.log(
          'Start error:',
          error
        );

      } finally {

        setLoading(false);
      }
    };

    start();

    return () => {

      if (unsubscribeRooms) {
        unsubscribeRooms();
      }

    };

  }, []);


  // --------------------------------
  // إنشاء ID مستخدم
  // --------------------------------

  const generateUserId = () => {

    return String(
      Math.floor(
        1000000 +
        Math.random() * 9000000
      )
    );

  };


  const createUniqueUserId = async () => {

    let newId =
      generateUserId();

    const usersRef =
      collection(db, 'users');

    let q = query(
      usersRef,
      where('userId', '==', newId)
    );

    let result =
      await getDocs(q);

    while (!result.empty) {

      newId =
        generateUserId();

      q = query(
        usersRef,
        where('userId', '==', newId)
      );

      result =
        await getDocs(q);
    }

    return newId;
  };


  // --------------------------------
  // تحميل بيانات المستخدم
  // --------------------------------

  const loadUser = async () => {

    try {

      const currentUser =
        auth.currentUser;

      if (!currentUser) {

        Alert.alert(
          'تنبيه',
          'يجب تسجيل الدخول أولاً'
        );

        navigation.replace('Login');

        return;
      }

      const userRef =
        doc(
          db,
          'users',
          currentUser.uid
        );

      const userSnap =
        await getDoc(userRef);


      if (userSnap.exists()) {

        const data =
          userSnap.data();

        setUsername(
          data.username ||
          'مستخدم جديد'
        );

        setNewUsername(
          data.username ||
          'مستخدم جديد'
        );

        setUserId(
          data.userId || ''
        );

        setCoins(
          typeof data.coins === 'number'
            ? data.coins
            : 2000000
        );

        setAvatar(
          data.avatar ||
          ''
        );

      } else {

        const newUserId =
          await createUniqueUserId();

        const newUser = {

          uid:
            currentUser.uid,

          username:
            currentUser.displayName ||
            'مستخدم جديد',

          email:
            currentUser.email ||
            '',

          userId:
            newUserId,

          coins:
            2000000,

          avatar:
            '',

          createdAt:
            serverTimestamp(),
        };


        await setDoc(
          userRef,
          newUser
        );


        setUsername(
          newUser.username
        );

        setNewUsername(
          newUser.username
        );

        setUserId(
          newUser.userId
        );

        setCoins(2000000);

        setAvatar('');
      }

    } catch (error) {

      console.log(
        'Load user error:',
        error
      );

      Alert.alert(
        'خطأ',
        'حدث خطأ أثناء تحميل بيانات الحساب'
      );
    }
  };


  // --------------------------------
  // اختيار صورة الحساب
  // --------------------------------

  const pickAvatar = async () => {

    try {

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (
        permission.status !==
        'granted'
      ) {

        Alert.alert(
          'صلاحية مطلوبة',
          'اسمح للتطبيق بالوصول إلى الصور لاختيار صورة الحساب.'
        );

        return;
      }


      const result =
        await ImagePicker.launchImageLibraryAsync({

          mediaTypes:
            ['images'],

          allowsEditing:
            true,

          aspect:
            [1, 1],

          quality:
            0.8,
        });


      if (
        result.canceled ||
        !result.assets ||
        !result.assets[0]
      ) {
        return;
      }


      const imageUri =
        result.assets[0].uri;

      await uploadAvatar(
        imageUri
      );

    } catch (error) {

      console.log(
        'Pick avatar error:',
        error
      );

      Alert.alert(
        'خطأ',
        'تعذر اختيار الصورة'
      );
    }
  };


  // --------------------------------
  // رفع الصورة إلى Firebase
  // --------------------------------

  const uploadAvatar = async (
    imageUri
  ) => {

    try {

      const currentUser =
        auth.currentUser;

      if (!currentUser) {
        return;
      }

      setUploadingImage(true);


      const response =
        await fetch(imageUri);

      const blob =
        await response.blob();


      const imageRef =
        ref(
          storage,
          `avatars/${currentUser.uid}.jpg`
        );


      await uploadBytes(
        imageRef,
        blob
      );


      const downloadURL =
        await getDownloadURL(
          imageRef
        );


      await updateDoc(
        doc(
          db,
          'users',
          currentUser.uid
        ),
        {
          avatar:
            downloadURL,
        }
      );


      setAvatar(
        downloadURL
      );


      Alert.alert(
        'تم الحفظ',
        'تم حفظ صورة الحساب بنجاح ✅'
      );

    } catch (error) {

      console.log(
        'Upload avatar error:',
        error
      );

      Alert.alert(
        'خطأ',
        'تعذر حفظ صورة الحساب'
      );

    } finally {

      setUploadingImage(false);
    }
  };


  // --------------------------------
  // حفظ اسم الحساب
  // --------------------------------

  const saveProfile = async () => {

    const name =
      newUsername.trim();

    if (!name) {

      Alert.alert(
        'تنبيه',
        'اكتب اسم الحساب أولاً'
      );

      return;
    }


    if (name.length < 2) {

      Alert.alert(
        'تنبيه',
        'الاسم يجب أن يكون حرفين على الأقل'
      );

      return;
    }


    try {

      const currentUser =
        auth.currentUser;

      if (!currentUser) {
        return;
      }


      await updateDoc(
        doc(
          db,
          'users',
          currentUser.uid
        ),
        {
          username:
            name,
        }
      );


      setUsername(name);

      setEditVisible(false);


      Alert.alert(
        'تم الحفظ',
        'تم حفظ اسم الحساب بنجاح ✅'
      );

    } catch (error) {

      console.log(
        'Save profile error:',
        error
      );

      Alert.alert(
        'خطأ',
        'تعذر حفظ اسم الحساب'
      );
    }
  };


  // --------------------------------
  // البحث عن مستخدم
  // --------------------------------

  const searchUser = async () => {

    const id =
      searchId.trim();

    if (!id) {

      Alert.alert(
        'تنبيه',
        'اكتب ID المستخدم'
      );

      return;
    }


    try {

      const usersRef =
        collection(db, 'users');

      const q =
        query(
          usersRef,
          where(
            'userId',
            '==',
            id
          )
        );

      const result =
        await getDocs(q);


      if (result.empty) {

        Alert.alert(
          'نتيجة البحث',
          'لم يتم العثور على مستخدم بهذا ID'
        );

        return;
      }


      const userData =
        result.docs[0].data();


      Alert.alert(
        'تم العثور على المستخدم',
        `الاسم: ${
          userData.username ||
          'بدون اسم'
        }\nID: ${
          userData.userId
        }`
      );

    } catch (error) {

      console.log(
        'Search error:',
        error
      );

      Alert.alert(
        'خطأ',
        'حدث خطأ أثناء البحث'
      );
    }
  };


  // --------------------------------
  // إنشاء غرفة وحفظها
  // --------------------------------

  const createRoom = async () => {

    try {

      const currentUser =
        auth.currentUser;

      if (!currentUser) {
        return;
      }


      const roomNumber =
        Date.now().toString().slice(-6);


      const room = {

        name:
          `غرفة ${username}`,

        ownerUid:
          currentUser.uid,

        ownerName:
          username,

        users:
          1,

        createdAt:
          serverTimestamp(),
      };


      const roomRef =
        doc(
          collection(
            db,
            'users',
            currentUser.uid,
            'rooms'
          )
        );


      await setDoc(
        roomRef,
        room
      );


      Alert.alert(
        'تم إنشاء الغرفة 🎙️',
        `تم إنشاء ${room.name}\nرقم الغرفة: ${roomNumber}`
      );

    } catch (error) {

      console.log(
        'Create room error:',
        error
      );

      Alert.alert(
        'خطأ',
        'تعذر إنشاء الغرفة'
      );
    }
  };


  // --------------------------------
  // دخول الغرفة
  // --------------------------------

  const enterRoom = (room) => {

    Alert.alert(
      'دخول الغرفة 🎙️',
      `${room.name}\n\nعدد الموجودين: ${
        room.users || 0
      }`
    );
  };


  // --------------------------------
  // إرسال هدية
  // --------------------------------

  const sendGift = async (
    giftName,
    price
  ) => {

    if (coins < price) {

      Alert.alert(
        'الرصيد غير كافٍ',
        'لا تملك عملات كافية'
      );

      return;
    }


    try {

      const currentUser =
        auth.currentUser;

      if (!currentUser) {
        return;
      }


      const newCoins =
        coins - price;


      await updateDoc(
        doc(
          db,
          'users',
          currentUser.uid
        ),
        {
          coins:
            newCoins,
        }
      );


      setCoins(
        newCoins
      );


      Alert.alert(
        'تم إرسال الهدية 🎁',
        `${giftName}\nالسعر: ${price.toLocaleString()}\nالرصيد المتبقي: ${newCoins.toLocaleString()}`
      );

    } catch (error) {

      console.log(
        'Gift error:',
        error
      );

      Alert.alert(
        'خطأ',
        'تعذر إرسال الهدية'
      );
    }
  };


  // --------------------------------
  // متجر العملات
  // --------------------------------

  const openStore = () => {

    Alert.alert(
      'متجر العملات 🪙',
      'المتجر تجريبي حاليًا.\nسيتم إضافة الشحن الحقيقي لاحقًا.'
    );
  };


  // --------------------------------
  // متجر VIP
  // --------------------------------

  const openVIP = () => {

    Alert.alert(
      'متجر VIP 👑',
      'سيتم إضافة مستويات VIP ومزاياها لاحقًا.'
    );
  };


  // --------------------------------
  // تسجيل الخروج
  // --------------------------------

  const logout = async () => {

    try {

      await auth.signOut();

      navigation.replace(
        'Login'
      );

    } catch (error) {

      Alert.alert(
        'خطأ',
        'تعذر تسجيل الخروج'
      );
    }
  };


  // --------------------------------
  // تحميل
  // --------------------------------

  if (loading) {

    return (

      <View
        style={
          styles.loadingContainer
        }
      >

        <ActivityIndicator
          size="large"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          جاري تحميل الحساب...
        </Text>

      </View>
    );
  }


  // --------------------------------
  // الواجهة
  // --------------------------------

  return (

    <View
      style={
        styles.container
      }
    >

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >


        {/* الحساب */}

        <View
          style={
            styles.profileCard
          }
        >

          <TouchableOpacity
            style={
              styles.avatar
            }
            onPress={
              pickAvatar
            }
          >

            {avatar ? (

              <Image
                source={{
                  uri: avatar,
                }}
                style={
                  styles.avatarImage
                }
              />

            ) : (

              <Text
                style={
                  styles.avatarText
                }
              >
                👤
              </Text>

            )}

          </TouchableOpacity>


          <View
            style={
              styles.profileInfo
            }
          >

            <Text
              style={
                styles.username
              }
            >
              {username}
            </Text>

            <Text
              style={
                styles.userId
              }
            >
              ID: {userId}
            </Text>

          </View>


          <TouchableOpacity
            style={
              styles.editButton
            }
            onPress={() => {

              setNewUsername(
                username
              );

              setEditVisible(
                true
              );

            }}
          >

            <Text
              style={
                styles.editButtonText
              }
            >
              تعديل
            </Text>

          </TouchableOpacity>

        </View>


        {/* صورة الحساب */}

        {uploadingImage && (

          <View
            style={
              styles.uploadBox
            }
          >

            <ActivityIndicator />

            <Text>
              جاري حفظ الصورة...
            </Text>

          </View>

        )}


        {/* العملات */}

        <View
          style={
            styles.coinsCard
          }
        >

          <View>

            <Text
              style={
                styles.smallTitle
              }
            >
              رصيد العملات
            </Text>

            <Text
              style={
                styles.coinsText
              }
            >
              🪙 {coins.toLocaleString()}
            </Text>

          </View>


          <TouchableOpacity
            style={
              styles.chargeButton
            }
            onPress={
              openStore
            }
          >

            <Text
              style={
                styles.chargeText
              }
            >
              شحن
            </Text>

          </TouchableOpacity>

        </View>


        {/* البحث */}

        <View
          style={
            styles.section
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            🔎 البحث عن مستخدم
          </Text>


          <View
            style={
              styles.searchRow
            }
          >

            <TextInput
              style={
                styles.searchInput
              }
              value={
                searchId
              }
              onChangeText={
                setSearchId
              }
              placeholder="اكتب ID المستخدم"
              keyboardType="numeric"
              textAlign="right"
            />


            <TouchableOpacity
              style={
                styles.searchButton
              }
              onPress={
                searchUser
              }
            >

              <Text
                style={
                  styles.buttonText
                }
              >
                بحث
              </Text>

            </TouchableOpacity>

          </View>

        </View>


        {/* الخدمات */}

        <View
          style={
            styles.buttonsGrid
          }
        >

          <TouchableOpacity
            style={
              styles.menuButton
            }
            onPress={
              createRoom
            }
          >

            <Text
              style={
                styles.menuIcon
              }
            >
              ➕
            </Text>

            <Text
              style={
                styles.menuText
              }
            >
              إنشاء غرفة
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            style={
              styles.menuButton
            }
            onPress={() =>
              setMicOn(!micOn)
            }
          >

            <Text
              style={
                styles.menuIcon
              }
            >
              {micOn
                ? '🎙️'
                : '🔇'}
            </Text>

            <Text
              style={
                styles.menuText
              }
            >
              {micOn
                ? 'إغلاق المايك'
                : 'فتح المايك'}
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            style={
              styles.menuButton
            }
            onPress={
              openVIP
            }
          >

            <Text
              style={
                styles.menuIcon
              }
            >
              👑
            </Text>

            <Text
              style={
                styles.menuText
              }
            >
              متجر VIP
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            style={
              styles.menuButton
            }
            onPress={() =>
              Alert.alert(
                'الهدايا 🎁',
                'اختر الهدية من قسم الهدايا بالأسفل'
              )
            }
          >

            <Text
              style={
                styles.menuIcon
              }
            >
              🎁
            </Text>

            <Text
              style={
                styles.menuText
              }
            >
              الهدايا
            </Text>

          </TouchableOpacity>

        </View>


        {/* الغرف */}

        <View
          style={
            styles.section
        
