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
import { StatusBar } from "expo-status-bar";

const SelectCards = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView className=" bg-[#f9fafc]" style={{ flex: 1 }}>
      <ScrollView>
        <View className=" flex-1">
        <View className="relative w-full mt-10">
            <TouchableOpacity
              onPress={() => navigation.navigate("Home")}
              className="absolute left-5 "
              style={{ zIndex: 1 }}
            >
              <Entypo name="chevron-left" size={30} color="black" />
            </TouchableOpacity>
            <Text className="text-center font-InterBold text-2xl">
              Cards & Loan
            </Text>
          </View>
          <View className="p-4">
            <TouchableOpacity onPress={() => navigation.navigate("CardManagement")}
             className="flex-row items-center justify-between bg-white p-4 mb-2 rounded-lg shadow-inner">
              <View className="flex-row items-center">
                <Image source={require('../../../assets/card-management.png')}  className="w-6 h-6 mr-3" />
                <Text className=" text-lg text-black font-InterSemiBold">Card Management</Text>
              </View>
              <Icon name="chevron-right" size={20} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("NewCard")}
            className="flex-row items-center justify-between bg-white p-4 mb-2 rounded-lg shadow-inner">
              <View className="flex-row items-center">
                <Image source={require('../../../assets/Add-Debit.png')}  className="w-6 h-6 mr-3" />
                <Text className=" text-lg text-black font-InterSemiBold">Add Debit Card</Text>
              </View>
              <Icon name="chevron-right" size={20} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("SelectApplyOptionCard")}
             className="flex-row items-center justify-between bg-white p-4 mb-2 rounded-lg shadow-inner">
              <View className="flex-row items-center">
                <Image source={require('../../../assets/payment.png')}  className="w-6 h-6 mr-3" />
                <Text className=" text-lg text-black font-InterSemiBold">Apply for Credit Card</Text>
              </View>
              <Icon name="chevron-right" size={20} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("NameOnTheCard")}
             className="flex-row items-center justify-between bg-white p-4 mb-2 rounded-lg shadow-inner">
              <View className="flex-row items-center">
                <Image source={require('../../../assets/Add-Debit.png')}  className="w-6 h-6 mr-3" />
                <Text className=" text-lg text-black font-InterSemiBold">Activate Your Card</Text>
              </View>
              <Icon name="chevron-right" size={20} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between bg-white p-4 mb-2 rounded-lg shadow-inner">
              <View className="flex-row items-center">
                <Image source={require('../../../assets/payment.png')}  className="w-6 h-6 mr-3" />
                <Text className=" text-lg text-black font-InterSemiBold">Digi-Bank  BNPL</Text>
              </View>
              <Icon name="chevron-right" size={20} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between bg-white p-4 mb-2 rounded-lg shadow-inner" onPress={() => navigation.navigate("AvailCashonCreditCard")}>
              <View className="flex-row items-center">
                <Image source={require('../../../assets/card-management.png')}  className="w-6 h-6 mr-3" />
                <Text className=" text-lg text-black font-InterSemiBold">Easy Cash</Text>
              </View>
              <Icon name="chevron-right" size={20} color="gray" />
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={() => navigation.navigate("CongCard")}
             className="flex-row items-center justify-between bg-white p-4 mb-2 rounded-lg shadow-inner">
              <View className="flex-row items-center">
                <Image source={require('../../../assets/card-management.png')}  className="w-6 h-6 mr-3" />
                <Text className=" text-lg text-black font-InterSemiBold">Congratulations</Text>
              </View>
              <Icon name="chevron-right" size={20} color="gray" />
            </TouchableOpacity> */}
          </View>
        </View>
      </ScrollView>
      <StatusBar backgroundColor="#f9fafc" style="light" />

    </SafeAreaView>
  );
};

export default SelectCards;
