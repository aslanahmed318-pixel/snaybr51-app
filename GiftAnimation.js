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

  const containerOpacity =
    useRef(
      new Animated.Value(0)
    ).current;

  const scale =
    useRef(
      new Animated.Value(0.4)
    ).current;

  const translateY =
    useRef(
      new Animated.Value(80)
    ).current;

  const glowScale =
    useRef(
      new Animated.Value(0.5)
    ).current;

  const glowOpacity =
    useRef(
      new Animated.Value(0)
    ).current;


  useEffect(() => {

    if (!visible) {
      return;
    }


    // إعادة القيم للبداية
    containerOpacity.setValue(0);
    scale.setValue(0.4);
    translateY.setValue(80);
    glowScale.setValue(0.5);
    glowOpacity.setValue(0);


    Animated.parallel([

      // ظهور التأثير
      Animated.timing(
        containerOpacity,
        {
          toValue: 1,
          duration: 300,
          easing: Easing.out(
            Easing.ease
          ),
          useNativeDriver: true,
        }
      ),

      // دخول الهدية
      Animated.spring(
        scale,
        {
          toValue: 1,
          friction: 5,
          tension: 70,
          useNativeDriver: true,
        }
      ),

      // صعود الهدية
      Animated.timing(
        translateY,
        {
          toValue: 0,
          duration: 600,
          easing: Easing.out(
            Easing.back(1.2)
          ),
          useNativeDriver: true,
        }
      ),

      // ظهور الوهج
      Animated.timing(
        glowOpacity,
        {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }
      ),

      Animated.timing(
        glowScale,
        {
          toValue: 1,
          duration: 600,
          easing: Easing.out(
            Easing.ease
          ),
          useNativeDriver: true,
        }
      ),

    ]).start();


    // نهاية التأثير
    const timer =
      setTimeout(() => {

        Animated.parallel([

          Animated.timing(
            containerOpacity,
            {
              toValue: 0,
              duration: 450,
              easing: Easing.in(
                Easing.ease
              ),
              useNativeDriver: true,
            }
          ),

          Animated.timing(
            scale,
            {
              toValue: 0.7,
              duration: 450,
              easing: Easing.in(
                Easing.ease
              ),
              useNativeDriver: true,
            }
          ),

          Animated.timing(
            translateY,
            {
              toValue: -40,
              duration: 450,
              easing: Easing.in(
                Easing.ease
              ),
              useNativeDriver: true,
            }
          ),

        ]).start(() => {

          if (onFinish) {
            onFinish();
          }

        });

      }, Math.max(duration - 500, 700));


    return () => {
      clearTimeout(timer);
    };

  }, [visible, duration, onFinish]);


  if (!visible) {
    return null;
  }


  return (

    <View
      pointerEvents="none"
      style={styles.overlay}
    >

      <Animated.View
        style={[
          styles.container,
          {
            opacity:
              containerOpacity,

            transform: [
              {
                translateY:
                  translateY,
              },
              {
                scale:
                  scale,
              },
            ],
          },
        ]}
      >

        {/* الوهج الخلفي */}

        <Animated.View
          style={[
            styles.glow,
            {
              opacity:
                glowOpacity,

              transform: [
                {
                  scale:
                    glowScale,
                },
              ],
            },
          ]}
        />


        {/* الهدية */}

        <View
          style={
            styles.giftCircle
          }
        >

          <Text
            style={
              styles.giftIcon
            }
          >
            {giftIcon}
          </Text>

        </View>


        {/* اسم الهدية */}

        <View
          style={
            styles.infoBox
          }
        >

          <Text
            style={
              styles.giftName
            }
          >
            {giftName}
          </Text>


          <Text
            style={
              styles.senderText
            }
          >
            أرسلها {senderName}
          </Text>

        </View>

      </Animated.View>

    </View>

  );

}


// ==========================================
// Styles
// ==========================================

const styles = StyleSheet.create({

  overlay: {
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


  container: {
    alignItems: 'center',
    justifyContent: 'center',

    minWidth: 190,
  },


  glow: {
    position: 'absolute',

    width: 190,
    height: 190,

    borderRadius: 95,

    backgroundColor:
      'rgba(255,215,0,0.18)',

    shadowColor:
      '#FFD700',

    shadowOffset: {
      width: 0,
      height: 0,
    },

    shadowOpacity: 0.9,

    shadowRadius: 35,

    elevation: 20,
  },


  giftCircle: {
    width: 125,
    height: 125,

    borderRadius: 62.5,

    backgroundColor:
      'rgba(255,255,255,0.96)',

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 3,

    borderColor:
      '#FFD700',

    shadowColor:
      '#000000',

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.25,

    shadowRadius: 15,

    elevation: 12,
  },


  giftIcon: {
    fontSize: 62,

    textAlign: 'center',
  },


  infoBox: {
    marginTop: 15,

    minWidth: 180,

    paddingHorizontal: 18,
    paddingVertical: 10,

    borderRadius: 16,

    backgroundColor:
      'rgba(20,20,20,0.90)',

    alignItems: 'center',

    shadowColor:
      '#000000',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.25,

    shadowRadius: 8,

    elevation: 8,
  },


  giftName: {
    color: '#FFD700',

    fontSize: 19,

    fontWeight: 'bold',

    textAlign: 'center',
  },


  senderText: {
    color: '#FFFFFF',

    fontSize: 13,

    marginTop: 4,

    textAlign: 'center',
  },

});
