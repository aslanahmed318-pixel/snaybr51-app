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

      const currentUser =
        auth.currentUser;

      if (!currentUser) {

        navigation.replace('Login');

        return;
      }

      try {

        await loadUser();

        const roomsRef =
          collection(
            db,
            'users',
            currentUser.uid,
            'rooms'
          );

        const roomsQuery =
          query(
            roomsRef,
            orderBy(
              'createdAt',
              'desc'
            )
          );

        unsubscribeRooms =
          onSnapshot(
            roomsQuery,
            (snapshot) => {

              const loadedRooms =
                snapshot.docs.map(
                  (item) => ({
                    id: item.id,
                    ...item.data(),
                  })
                );

              setRooms(
                loadedRooms
              );
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
      collection(
        db,
        'users'
      );

    let q =
      query(
        usersRef,
        where(
          'userId',
          '==',
          newId
        )
      );

    let result =
      await getDocs(q);

    while (!result.empty) {

      newId =
        generateUserId();

      q =
        query(
          usersRef,
          where(
            'userId',
            '==',
            newId
          )
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

        navigation.replace(
          'Login'
        );

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
          data.userId ||
          ''
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

        setCoins(
          2000000
        );

        setAvatar(
          ''
        );
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
        await ImagePicker
          .requestMediaLibraryPermissionsAsync();

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
        await ImagePicker
          .launchImageLibraryAsync({

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

      setUploadingImage(
        true
      );

      const response =
        await fetch(
          imageUri
        );

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

      setUploadingImage(
        false
      );
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

      setUsername(
        name
      );

      setEditVisible(
        false
      );

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
        collection(
          db,
          'users'
        );

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
  // إنشاء غرفة
  // --------------------------------

  const createRoom = async () => {

    try {

      const currentUser =
        auth.currentUser;

      if (!currentUser) {
        return;
      }

      const roomNumber =
        Date.now()
          .toString()
          .slice(-6);

      const room = {

        name:
          `غرفة ${username}`,

        roomNumber:
          roomNumber,

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


        {/* رفع الصورة */}

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
              setMicOn(
                !micOn
              )
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
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            🎙️ الغرف
          </Text>


          {rooms.length === 0 ? (

            <View
              style={
                styles.emptyBox
              }
            >

              <Text
                style={
                  styles.emptyText
                }
              >
                لا توجد غرف حاليًا
              </Text>

            </View>

          ) : (

            rooms.map(
              (room) => (

                <TouchableOpacity
                  key={
                    room.id
                  }
                  style={
                    styles.roomCard
                  }
                  onPress={() =>
                    enterRoom(
                      room
                    )
                  }
                >

                  <View
                    style={
                      styles.roomIcon
                    }
                  >
                    🎙️
                  </View>


                  <View
                    style={
                      styles.roomInfo
                    }
                  >

                    <Text
                      style={
                        styles.roomName
                      }
                    >
                      {room.name ||
                        'غرفة صوتية'}
                    </Text>

                    <Text
                      style={
                        styles.roomDetails
                      }
                    >
                      👤 {room.users || 0} مستخدم
                    </Text>

                    {room.roomNumber && (

                      <Text
                        style={
                          styles.roomDetails
                        }
                      >
                        رقم الغرفة: {
                          room.roomNumber
                        }
                      </Text>

                    )}

                  </View>


                  <Text
                    style={
                      styles.enterText
                    }
                  >
                    دخول
                  </Text>

                </TouchableOpacity>

              )
            )

          )}

        </View>


        {/* الهدايا */}

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
            🎁 الهدايا
          </Text>


          <View
            style={
              styles.giftsGrid
            }
          >

            <TouchableOpacity
              style={
                styles.giftButton
              }
              onPress={() =>
                sendGift(
                  'وردة 🌹',
                  100
                )
              }
            >

              <Text
                style={
                  styles.giftIcon
                }
              >
                🌹
              </Text>

              <Text
                style={
                  styles.giftName
                }
              >
                وردة
              </Text>

              <Text
                style={
                  styles.giftPrice
                }
              >
                🪙 100
              </Text>

            </TouchableOpacity>


            <TouchableOpacity
              style={
                styles.giftButton
              }
              onPress={() =>
                sendGift(
                  'قلب ❤️',
                  500
                )
              }
            >

              <Text
                style={
                  styles.giftIcon
                }
              >
                ❤️
              </Text>

              <Text
                style={
                  styles.giftName
                }
              >
                قلب
              </Text>

              <Text
                style={
                  styles.giftPrice
                }
              >
                🪙 500
              </Text>

            </TouchableOpacity>


            <TouchableOpacity
              style={
                styles.giftButton
              }
              onPress={() =>
                sendGift(
                  'تاج 👑',
                  1000
                )
              }
            >

              <Text
                style={
                  styles.giftIcon
                }
              >
                👑
              </Text>

              <Text
                style={
                  styles.giftName
                }
              >
                تاج
              </Text>

              <Text
                style={
                  styles.giftPrice
                }
              >
                🪙 1,000
              </Text>

            </TouchableOpacity>


            <TouchableOpacity
              style={
                styles.giftButton
              }
              onPress={() =>
                sendGift(
                  'ماسة 💎',
                  5000
                )
              }
            >

              <Text
                style={
                  styles.giftIcon
                }
              >
                💎
              </Text>

              <Text
                style={
                  styles.giftName
                }
              >
                ماسة
              </Text>

              <Text
                style={
                  styles.giftPrice
                }
              >
                🪙 5,000
              </Text>

            </TouchableOpacity>

          </View>

        </View>


        {/* تسجيل الخروج */}

        <TouchableOpacity
          style={
            styles.logoutButton
          }
          onPress={
            logout
          }
        >

          <Text
            style={
              styles.logoutText
            }
          >
            تسجيل الخروج
          </Text>

        </TouchableOpacity>


      </ScrollView>


      {/* نافذة تعديل الحساب */}

      <Modal
        visible={
          editVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setEditVisible(
            false
          )
        }
      >

        <View
          style={
            styles.modalOverlay
          }
        >

          <View
            style={
              styles.modalBox
            }
          >

            <Text
              style={
                styles.modalTitle
              }
            >
              تعديل الحساب
            </Text>


            <Text
              style={
                styles.inputLabel
              }
            >
              اسم الحساب
            </Text>


            <TextInput
              style={
                styles.nameInput
              }
              value={
                newUsername
              }
              onChangeText={
                setNewUsername
              }
              placeholder="اكتب اسم الحساب"
              textAlign="right"
              maxLength={30}
            />


            <View
              style={
                styles.modalButtons
              }
            >

              <TouchableOpacity
                style={
                  styles.cancelButton
                }
                onPress={() =>
                  setEditVisible(
                    false
                  )
                }
              >

                <Text
                  style={
                    styles.cancelText
                  }
                >
                  إلغاء
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={
                  styles.saveButton
                }
                onPress={
                  saveProfile
                }
              >

                <Text
                  style={
                    styles.saveText
                  }
                >
                  حفظ
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </View>

      </Modal>

    </View>
  );
}


// ==================================
// Styles
// ==================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f6fa',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },


  // الحساب

  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eeeeee',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  avatarText: {
    fontSize: 32,
  },

  profileInfo: {
    flex: 1,
    marginHorizontal: 12,
  },

  username: {
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'right',
  },

  userId: {
    marginTop: 5,
    fontSize: 13,
    color: '#777777',
    textAlign: 'right',
  },

  editButton: {
    backgroundColor: '#eeeeee',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },

  editButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },


  // الصورة

  uploadBox: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },


  // العملات

  coinsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    elevation: 2,
  },

  smallTitle: {
    fontSize: 13,
    color: '#777777',
    textAlign: 'right',
  },

  coinsText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
  },

  chargeButton: {
    backgroundColor: '#222222',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 14,
  },

  chargeText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },


  // الأقسام

  section: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
    textAlign: 'right',
  },


  // البحث

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 13,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
  },

  searchButton: {
    backgroundColor: '#222222',
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },


  // الخدمات

  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  menuButton: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },

  menuIcon: {
    fontSize: 30,
    marginBottom: 8,
  },

  menuText: {
    fontSize: 14,
    fontWeight: 'bold',
  },


  // الغرف

  emptyBox: {
    padding: 25,
    alignItems: 'center',
  },

  emptyText: {
    color: '#888888',
    fontSize: 15,
  },

  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },

  roomIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eeeeee',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
  },

  roomInfo: {
    flex: 1,
    marginHorizontal: 12,
  },

  roomName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },

  roomDetails: {
    marginTop: 4,
    color: '#777777',
    fontSize: 12,
    textAlign: 'right',
  },

  enterText: {
    fontWeight: 'bold',
    fontSize: 14,
  },


  // الهدايا

  giftsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  giftButton: {
    width: '48%',
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 10,
  },

  giftIcon: {
    fontSize: 34,
  },

  giftName: {
    marginTop: 6,
    fontWeight: 'bold',
  },

  giftPrice: {
    marginTop: 4,
    color: '#777777',
    fontSize: 12,
  },


  // تسجيل الخروج

  logoutButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 20,
  },

  logoutText: {
    fontWeight: 'bold',
    fontSize: 16,
  },


  // نافذة التعديل

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  modalBox: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },

  nameInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 13,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
  },

  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#eeeeee',
    borderRadius: 13,
    paddingVertical: 13,
    alignItems: 'center',
  },

  cancelText: {
    fontWeight: 'bold',
  },

  saveButton: {
    flex: 1,
    backgroundColor: '#222222',
    borderRadius: 13,
    paddingVertical: 13,
    alignItems: 'center',
  },

  saveText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },

});
