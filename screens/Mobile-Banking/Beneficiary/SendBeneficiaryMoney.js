import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from '@expo/vector-icons/AntDesign';

import { Color } from '../../../GlobalStyles';
import OptionBox from '../../../components/OptionBox';
import Footer from '../../../components/Footer';

import BankIcon from '../../../assets/bank-icon.png'
import RaastIcon from '../../../assets/raast-icon.png'

const SendBeneficiaryMoney = ({ navigation }) => {
  return (
    <SafeAreaView className="h-full flex-1">

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

        <LinearGradient
          colors={[Color.PrimaryWebOrient, Color.PrimaryWebOrientLayer2]}
          style={{ height: '12%' }}
        >
          <View className="flex-row items-center justify-center w-full h-full">
            <TouchableOpacity onPress={() => navigation.goBack()} className="absolute left-5">
              <AntDesign name="arrowleft" size={23} color="white" />
            </TouchableOpacity>
            <Text className="text-white font-semibold text-lg font-InterSemiBold">Send Money</Text>
          </View>
        </LinearGradient>

        <View className="w-full h-full px-6 bg-[#F5F5F5]">
          <View className="mt-8">
            <Text className="font-InterSemiBold text-base">Select Method</Text>
          </View>

          <View className="mt-7">

            <OptionBox
              image={BankIcon}
              text="Transfer to Bank"
              subtext="Transfer to all banks & wallets"
              icon1="arrowright"
              onPress1={() => navigation.navigate("BeneficiaryList")}
              iconColor1={Color.PrimaryWebOrient}
            />

            <View className="my-5 w-full border-b border-gray-300" />

            <OptionBox
              image={RaastIcon}
              text="Raast Payment"
              subtext="Free transfer to mobile number/IBAN/Bank account"
              icon1="arrowright"
              iconColor1={Color.PrimaryWebOrient}
            />

            <View className="my-5 w-full border-b border-gray-300" />

          </View>
        </View>

      </ScrollView>

      <Footer />


      <StatusBar backgroundColor={Color.PrimaryWebOrient} style="light" />
    </SafeAreaView>
  )
}

export default SendBeneficiaryMoney