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
} from 'react-native';

import { auth, db } from './firebase';

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState('مستخدم جديد');
  const [userId, setUserId] = useState('');
  const [coins, setCoins] = useState(2000000);

  const [searchId, setSearchId] = useState('');
  const [micOn, setMicOn] = useState(true);

  const [rooms, setRooms] = useState([
    {
      id: '1001',
      name: 'الغرفة الرئيسية',
      users: 12,
    },
    {
      id: '1002',
      name: 'غرفة الأصدقاء',
      users: 7,
    },
  ]);

  // --------------------------------
  // تحميل بيانات المستخدم
  // --------------------------------

  useEffect(() => {
    loadUser();
  }, []);

  const generateUserId = () => {
    return String(Math.floor(1000000 + Math.random() * 9000000));
  };

  const createUniqueUserId = async () => {
    let newId = generateUserId();

    const usersRef = collection(db, 'users');

    let q = query(
      usersRef,
      where('userId', '==', newId)
    );

    let result = await getDocs(q);

    while (!result.empty) {
      newId = generateUserId();

      q = query(
        usersRef,
        where('userId', '==', newId)
      );

      result = await getDocs(q);
    }

    return newId;
  };

  const loadUser = async () => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        Alert.alert(
          'تنبيه',
          'يجب تسجيل الدخول أولاً'
        );

        navigation.replace('Login');
        return;
      }

      const userRef = doc(
        db,
        'users',
        currentUser.uid
      );

      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();

        setUsername(
          data.username || 'مستخدم جديد'
        );

        setUserId(
          data.userId || ''
        );

        setCoins(
          typeof data.coins === 'number'
            ? data.coins
            : 2000000
        );
      } else {
        const newUserId =
          await createUniqueUserId();

        const newUser = {
          uid: currentUser.uid,

          username:
            currentUser.displayName ||
            'مستخدم جديد',

          email:
            currentUser.email || '',

          userId: newUserId,

          coins: 2000000,

          createdAt:
            new Date().toISOString(),
        };

        await setDoc(
          userRef,
          newUser
        );

        setUsername(newUser.username);
        setUserId(newUser.userId);
        setCoins(2000000);
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
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // البحث عن مستخدم
  // --------------------------------

  const searchUser = async () => {
    const id = searchId.trim();

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

      const q = query(
        usersRef,
        where('userId', '==', id)
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
  // إنشاء غرفة
  // --------------------------------

  const createRoom = () => {
    const newRoom = {
      id: String(
        1000 + rooms.length + 1
      ),

      name:
        `غرفتي الجديدة ${
          rooms.length + 1
        }`,

      users: 1,
    };

    setRooms([
      ...rooms,
      newRoom,
    ]);

    Alert.alert(
      'تم إنشاء الغرفة',
      `تم إنشاء الغرفة برقم ${newRoom.id}`
    );
  };

  // --------------------------------
  // دخول الغرفة
  // --------------------------------

  const enterRoom = (room) => {
    Alert.alert(
      'دخول الغرفة',
      `تم اختيار ${room.name}\nID: ${room.id}`
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
      const newCoins =
        coins - price;

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
          coins: newCoins,
        }
      );

      setCoins(newCoins);

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
  // تعديل الحساب
  // --------------------------------

  const editProfile = () => {
    Alert.alert(
      'تعديل الحساب',
      `اسم الحساب الحالي:\n${username}\n\nID:\n${userId}\n\nسيتم إضافة تعديل الاسم والصورة لاحقًا.`
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
  // شاشة التحميل
  // --------------------------------

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
        />

        <Text style={styles.loadingText}>
          جاري تحميل الحساب...
        </Text>
      </View>
    );
  }

  // --------------------------------
  // الواجهة الرئيسية
  // --------------------------------

  return (
    <View style={styles.container}>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* الحساب */}

        <View style={styles.profileCard}>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              👤
            </Text>
          </View>

          <View style={styles.profileInfo}>

            <Text style={styles.username}>
              {username}
            </Text>

            <Text style={styles.userId}>
              ID: {userId}
            </Text>

          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={editProfile}
          >
            <Text style={styles.editButtonText}>
              تعديل
            </Text>
          </TouchableOpacity>

        </View>

        {/* العملات */}

        <View style={styles.coinsCard}>

          <View>

            <Text style={styles.smallTitle}>
              رصيد العملات
            </Text>

            <Text style={styles.coinsText}>
              🪙 {coins.toLocaleString()}
            </Text>

          </View>

          <TouchableOpacity
            style={styles.chargeButton}
            onPress={openStore}
          >
            <Text style={styles.chargeText}>
              شحن
            </Text>
          </TouchableOpacity>

        </View>

        {/* البحث */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            🔎 البحث عن مستخدم
          </Text>

          <View style={styles.searchRow}>

            <TextInput
              style={styles.searchInput}
              value={searchId}
              onChangeText={
                setSearchId
              }
              placeholder="اكتب ID المستخدم"
              keyboardType="numeric"
              textAlign="right"
            />

            <TouchableOpacity
              style={styles.searchButton}
              onPress={searchUser}
            >
              <Text style={styles.buttonText}>
                بحث
              </Text>
            </TouchableOpacity>

          </View>

        </View>

        {/* أزرار الخدمات */}

        <View style={styles.buttonsGrid}>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={createRoom}
          >
            <Text style={styles.menuIcon}>
              ➕
            </Text>

            <Text style={styles.menuText}>
              إنشاء غرفة
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() =>
              setMicOn(!micOn)
            }
          >
            <Text style={styles.menuIcon}>
              {micOn
                ? '🎙️'
                : '🔇'}
            </Text>

            <Text style={styles.menuText}>
              {micOn
                ? 'إغلاق المايك'
                : 'فتح المايك'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={openVIP}
          >
            <Text style={styles.menuIcon}>
              👑
            </Text>

            <Text style={styles.menuText}>
              متجر VIP
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() =>
              Alert.alert(
                'الهدايا 🎁',
                'اختر الهدية من قسم الهدايا بالأسفل'
              )
            }
          >
            <Text style={styles.menuIcon}>
              🎁
            </Text>

            <Text style={styles.menuText}>
              الهدايا
            </Text>
          </TouchableOpacity>

        </View>

        {/* الغرف */}

        <View style={styles.section}>

          <View style={styles.sectionHeader}>

            <Text style={styles.sectionTitle}>
              🎙️ الغرف الصوتية
            </Text>

            <TouchableOpacity
              onPress={createRoom}
            >
              <Text style={styles.createText}>
                + إنشاء
              </Text>
            </TouchableOpacity>

          </View>

          {rooms.map((room) => (

            <TouchableOpacity
              key={room.id}
              style={styles.roomCard}
              onPress={() =>
                enterRoom(room)
              }
            >

              <View style={styles.roomIcon}>
                <Text style={styles.roomIconText}>
                  🎙️
                </Text>
              </View>

              <View style={styles.roomInfo}>

                <Text style={styles.roomName}>
                  {room.name}
                </Text>

                <Text style={styles.roomDetails}>
                  ID: {room.id} • 👥 {room.users}
                </Text>

              </View>

              <Text style={styles.enterText}>
                دخول
              </Text>

            </TouchableOpacity>

          ))}

        </View>

        {/* الهدايا */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            🎁 الهدايا
          </Text>

          <Text style={styles.subTitle}>
            هدايا عادية
          </Text>

          <View style={styles.giftsRow}>

            <TouchableOpacity
              style={styles.giftCard}
              onPress={() =>
                sendGift(
                  'وردة 🌹',
                  100
                )
              }
            >
              <Text style={styles.giftIcon}>
                🌹
              </Text>

              <Text style={styles.giftName}>
                وردة
              </Text>

              <Text style={styles.giftPrice}>
                100 🪙
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.giftCard}
              onPress={() =>
                sendGift(
                  'قلب ❤️',
                  500
                )
              }
            >
              <Text style={styles.giftIcon}>
                ❤️
              </Text>

              <Text style={styles.giftName}>
                قلب
              </Text>

              <Text style={styles.giftPrice}>
                500 🪙
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.giftCard}
              onPress={() =>
                sendGift(
                  'نجمة ⭐',
                  1000
                )
              }
            >
              <Text style={styles.giftIcon}>
                ⭐
              </Text>

              <Text style={styles.giftName}>
                نجمة
              </Text>

              <Text style={styles.giftPrice}>
                1,000 🪙
              </Text>
            </TouchableOpacity>

          </View>

          <Text style={styles.subTitle}>
            هدايا مخصصة
          </Text>

          <TouchableOpacity
            style={styles.specialGift}
            onPress={() =>
              sendGift(
                'هدية مخصصة 🎁',
                5000
              )
            }
          >

            <Text style={styles.specialGiftIcon}>
              🎁
            </Text>

            <View>

              <Text style={styles.specialGiftTitle}>
                هدية مخصصة
              </Text>

              <Text style={styles.specialGiftPrice}>
                5,000 🪙
              </Text>

            </View>

          </TouchableOpacity>

          <Text style={styles.subTitle}>
            هدايا الحظ
          </Text>

          <TouchableOpacity
            style={styles.luckyGift}
            onPress={() =>
              sendGift(
                'هدية الحظ 🍀',
                10000
              )
            }
          >

            <Text style={styles.luckyIcon}>
              🍀
            </Text>

            <View>

              <Text style={styles.specialGiftTitle}>
                هدية الحظ
              </Text>

              <Text style={styles.specialGiftPrice}>
                10,000 🪙
              </Text>

            </View>

          </TouchableOpacity>

        </View>

        {/* المتاجر */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            🛍️ المتاجر
          </Text>

          <TouchableOpacity
            style={styles.storeButton}
            onPress={openVIP}
          >

            <Text style={styles.storeIcon}>
              👑
            </Text>

            <Text style={styles.storeText}>
              متجر VIP
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.storeButton}
            onPress={openStore}
          >

            <Text style={styles.storeIcon}>
              🪙
            </Text>

            <Text style={styles.storeText}>
              متجر شحن العملات
            </Text>

          </TouchableOpacity>

        </View>

        {/* تسجيل الخروج */}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
        >
          <Text style={styles.logoutText}>
            تسجيل الخروج
          </Text>
        </TouchableOpacity>

      </ScrollView>

    </View>
  );
}

// --------------------------------
// Styles
// --------------------------------

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },

  content: {
    padding: 15,
    paddingBottom: 40,
  },

  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 27,
  },

  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },

  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  userId: {
    color: '#777',
    marginTop: 5,
  },

  editButton: {
    backgroundColor: '#222',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  coinsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  smallTitle: {
    color: '#777',
    fontSize: 13,
  },

  coinsText: {
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 5,
  },

  chargeButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 9,
  },

  chargeText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  section: {
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  subTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
    color: '#555',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 13,
    fontSize: 16,
  },

  searchButton: {
    backgroundColor: '#2196f3',
    padding: 14,
    borderRadius: 10,
    marginLeft: 8,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  menuButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 10,
  },

  menuIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  menuText: {
    fontSize: 15,
    fontWeight: 'bold',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  createText: {
    color: '#2196f3',
    fontWeight: 'bold',
    fontSize: 15,
  },

  roomCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  roomIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e9f3ff',
    alignItems: 'center',
    j
