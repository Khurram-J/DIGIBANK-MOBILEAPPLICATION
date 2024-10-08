import React, { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, Alert, Keyboard } from "react-native";
import Input from "../../components/TextInput";
import InputWithIcon from "../../components/TextInputWithIcon";
import { Color } from "../../GlobalStyles";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import API_BASE_URL from "../../config";
import { Entypo } from "@expo/vector-icons";
import Button from "../../components/Button";
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import AsyncStorage from "@react-native-async-storage/async-storage";

const Registration = ({ route }) => {
  const navigation = useNavigation();
  const rnBiometrics = new ReactNativeBiometrics();

  const {
    source,
    email,
    mobileNumber,
    cnic,
    accountNumber,
    firstName,
    lastName,
  } = route.params || {};

  const [main, setMain] = useState(true);
  const [initialForm, setInitialForm] = useState({
    cnic: "",
    mobile: "",
    accountNumber: "",
  });
  const [returnedData, setReturnedData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [finalForm, setFinalForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [nextLoading, setNextLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const [hasFingerprint, setHasFingerprint] = useState(false);
  const [hasFaceDetection, setHasFaceDetection] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);

  const checkHardwareSupport = async () => {
    rnBiometrics.isSensorAvailable()
      .then((resultObject) => {
        const { available, biometryType } = resultObject

        if (available && biometryType === BiometryTypes.TouchID) {
          setHasFingerprint(true);
        } else if (available && biometryType === BiometryTypes.FaceID) {
          setHasFaceDetection(true);
        } else if (available && biometryType === BiometryTypes.Biometrics) {
          setHasBiometrics(true);
        }
      });
  };

  useEffect(() => {
    checkHardwareSupport();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setMain(true);
    }, [])
  );

  const handleChange = (name, value, setState) => {
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleNext = async () => {
    if (
      initialForm.cnic === "" ||
      initialForm.mobile === "" ||
      initialForm.accountNumber === ""
    ) {
      Alert.alert("Error", "Please enter all the fields");
    } else {
      setNextLoading(true);

      const registrationData = {
        globalId: {
          cnicNumber: initialForm.cnic,
        },
        account: {
          accountNumber: initialForm.accountNumber,
        },
        customer: {
          mobileNumber: initialForm.mobile,
        },
      };

      try {
        const response = await axios.post(
          `${API_BASE_URL}/v1/customer/signup`,
          registrationData
        );
        const dto = response.data;

        if (dto && dto.success && dto.data) {
          setReturnedData({
            firstName: dto.data.customer.firstName,
            lastName: dto.data.customer.lastName,
            email: dto.data.email,
          });

          setMain(false);
        } else {
          if (dto.message) {
            Alert.alert("Error", dto.message);
          } else if (dto.errors && dto.errors.length > 0) {
            Alert.alert("Error", dto.errors);
          }
        }
      } catch (error) {
        if (error.response) {
          const statusCode = error.response.status;

          if (statusCode === 404) {
            Alert.alert("Error", "Server timed out. Try again later!");
          } else if (statusCode === 503) {
            Alert.alert(
              "Error",
              "Service unavailable. Please try again later."
            );
          } else if (statusCode === 400) {
            Alert.alert("Error", error.response.data.data.errors[0]);
          } else {
            Alert.alert("Error", error.message);
          }
        } else if (error.request) {
          Alert.alert(
            "Error",
            "No response from the server. Please check your connection."
          );
        } else {
          Alert.alert("Error", error.message);
        }
      } finally {
        setNextLoading(false);
      }
    }
  };

  const handleOTP = async () => {
    if (initialForm.mobile === "" || returnedData.email === "") {
      Alert.alert("Error", "Unexpected error occured. Try again later");
    } else {
      setOtpLoading(true);

      const otpDeliveryMethod = await AsyncStorage.getItem('otpDeliveryMethod');

      const otpData = {
        mobileNumber: initialForm.mobile,
        email: returnedData.email,
        reason: "fund transfer",
        deliveryPreference: otpDeliveryMethod ? otpDeliveryMethod : "EMAIL"
      };

      try {
        const response = await axios.post(
          `${API_BASE_URL}/v1/otp/createOTP`,
          otpData
        );
        const dto = response.data;

        if (dto && dto.success && dto.data) {
          navigation.navigate("OTP", {
            source: "registration",
            email: returnedData.email,
            mobileNumber: initialForm.mobile,
            cnic: initialForm.cnic,
            accountNumber: initialForm.accountNumber,
            firstName: returnedData.firstName,
            lastName: returnedData.lastName,
          });
        } else {
          if (dto.message) {
            Alert.alert("Error", dto.message);
          } else if (dto.errors && dto.errors.length > 0) {
            Alert.alert("Error", dto.error);
          }
        }
      } catch (error) {
        if (error.response) {
          const statusCode = error.response.status;

          if (statusCode === 404) {
            Alert.alert("Error", "Server timed out. Try again later!");
          } else if (statusCode === 503) {
            Alert.alert(
              "Error",
              "Service unavailable. Please try again later."
            );
          } else if (statusCode === 400) {
            Alert.alert("Error", error.response.data.data.errors[0]);
          } else {
            Alert.alert("Error", error.message);
          }
        } else if (error.request) {
          Alert.alert(
            "Error",
            "No response from the server. Please check your connection."
          );
        } else {
          Alert.alert("Error", error.message);
        }
      } finally {
        setOtpLoading(false);
      }
    }
  };

  const handleRegister = async () => {
    if (
      finalForm.username === "" ||
      finalForm.password === "" ||
      finalForm.confirmPassword === ""
    ) {
      Alert.alert("Error", "Please enter all the fields");
    } else {
      if (finalForm.password !== finalForm.confirmPassword) {
        Alert.alert("Error", "Password do not match");
      } else {
        setRegisterLoading(true);

        const userData = {
          mobileNumber: mobileNumber,
          firstName: firstName,
          lastName: lastName,
          cnic: cnic,
          email: email,
          userName: finalForm.username,
          password: finalForm.password,
          accountDto: {
            accountNumber: accountNumber,
          },
        };

        try {
          const response = await axios.post(
            `${API_BASE_URL}/v1/customer/register`,
            userData
          );
          const dto = response.data;
          console.log(dto);

          if (dto && dto.success && dto.data) {
            Alert.alert("Success", dto.message);

            setTimeout(() => {
              if (hasFaceDetection || hasFingerprint || hasBiometrics) {
                navigation.navigate("ChooseSecurity", { customerId: dto.data.id });
              } else {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            }, 1000);
          } else {
            if (dto.message) {
              Alert.alert("Error", dto.message);
            } else if (dto.errors && dto.errors.length > 0) {
              Alert.alert("Error", dto.error);
            }
          }
        } catch (error) {
          if (error.response) {
            const statusCode = error.response.status;

            if (statusCode === 404) {
              Alert.alert("Error", "Server timed out. Try again later!");
            } else if (statusCode === 503) {
              Alert.alert(
                "Error",
                "Service unavailable. Please try again later."
              );
            } else if (statusCode === 400) {
              Alert.alert("Error", error.response.data.data.errors[0]);
            } else {
              Alert.alert("Error", error.message);
            }
          } else if (error.request) {
            Alert.alert(
              "Error",
              "No response from the server. Please check your connection."
            );
          } else {
            Alert.alert("Error", error.message);
          }
        } finally {
          setRegisterLoading(false);
        }
      }
    }
  };

  return (
    <SafeAreaView className="h-full flex-1">
      <LinearGradient
        colors={[Color.PrimaryWebOrient, Color.PrimaryWebOrientLayer2]}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-row items-center p-4 mt-2">
            <TouchableOpacity
              onPress={() => {
                setMain(true);
                main && navigation.goBack();
              }}
            >
              <Entypo name="chevron-left" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-semibold ml-4 font-InterSemiBold">
              Register yourself
            </Text>
          </View>

          <View className="flex-1 bg-white mt-2 rounded-t-[30px] px-7 pt-7 shadow-2xl">
            {source === "OTP" ? (
              <View className="flex-1 justify-between">
                <View>
                  <View className="mb-8 w-[80%]">
                    <Text className="text-2xl font-bold font-InterBold">
                      Get started with your account!
                    </Text>
                  </View>

                  <View>
                    <View className="mb-5">
                      <Text className="text-sm mb-2 font-InterMedium">
                        User Name*
                      </Text>
                      <Input
                        placeholder="Enter a username"
                        value={finalForm.username}
                        onChange={(text) =>
                          handleChange("username", text, setFinalForm)
                        }
                        onSubmitEditing={Keyboard.dismiss}
                      />
                    </View>

                    <View className="mb-5">
                      <Text className="text-sm mb-2 font-InterMedium">
                        Password*
                      </Text>
                      <InputWithIcon
                        placeholder="Enter a password"
                        isPassword
                        value={finalForm.password}
                        onChange={(text) =>
                          handleChange("password", text, setFinalForm)
                        }
                        onSubmitEditing={Keyboard.dismiss}
                      />
                    </View>

                    <View className="mb-8">
                      <Text className="text-sm mb-2 font-InterMedium">
                        Confirm Password*
                      </Text>
                      <InputWithIcon
                        placeholder="Confirm your password"
                        isPassword
                        value={finalForm.confirmPassword}
                        onChange={(text) =>
                          handleChange("confirmPassword", text, setFinalForm)
                        }
                        onSubmitEditing={Keyboard.dismiss}
                      />
                    </View>
                  </View>
                </View>

                <View className="mb-5">
                  <Button
                    text='Create'
                    width='w-[100%]'
                    styles='mb-4 py-4'
                    onPress={handleRegister}
                    // onPress={() => navigation.navigate("ChooseSecurity")}
                    loading={registerLoading}
                  />

                  <View className="flex-row justify-center">
                    <Text className="text-sm font-InterRegular">
                      Already have an account?{" "}
                    </Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("Login")}
                    >
                      <Text
                        className="text-sm font-InterSemiBold"
                        style={{ color: Color.PrimaryWebOrientTxtColor }}
                      >
                        Login
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : main ? (
              <View className="flex-1 justify-between">
                <View>
                  <View className="mb-8 w-[80%]">
                    <Text className="text-2xl font-bold font-InterBold">
                      Get started with your account!
                    </Text>
                  </View>

                  <View>
                    <View className="mb-5">
                      <Text className="text-sm mb-2 font-InterMedium">
                        CNIC Number*
                      </Text>
                      <Input
                        placeholder="Enter your CNIC"
                        value={initialForm.cnic}
                        onChange={(text) =>
                          handleChange("cnic", text, setInitialForm)
                        }
                        onSubmitEditing={Keyboard.dismiss}
                      />
                    </View>
                    <View className="mb-5">
                      <Text className="text-sm mb-2 font-InterMedium">
                        Mobile Number*
                      </Text>
                      <Input
                        placeholder="Enter your mobile number"
                        value={initialForm.mobile}
                        onChange={(text) =>
                          handleChange("mobile", text, setInitialForm)
                        }
                        onSubmitEditing={Keyboard.dismiss}
                        keyboardType="numeric"
                      />
                    </View>
                    <View className="mb-8">
                      <Text className="text-sm mb-2 font-InterMedium">
                        Account Number*
                      </Text>
                      <Input
                        placeholder="Enter 14 digits Acc No."
                        value={initialForm.accountNumber}
                        onChange={(text) =>
                          handleChange("accountNumber", text, setInitialForm)
                        }
                        onSubmitEditing={Keyboard.dismiss}
                      />
                    </View>

                  </View>
                </View>

                <View className="mb-5">
                  <Button
                    text='Next'
                    width='w-[100%]'
                    styles='mb-4 py-4'
                    onPress={handleNext}
                    // onPress={() => navigation.navigate('ChooseSecurity')}
                    loading={nextLoading}
                  />

                  <View className="flex-row justify-center">
                    <Text className="text-sm font-InterRegular">
                      Already have an account?{" "}
                    </Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("Login")}
                    >
                      <Text
                        className="text-sm font-InterSemiBold"
                        style={{ color: Color.PrimaryWebOrientTxtColor }}
                      >
                        Login
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              <View className="flex-1 justify-between">
                <View>
                  <View className="mb-8 w-[80%]">
                    <Text className="text-2xl font-bold font-InterBold">
                      Get started with your account!
                    </Text>
                  </View>

                  <View>
                    <View className="mb-5">
                      <Text className="text-sm mb-2 font-InterMedium">
                        First Name*
                      </Text>
                      <Input value={returnedData.firstName} disable />
                    </View>

                    <View className="mb-5">
                      <Text className="text-sm mb-2 font-InterMedium">
                        Last Name*
                      </Text>
                      <Input value={returnedData.lastName} disable />
                    </View>

                    <View className="mb-8">
                      <Text className="text-sm mb-2 font-InterMedium">
                        Email Address*
                      </Text>
                      <Input value={returnedData.email} disable />
                    </View>
                  </View>
                </View>

                <View className="mb-5">
                  <Button
                    text='Next'
                    width='w-[100%]'
                    styles='mb-4 py-4'
                    onPress={handleOTP}
                    // onPress={() => navigation.navigate("OTP", { source: "registration" })}
                    loading={otpLoading}
                  />

                  <View className="flex-row justify-center">
                    <Text className="text-sm font-InterRegular">
                      Already have an account?{" "}
                    </Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("Login")}
                    >
                      <Text
                        className="text-sm font-InterSemiBold"
                        style={{ color: Color.PrimaryWebOrientTxtColor }}
                      >
                        Login
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>

      <StatusBar backgroundColor={Color.PrimaryWebOrient} style="light" />
    </SafeAreaView>
  );
};

export default Registration;
