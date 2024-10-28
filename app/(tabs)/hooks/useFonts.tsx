import * as Font from 'expo-font';

const useFonts = async () => {
  await Font.loadAsync({
    indie: require('../../../assets/fonts/Inter-regular.ttf'),
  });
};

export default useFonts;
