import React, { Component } from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import { BlurView } from '@candlefinance/blur-view';

export default function Menu() {
  return (
      <BlurView
        blurTintColor="#ff006780" // has to be hex with opacity
        colorTintOpacity={0.2}
        blurRadius={10}
        style={styles.top}
      />
    );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center"
  },
  top: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  }
});