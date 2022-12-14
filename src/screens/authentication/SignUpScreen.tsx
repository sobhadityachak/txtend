import { API, Auth, graphqlOperation } from "aws-amplify";
import * as React from 'react'
import { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useChatContext } from "stream-chat-expo";
import { useAuthContext } from "../../contexts/AuthContext1";

import { useNavigation, useRoute } from '@react-navigation/native';
import AppLoading from 'expo-app-loading';
import { Controller, ControllerFieldState, ControllerRenderProps, useForm, UseFormStateReturn } from "react-hook-form";
import * as ImagePicker from 'expo-image-picker';
import { AntDesign } from "@expo/vector-icons";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { getStreamToken } from "../../graphql/queries";

const NewSignUpScreen = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [setting, setSetting] = useState(false);
  const { setUserId } = useAuthContext();
  // const { setPicId } = useUserContext();
  const navigation = useNavigation();
  var [image, setImage] = useState(null);

  const { client } = useChatContext();

  const route = useRoute();

  const {
    control,
    handleSubmit,
    formState: { errors },

  } = useForm({
    defaultValues:{
      username: route?.params?.usrName
    }
  });

  const connectUser = async () => {
    // sign in with your backend and get the user token

    const userData = await Auth.currentAuthenticatedUser();
    const { sub, username, } = userData.attributes;

    const tokenResponse = await API.graphql(graphqlOperation(getStreamToken));
    const token = tokenResponse?.data?.getStreamToken;
    if (!token) {
      Alert.alert("Failed to creat ID check your connection and retry...!");
      return;
    } else console.warn(token);
    console.log(
      sub, name, username
    );
    await client.connectUser(
      {
        id: sub,
        name: name,
        // image: `${image}`,
        number: username,
        // "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/elon.png",
      },
      token //token dynamically generated from aws backend
      //client.devToken(sub)
    );

    const channel = client.channel("livestream", "public", { name: "Public" });
    await channel.watch();
    // const channels = client.channels();

    setUserId(sub);
    //  setUserImage()

  };
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    // console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
    // const { control } = useForm({
    //   defaultValues: {
    //     picID: image
    //   }
    // })
    // return (
    //   <Controller
    //     control={control}
    //     name="picID" render={
    //       function ({
    //         field, fieldState, formState, }: {
    //           field: ControllerRenderProps<{ picID: null; }, "picID">;
    //           fieldState: ControllerFieldState;
    //           formState: UseFormStateReturn<{ picID: null; }>;
    //         }): React.ReactElement<any, string | React.JSXElementConstructor<any>> {
    //         throw new Error("Function not implemented.");
    //       }} />
    // )
  };

  const signUp = async () => {
    
    // console.log(username)
    // navigate to the home page
    // navigation.goBack();
    try {
      // await Auth.forgotPasswordSubmit(
      //   route?.params?.usrName, 
      //   route?.params?.code, 
      //   route?.params?.password);
      // if (!connectUser()) return (
      //   <>
      //     <ActivityIndicator />
      //     <AppLoading />
      //   </>
      // );
      setSetting(true);
      connectUser();
      await Auth.signIn(route?.params?.usrName, route?.params?.password);
    } catch (e) {
      console.log(e.message)
    }
  };

  useEffect(() => {
    connectUser();
  }, []);

  return (
    <SafeAreaView >
      <ScrollView>
      <ImageBackground source={require('../../../assets/images/bckgnd.png')} style={styles.root}>
          <View style={{
            alignItems: "center",
            justifyContent: 'center'
          }}><Text style={{ color: '#3B71F3', fontSize: 25, fontWeight: 'bold', marginTop: 0,}}>
            Welcome to Txtend 
            </Text>
            <Text style={{ color: '#3B71F3', fontSize: 15, fontWeight: 'normal', marginTop: 5,}}>
            Thank you for trusting in us
            </Text>
            <Text style={{ color: '#3B71F3', fontSize: 15, fontWeight: 'bold', marginTop: 5,}}>
            Set up your Profile
            </Text>
          </View>
            <View style={styles.root1}>
 <View style={imageUploaderStyles.container}>
          {
            image && <Image source={{ uri: image }} style={{
              width: 200, height: 200,
              borderRadius: 70,

            }} />
          }

          <View style={imageUploaderStyles.uploadBtnContainer}>
            <TouchableOpacity onPress={pickImage} style={imageUploaderStyles.uploadBtn} >
              <Text>{image ? 'Edit' : 'Upload'} Image</Text>
              <AntDesign name="camera" size={20} color="black" />
            </TouchableOpacity>
          </View>

        </View>
        <CustomInput
          name="name"
          control={control}
          placeholder="Username for Txtend"
          rules={{
            required: 'Enter a User Name for Txtend',
            minLength: {
              value: 3,
              message: 'Name should be at least 3 characters long',
            },
            maxLength: {
              value: 24,
              message: 'Name should be max 24 characters long',
            },
          }} secureTextEntry={undefined} />

        <CustomInput
          name="username"
          control={control}
          placeholder="Enter your Phone number"
          rules={{
            required: 'Phone Number with county code is required for password verification',
            length: {

            },
            minLength: {
              value: 10,
              message: 'Phone number should be at least 10 characters long',
            },
            maxLength: {
              value: 15,
              message: 'Phone number should be max 15 characters long',
            },
          }} secureTextEntry={undefined} />
        {/* <CustomInput
                  name="email"
                  control={control}
                  placeholder="Email"
                  rules={{
                      required: 'Email is required',
                      pattern: { value: EMAIL_REGEX, message: 'Email is invalid' },
                  }} secureTextEntry={undefined}        /> */}
        {/* <CustomInput
          name="password-repeat"
          control={control}
          placeholder="Repeat Password"
          secureTextEntry
          rules={{
            validate: value => value === pwd || 'Password do not match',
          }}
        /> */}
<TouchableOpacity>
        <CustomButton
          text={setting ? 'Account Loading... ' : 'All Set! Enter'}
          onPress={handleSubmit(signUp)} bgColor={undefined} fgColor={undefined} />
          </TouchableOpacity>
          </View>
 </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    padding: 80,
    marginTop: 0,
    display: "flex",

    resizeMode: 'contain',
    //height:820,
    flex: 1,
  },
  root1: {
    backgroundColor: 'rgba(255,255 , 255, 0.6)',
    marginTop: 100,
    marginBottom: 110,
    marginHorizontal: -55,
    padding: 45,
    borderRadius: 35,
    paddingBottom: 70,
  },
  
  title: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    alignSelf: "center",
    marginVertical: 10,
  },
  subtitle: {
    color: "lightgrey",
    fontSize: 20,
    alignSelf: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#202225",
    marginVertical: 5,
    padding: 15,
    color: "white",
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#5964E8",
    alignItems: "center",
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  forgotPasswordText: {
    color: "#4CABEB",
    marginVertical: 5,
  },
  text: {
    color: "white",
    fontWeight: "bold",
    marginVertical: 5,
  },
});
const imageUploaderStyles = StyleSheet.create({
  container: {
    elevation: 2,
    height: 100,
    width: 100,
    backgroundColor: '#efefef',
    position: 'relative',
    borderRadius: 70,
    overflow: 'hidden',
    margin: 10,
    marginTop: -105,

    alignSelf:'center',
  },
  uploadBtnContainer: {
    opacity: 0.7,
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: 'lightgrey',
    width: '100%',
    height: '50%',
  },
  uploadBtn: {
    display: 'flex',
    alignItems: "center",
    justifyContent: 'center'
  }
})
export default NewSignUpScreen;


