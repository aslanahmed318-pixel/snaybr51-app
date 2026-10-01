import React, { useEffect, useRef } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';


export default function GiftAnimation({
  visible = false,
  giftIcon = '🎁',
  giftName = 'هدية',
  senderName = 'مستخدم',
  duration = 2200,
  onFinish,
}) {

  const opacity = useRef(
    new Animated.Value(0)
  ).current;

  const scale = useRef(
    new Animated.Value(0.4)
  ).current;

  const translateY = useRef(
    new Animated.Value(80)
  ).current;

  const rotate = useRef(
    new Animated.Value(0)
  ).current;

  const textOpacity = useRef(
    new Animated.Value(0)
  ).current;


  useEffect(() => {

    if (!visible) {
      return;
    }


    // إعادة ضبط الحركة
    opacity.setValue(0);
    scale.setValue(0.4);
    translateY.setValue(80);
    rotate.setValue(0);
    textOpacity.setValue(0);


    Animated.parallel([

      Animated.sequence([

        Animated.timing(
          opacity,
          {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }
        ),

        Animated.delay(
          Math.max(300, duration - 800)
        ),

        Animated.timing(
          opacity,
          {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }
        ),

      ]),


      Animated.spring(
        scale,
        {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }
      ),


      Animated.timing(
        translateY,
        {
          toValue: 0,
          duration: 500,
          easing: Easing.out(
            Easing.back(1.5)
          ),
          useNativeDriver: true,
        }
      ),


      Animated.sequence([

        Animated.timing(
          rotate,
          {
            toValue: 1,
            duration: 350,
            easing: Easing.inOut(
              Easing.ease
            ),
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          rotate,
          {
            toValue: -1,
            duration: 350,
            easing: Easing.inOut(
              Easing.ease
            ),
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          rotate,
          {
            toValue: 0,
            duration: 350,
            easing: Easing.inOut(
              Easing.ease
            ),
            useNativeDriver: true,
          }
        ),

      ]),


      Animated.sequence([

        Animated.delay(250),

        Animated.timing(
          textOpacity,
          {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }
        ),

        Animated.delay(
          Math.max(200, duration - 1100)
        ),

        Animated.timing(
          textOpacity,
          {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }
        ),

      ]),

    ]).start(() => {

      if (onFinish) {
        onFinish();
      }

    });

  }, [
    visible,
    duration,
    giftIcon,
    giftName,
    senderName,
    onFinish,
  ]);


  if (!visible) {
    return null;
  }


  const rotateInterpolate =
    rotate.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [
        '-8deg',
        '0deg',
        '8deg',
      ],
    });


  return (

    <View
      pointerEvents="none"
      style={styles.container}
    >

      <Animated.View
        style={[
          styles.card,
          {
            opacity,
            transform: [
              {
                translateY,
              },
              {
                scale,
              },
              {
                rotate:
                  rotateInterpolate,
              },
            ],
          },
        ]}
      >

        <View
          style={styles.glow}
        />

        <Text
          style={styles.giftIcon}
        >
          {giftIcon}
        </Text>


        <Animated.View
          style={{
            opacity: textOpacity,
          }}
        >

          <Text
            style={styles.giftName}
          >
            {giftName}
          </Text>


          <Text
            style={styles.senderText}
          >
            🎁 أرسلها {senderName}
          </Text>

        </Animated.View>

      </Animated.View>

    </View>

  );

}


const styles =
  StyleSheet.create({

    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,

      alignItems: 'center',
      justifyContent: 'center',

      zIndex: 9999,

      elevation: 9999,
    },


    card: {
      width: 230,
      minHeight: 190,

      borderRadius: 30,

      backgroundColor:
        'rgba(20,20,30,0.94)',

      borderWidth: 2,
      borderColor:
        'rgba(255,215,90,0.8)',

      alignItems: 'center',
      justifyContent: 'center',

      paddingVertical: 25,
      paddingHorizontal: 20,

      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.35,
      shadowRadius: 15,

      elevation: 15,

      overflow: 'hidden',
    },


    glow: {
      position: 'absolute',

      width: 170,
      height: 170,

      borderRadius: 85,

      backgroundColor:
        'rgba(255,200,50,0.10)',
    },


    giftIcon: {
      fontSize: 72,

      marginBottom: 10,

      textAlign: 'center',
    },


    giftName: {
      color: '#ffffff',

      fontSize: 21,

      fontWeight: 'bold',

      textAlign: 'center',

      marginTop: 5,
    },


    senderText: {
      color: '#ffd75a',

      fontSize: 14,

      fontWeight: '600',

      textAlign: 'center',

      marginTop: 8,
    },

  });
