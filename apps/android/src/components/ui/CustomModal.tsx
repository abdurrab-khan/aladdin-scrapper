import React from "react";
import { Modal, View, StyleSheet } from "react-native";
import { app } from "../../style/index";

interface CustomModalProps {
  isVisible: boolean;
  children: React.ReactElement;
  onToggle: (isVisible: boolean) => void;
}

function CustomModal({ isVisible, children, onToggle }: CustomModalProps) {
  return (
    <Modal
      role="dialog"
      transparent
      visible={isVisible}
      onRequestClose={() => {
        onToggle(false);
      }}
    >
      <View style={styles.modelContainer}>
        <View
          style={[
            { maxHeight: 400 },
            styles.modelView,
            app.darkContainer,
            app.darkBorder,
          ]}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modelContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a0a0a8c",
  },
  modelView: {
    padding: 8,
    width: 324,
    minHeight: 80,
    borderRadius: 12,
  },
});

export default CustomModal;
