import { ToastAndroid } from "react-native";

const toast = (message: string, duration: number = ToastAndroid.SHORT) => {
  ToastAndroid.show(message, duration);
};

export default toast;
