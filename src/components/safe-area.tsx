import { MaxContentWidth, Spacing } from "@/constants/theme";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "./themed-view";


export  function SafeArea({children}: React.PropsWithChildren<{}>) {
  const safeInsets = useSafeAreaInsets();
  
  const contentPlatformStyle = Platform.select({
      android: {
        paddingTop: safeInsets.top,
        paddingLeft: safeInsets.left,
        paddingRight: safeInsets.right,
        // paddingBottom: insets.bottom,
      },
      web: {
        paddingTop: Spacing.six,
        paddingBottom: Spacing.four,
      },
    });
  return (
   <ThemedView style={[style.container, contentPlatformStyle]}> 
        {children}
   </ThemedView>
  )
}

const style = StyleSheet.create({
    container: {
        flex: 1,
        maxWidth: MaxContentWidth,
        alignSelf: 'center',
        width: '100%',
    }
})