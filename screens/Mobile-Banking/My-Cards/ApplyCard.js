import React, { useState, useEffect } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import { Text, View, Image, TextInput } from "react-native";
import { ScrollView, StyleSheet, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const ApplyCard = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView className=" bg-[#f9fafc]" style={{ flex: 1 }}>
      <ScrollView>
        <View className=" flex-1">
          <TouchableOpacity onPress={() => navigation.navigate("SelectCards")}>
            <Entypo
              name="chevron-left"
              size={wp("8%")}
              color="#090909"
              marginTop={hp("2%")}
            />
          </TouchableOpacity>
          <View className="justify-center items-center">
            <Text className="font-InterBold text-2xl ">Apply for Card</Text>
          </View>
          <View>
            <View className="flex-1 justify-center items-center p-4 shadow-gray-100">
              <View className="bg-white p-6 rounded-lg shadow-lg w-full">
                <Text className="text-lg font-semibold mb-1">
                  Personal Details
                </Text>
                <Text className="text-sm text-gray-500 mb-4">
                  Required to access your eligibility
                </Text>

                <Text className="text-sm font-medium mb-2">
                  Net Income Per Month
                </Text>
                <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 mb-4 ">
                  <Text className="text-base text-gray-500 mr-2 ">RUB |</Text>
                  <TextInput
                    className="flex-1"
                    placeholder="50,000"
                    keyboardType="numeric"
                  />
                </View>

                <Text className="text-base font-semibold mb-2">
                  Let's Verify Your Identity
                </Text>
                <TouchableOpacity className="flex-row items-center border  border-cyan-300 rounded-lg bg-cyan-50 p-4">
                  <Image
                    source={require("../../../assets/apply-card.png")}
                    className="w-10 h-10 mr-3"
                  />
                  <View>
                    <Text className="text-lg text-black font-semibold ">
                      Upload Your National ID
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Max file size is 5MB (JPEG, PNG, PDF)
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <View className="px-10 mt-16">
              <TouchableOpacity
                className="py-3 px-12 bg-[#1DBBD8] rounded-lg"
                onPress={() => navigation.navigate("ApplyForCard")}
              >
                <Text className="text-base text-center font-InterMedium text-white">
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ApplyCard;
