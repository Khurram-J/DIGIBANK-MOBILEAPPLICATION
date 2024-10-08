import React, { useState } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import { Text, View, Image, TextInput, Alert } from "react-native";
import { ScrollView, StyleSheet, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import Button from "../../../components/Button";

const ApplyCard = () => {
  const navigation = useNavigation();
  const [price, setPrice] = useState('');
  const [error, setError] = useState(null); // State for error message

  const handleNext = () => {
    // Check if price is empty
    if (price === '') {
      setError("Net Income Per Month is required."); // Set error message
    } else {
      setError(null); // Clear error if input is valid
      navigation.navigate("ApplyForCard", {
        price
      });
    }
  };

  return (
    <SafeAreaView className="bg-[#f9fafc]" style={{ flex: 1 }}>
      <ScrollView>
        <View className="flex-1">
          <View className="flex-row items-center justify-center w-full mt-10">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="absolute left-5"
            >
              <Entypo name="chevron-left" size={30} color="black" />
            </TouchableOpacity>
            <Text className="font-InterBold text-2xl">Apply for Card</Text>
          </View>
          <View>
            <View className="flex-1 justify-center items-center p-4 shadow-gray-100">
              <View className="bg-white p-6 rounded-lg shadow-lg w-full">
                <Text className="text-lg font-semibold mb-1">Personal Details</Text>
                <Text className="text-sm text-gray-500 mb-4">Required to access your eligibility</Text>

                <Text className="text-sm font-medium mb-2">Net Income Per Month</Text>
                <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 mb-4">
                  <Text className="text-base text-gray-500 mr-2">PKR |</Text>
                  <TextInput
                    className="flex-1"
                    placeholder="50,000"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={(text) => setPrice(text)} // Update state when input changes
                  />
                </View>

                {error && ( // Display error message if exists
                  <Text className="text-red-500 mb-4">{error}</Text>
                )}
              </View>
            </View>
            <View className="px-10 mt-14">
              <Button
                text="Next"
                width="w-[100%]"
                styles="mb-4 py-4"
                onPress={handleNext} // Call handleNext for validation
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ApplyCard;
