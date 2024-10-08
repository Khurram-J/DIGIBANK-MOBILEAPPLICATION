import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Slider from "@react-native-community/slider";
import { Entypo } from "@expo/vector-icons";
import { Color } from "../../../GlobalStyles";
import Footer from "../../../components/Footer";
import { Checkbox } from "react-native-paper";
import Button from "../../../components/Button";
import CustomModal from "../../../components/CustomModal";
import axios from "axios";
import API_BASE_URL from "../../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LimitManagement = ({ navigation }) => {
  const options = [
    {
      label: "PKR 1,000,000 Daily",
      limit: "PKR 1,000,000",
      bills: "15 Utility Bill",
    },
    {
      label: "PKR 500,000 Daily",
      limit: "PKR 500,000",
      bills: "10 Utility Bill",
    },
    {
      label: "PKR 250,000 Daily",
      limit: "PKR 250,000",
      bills: "5 Utility Bill",
    },
    { label: "PKR 0 Daily", limit: "PKR 0", bills: "0 Utility Bill" },
  ];

  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [dailyLimit, setDailyLimit] = useState(options[0].limit);
  const [modalVisible, setModalVisible] = useState(false);
  const [sliderValue, setSliderValue] = useState(5);

  const handleSelect = (option) => {
    setSelectedOption(option);
    setDailyLimit(option.limit);
    setModalVisible(false);
  };

  const handleShowModal = () => setModalVisible(true);
  const handleCloseModal = () => setModalVisible(false);

  const handleProceed = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const accountNumber = await AsyncStorage.getItem("accountNumber");
      const customerId = await AsyncStorage.getItem("customerId");

      if (!token || !accountNumber || !customerId) {
        Alert.alert(
          "Error",
          "Missing account information. Please log in again."
        );
        return;
      }

      // Extract the numeric part of the limit and ensure it's a number
      const limitString = selectedOption.limit
        .replace("PKR ", "")
        .replace(",", "");
      const limit = parseFloat(limitString);

      if (isNaN(limit)) {
        Alert.alert("Error", "Invalid limit format.");
        return;
      }

      const url = `${API_BASE_URL}/v1/customer/fund/setOneDayLimit?account=${accountNumber}&customerId=${customerId}&ondDayLimit=${limit}`;

      const payload = {
        account: accountNumber,
        customerId: customerId,
        ondDayLimit: limit,
      };

      console.log("Payload:", payload);

      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        Alert.alert("Success", "Daily limit updated successfully.");
      } else {
        Alert.alert("Error", "Failed to update daily limit.");
      }

      handleSelect(selectedOption);
      handleCloseModal();
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status;

        if (statusCode === 404) {
          Alert.alert("Error", "Server not found. Please try again later.");
        } else if (statusCode === 503) {
          Alert.alert("Error", "Service unavailable. Please try again later.");
        } else if (statusCode === 400) {
          const errorMessage =
            error.response.data.message || "Invalid request.";
          Alert.alert("Error", errorMessage);
        } else {
          Alert.alert(
            "Error",
            error.response.data.message || "An unexpected error occurred."
          );
        }
      } else if (error.request) {
        Alert.alert(
          "Error",
          "No response from the server. Please check your connection."
        );
      } else {
        Alert.alert("Error", error.message || "An unexpected error occurred.");
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f9fafc]">
      <View
        className="h-24"
        style={{ backgroundColor: Color.PrimaryWebOrient }}
      >
        <View className="flex-row items-center justify-center h-full">
          <TouchableOpacity
            onPress={() => navigation.navigate("Account_Setting_List")}
            className="absolute left-5"
          >
            <Entypo name="chevron-left" size={25} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Limit Management</Text>
        </View>
      </View>
      <View className="w-full mt-5 px-4">
        <Text className="text-base font-semibold text-gray-800">
          Your Current Transaction Limits
        </Text>
      </View>
      <View className="z-10 p-4">
        <View className="flex flex-col items-center px-4 py-3.5 bg-white rounded-xl">
          <View className="flex flex-row justify-between w-full">
            <View className="flex flex-col">
              <Text className="text-xs font-medium text-neutral-500">
                Daily Limit
              </Text>
              <Text className="mt-1 text-lg font-semibold text-gray-800">
                {dailyLimit}
              </Text>
            </View>
            <View className="flex flex-col items-end">
              <Text className="text-xs font-medium text-neutral-500">
                Available Limits
              </Text>
              <Text className="mt-1 text-lg font-semibold text-gray-800">
                PKR 488,000
              </Text>
            </View>
          </View>
          <View className="flex flex-col mt-3 w-full rounded-xl">
            <View className="flex flex-col items-start bg-[#f9fafc] rounded-xl">
              <View className="h-3 bg-cyan-500 rounded-xl w-[66px]" />
            </View>
          </View>
          <View className="flex flex-row items-center justify-between mt-4 w-full">
            <View className="flex flex-row items-center">
              <Entypo
                name="calendar"
                size={20}
                color={Color.PrimaryWebOrient}
              />
              <Text className="ml-2 text-md font-medium text-neutral-500">
                Daily utility bill payment 0/{sliderValue}
              </Text>
            </View>
            <TouchableOpacity
              className="bg-primary w-8 h-8 rounded-full flex items-center justify-center"
              onPress={handleShowModal}
            >
              <Entypo name="edit" size={17} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex flex-col items-center px-5 mt-5">
          <View className="w-full">
            <Text className="text-base font-semibold text-gray-800">
              Select a New Transaction Limit
            </Text>
          </View>
          {options.map((option) => (
            <View key={option.label} className="relative mt-3 w-full">
              <View
                className="w-full h-28 bg-white rounded-xl mx-auto"
                style={{ resizeMode: "contain" }}
              />
              <View className="absolute inset-0 flex flex-col justify-center items-center p-4">
                <View className="w-full px-2">
                  <View className="w-full flex flex-row items-center justify-between mb-2">
                    <View className="p-4">
                      <Text className="text-lg font-semibold mt-2">
                        {option.limit}{" "}
                        <Text className="text-sm text-gray-500">Daily</Text>
                      </Text>
                      <View className="mb-2">
                        <View className="h-[1px] bg-gray-300" />
                        <Text className="text-lg font-semibold mt-2">
                          {option.bills}{" "}
                          <Text className="text-sm text-gray-500">Daily</Text>
                        </Text>
                      </View>
                    </View>
                    <View>
                      <Checkbox
                        status={
                          selectedOption.label === option.label
                            ? "checked"
                            : "unchecked"
                        }
                        onPress={() => handleSelect(option)}
                        color={Color.PrimaryWebOrient}
                        uncheckedColor="gray"
                        style={{ transform: [{ scale: 0.75 }] }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View className="p-4">
          <Button
            text="Proceed"
            width="w-[100%]"
            styles="py-4"
            onPress={handleProceed}
          />
        </View>
      </ScrollView>

      <Footer />
      <StatusBar backgroundColor={Color.PrimaryWebOrient} style="light" />

      {/* Custom Modal */}
      <CustomModal
  visible={modalVisible}
  onClose={handleCloseModal}
  title="Set Count"
  message="Adjust the number of utility bills per day."
  confirmText="Proceed"
  onConfirm={() => {
    handleProceed(sliderValue); 
  }}
>
  <View className="flex flex-col items-center px-4 py-3.5 bg-white rounded-xl">
    <View className="flex flex-row justify-between w-full mb-4">
      <View className="flex flex-col">
        <Text className="text-md font-medium">Set Count</Text>
      </View>
      <View className="flex flex-col items-end">
        <Text
          className="text-md font-medium"
          style={{ color: Color.PrimaryWebOrient }}
        >
          {sliderValue} Utility Bills / Day
        </Text>
      </View>
    </View>

    <View className="w-full">
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={5}
        step={1}
        value={sliderValue}
        onValueChange={(value) => setSliderValue(value)}
        minimumTrackTintColor={Color.PrimaryWebOrient}
        maximumTrackTintColor="#ccc"
        thumbTintColor={Color.PrimaryWebOrient}
      />
      <View className="flex-row justify-between w-full">
        <Text className="text-gray-400 font-bold">0</Text>
        <Text className="text-gray-400 font-bold">{sliderValue}</Text>
      </View>
    </View>
  </View>
</CustomModal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  slider: {
    width: "100%",
    height: 40,
  },
});

export default LimitManagement;
