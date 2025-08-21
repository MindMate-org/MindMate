# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Expo specific rules
-keep class expo.modules.** { *; }
-keep class expo.interfaces.** { *; }

# React Native specific rules
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.reactexecutor.** { *; }
-dontwarn com.facebook.react.**

# SQLite rules (for expo-sqlite)
-keep class org.sqlite.** { *; }
-keep class org.sqlite.database.** { *; }

# Keep JS bundle and source maps
-keep class **.BuildConfig { *; }

# Lucide React Native icons
-keep class com.horcrux.svg.** { *; }

# Add any project specific keep options here:
