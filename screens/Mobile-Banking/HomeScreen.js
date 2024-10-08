import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
  Pressable,
  Modal,
  Animated,
  Easing,
  TextInput,
  ImageBackground,
  Alert,
  RefreshControl
} from "react-native";
import { Color } from "../../GlobalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import { Avatar, List, Divider } from "react-native-paper";
import Statment from "../../assets/Images/Statment.svg";
import Utility from "../../assets/Images/UtilityPay.svg";
import QR from "../../assets/Images/QR.svg";
import Discount from "../../assets/Images/Discount.svg";
import Topup from "../../assets/Images/Top-Up.svg";
import Cards from "../../assets/Images/Cards.svg";
import Payment from "../../assets/Images/Payment.svg";
import Account from "../../assets/Images/Account.svg";
import Transfer from "../../assets/Images/Transfer.svg";
import Beneficiary from "../../assets/Images/Beneficiary.svg";
import Footer from "../../components/Footer";
import Sidebar from "./Account-Setting/Sidebar";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import API_BASE_URL from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { StatusBar } from "expo-status-bar";
import { decrypt } from "../../utils/crypto";

const HomeScreen = () => {
  const navigation = useNavigation();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [expanded1, setExpanded1] = useState(false);
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-300)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;
  const [cards, setCards] = useState([]);
  const backgroundImage = require("../../assets/Images/Cards.png");
  const [refreshing, setRefreshing] = useState(false);
  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    accountNumber: "",
    accountType: "",
  });

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const handleCopy = (text) => {
    Clipboard.setString(text);
    alert("Copied to clipboard");
  };

  const [isVisible, setIsVisible] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchCardData();
      fetchUserDetails();
    }, [])
  );

  useEffect(() => {
    Animated.timing(sidebarAnim, {
      toValue: isSidebarVisible ? 0 : -300,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    Animated.timing(modalAnim, {
      toValue: isSidebarVisible ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [isSidebarVisible]);

  const handlePress = () => setExpanded(!expanded);
  const handlePress1 = () => setExpanded1(!expanded1);
  const [activeItem, setActiveItem] = useState(null);

  // Function to handle item press
  const handlePressMenu = (item) => {
    setActiveItem(item);

    setTimeout(() => {
      switch (item) {
        case "Transfer":
          break;
        case "Payment":
          navigation.navigate("SendBeneficiaryMoney");
          break;
        case "My Payees":
          navigation.navigate("BeneficiaryList", { source: 'beneficiary' });
          break;
        case "Cards":
          navigation.navigate("SelectCards");
          break;
        case "Top up":
          navigation.navigate("SelectOption_Top_up");
          break;
        case "Accounts":
          navigation.navigate("Account_Balance");
          break;
        case "QR Payments":
          break;
        case "Utility Pay":
            navigation.navigate("Bill_Payment_List")
          break;
          case "Statement":
            navigation.navigate("Account_Statements"); 
            break;
        case "Discount":
          break;
        default:
          break;
      }
    }, 100);
  };

  const fetchUserDetails = async () => {
    try {
      const bearerToken = await AsyncStorage.getItem("token");
      const customerId = await AsyncStorage.getItem("customerId");
  
      if (!bearerToken) {
        Alert.alert("Error", "Authentication token not found");
        return;
      }
      if (!customerId) {
        Alert.alert("Error", "Customer ID not found");
        return;
      }
  
      const response = await axios.get(
        `${API_BASE_URL}/v1/customer/fetchUserDetails?userId=${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        }
      );
  
      if (response.status === 200 && response.data && response.data.data) {
        const userDetails = {
          firstName: response.data.data.firstName || "User",
          lastName: response.data.data.lastName || "Name",
          defaultAccountBalance: response.data.data.defaultAccountBalance || "N/A",
          accountNumber: response.data.data.accountNumber || "N/A",
          accountType: response.data.data.accountType || "N/A",
          email: response.data.data.email || "N/A", 
          mobileNumber: response.data.data.mobileNumber || "N/A", 
          bankLogo: response.data.data.bankImage || "N/A"
        };
  
  
        await AsyncStorage.multiSet([
          ["firstName", userDetails.firstName],
          ["lastName", userDetails.lastName],
          ["accountNumber", userDetails.accountNumber],
          ["accountType", userDetails.accountType],
          ["email", userDetails.email], 
          ["mobileNumber", userDetails.mobileNumber], 
          ["bankLogo", userDetails.bankLogo], 
          ["balance", userDetails.defaultAccountBalance], 
        ]);
  
        setUserDetails(userDetails);
      } else {
        Alert.alert("Error", "Unexpected response format");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      Alert.alert("Error", `Error fetching user details: ${error.message}`);
    }
  };
  
  
  

  const fetchCardData = async () => {
    try {
      const bearerToken = await AsyncStorage.getItem("token");
      const accountNumber = await AsyncStorage.getItem("accountNumber");

      if (!bearerToken) {
        Alert.alert("Error", "Authentication token not found");
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/v1/customer/card/fetchCardById/${accountNumber}`,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        }
      );

      if (response.data.success && Array.isArray(response.data.data)) {
        const updatedCards = response.data.data.map((card) => ({
          ...card,
          isCreditCard: card.isCreditCard === true,
        }));
        setCards(updatedCards);
      } else {
        Alert.alert("Error", "Unexpected response format");
      }
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status;

        if (statusCode === 404) {
          Alert.alert("Error", "Server not found. Please try again later.");
        } else if (statusCode === 503) {
          Alert.alert("Error", "Service unavailable. Please try again later.");
        } else if (statusCode === 400) {
          Alert.alert(
            "Error",
            error.response.data.message ||
            "Bad request. Please check your input."
          );
        } else {
          Alert.alert("Error", "Card not found");
        }
      } else if (error.request) {
        Alert.alert(
          "Error",
          "No response from the server. Please check your connection."
        );
      } else {
        Alert.alert("Error", `Error: ${error.message}`);
      }
    }
  };

  const fetchBeneficiaries = async () => {
    try {
      const customerId = await AsyncStorage.getItem('customerId');
      const bearerToken = await AsyncStorage.getItem('token');

      if (customerId && bearerToken) {
        const response = await axios.get(`${API_BASE_URL}/v1/beneficiary/getAllBeneficiary?customerId=${customerId}&flag=false`, {
          headers: {
            'Authorization': `Bearer ${bearerToken}`
          }
        });

        const dto = response.data;

        if (dto && dto.success && dto.data) {
          const transformedBeneficiaries = dto.data.map(item => ({
            ...item,
            bankUrl: decrypt(item.bankUrl),
            accountNumber: decrypt(item.accountNumber),
            liked: item.flag
          }));

          // Sort beneficiaries first by flag (true first) and within that by id in descending order
          transformedBeneficiaries.sort((a, b) => {
            if (b.flag === a.flag) {
              return b.id - a.id;
            }
            return b.flag - a.flag;
          });

          setBeneficiaries(transformedBeneficiaries);
        } else {
          if (dto.message) {
            Alert.alert('Error', dto.message);
          } else if (dto.errors && dto.errors.length > 0) {
            Alert.alert('Error', dto.errors.join('\n'));
          }
        }
      } else {
        Alert.alert('Error', 'Unexpected error occurred. Try again later!');
      }
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status;

        if (statusCode === 404) {
          Alert.alert('Error', 'Server timed out. Try again later!');
        } else if (statusCode === 503) {
          Alert.alert('Error', 'Service unavailable. Please try again later.');
        } else if (statusCode === 400) {
          Alert.alert('Error', error.response.data.data.errors[0]);
        } else {
          Alert.alert('Error', error.message);
        }
      } else if (error.request) {
        Alert.alert('Error', 'No response from the server. Please check your connection.');
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  const getColorForIndex = (index) => {
    const colors = ["#3b82f6", "#FECC81", "#9683E4", "#5CCAA9", "#eb4034"];
    return colors[index % colors.length];
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  useEffect(() => {
    fetchCardData();
    fetchUserDetails();
  }, []);

  const maskCardNumber = (number) => {
    return number.replace(/(.{4})/g, "$1  ").trim();
  };

  const renderNoDataMessage = (type) => (
    <View className="flex-1 justify-center items-center mt-5">
      <Text className="text-gray-500 text-lg">No {type} Cards Found</Text>
    </View>
  );

  const renderCardSection = (card, isExpanded, onPress) => {
    const cardDetails = [
      {
        label: "Card Number",
        value: maskCardNumber(card.cardNumber),
        key: 1
      },
      {
        label: "Card Holder",
        value: card.cardHolderName,
        key: 2
      },
      {
        label: "Expiry",
        value: card.expiryDate,
        key:3
      },
    ];

    const isDebitCard = !card.isCreditCard;

    return (
      <List.AccordionGroup className="my-2" key={card.cardId}>
        <List.Accordion
          id={card.cardId}
          key={card.cardId}
          className="bg-white mb-2"
          style={styles.accordion}
          title={
            <View className="flex-row items-center">
              <Entypo
                name="credit-card"
                size={35}
                className="mr-1"
                style={{ color: Color.PrimaryWebOrient }}
              />
              <View className="ml-4">
                <Text className="text-base font-semibold text-black">
                  {card.cardHolderName}
                </Text>
                <Text className="text-sm font-medium text-gray-500">
                  {maskCardNumber(card.cardNumber)}
                </Text>
              </View>
            </View>
          }
          left={(props) => <List.Icon {...props} />}
          expanded={isExpanded}
          onPress={onPress}
        >
          <View className="flex-1 items-center px-10 py-5 mb-5">
            <ImageBackground
              source={backgroundImage}
              className="w-[320] h-[200px] justify-center items-center "
              imageStyle={{ borderRadius: 10 }}
            >
              <View className="flex-1 items-center px-4 py-16 mt-5">
                <Text className="text-black text-2xl font-semibold ">
                  {maskCardNumber(card.cardNumber)}
                </Text>
                <View className="flex-row justify-between w-full mb-4">
                  <Text className="text-black text-md font-semibold">
                    {card.expiryDate}
                  </Text>
                  <Text className="text-black text-md font-semibold">
                    CVV: {card.cvv}
                  </Text>
                </View>
                <Text className="text-black text-xl">
                  {card.cardHolderName}
                </Text>
              </View>
            </ImageBackground>
          </View>
        </List.Accordion>
      </List.AccordionGroup>
    );
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    const fetchCardData = async () => {
      try {
        const bearerToken = await AsyncStorage.getItem("token");
        const accountNumber = await AsyncStorage.getItem("accountNumber");
  
        if (!bearerToken) {
          Alert.alert("Error", "Authentication token not found");
          return;
        }
  
        const response = await axios.get(
          `${API_BASE_URL}/v1/customer/card/fetchCardById/${accountNumber}`,
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
          }
        );
  
        if (response.data.success && Array.isArray(response.data.data)) {
          const updatedCards = response.data.data.map((card) => ({
            ...card,
            isCreditCard: card.isCreditCard === true,
          }));
          setCards(updatedCards);
        } else {
          Alert.alert("Error", "Unexpected response format");
        }
      } catch (error) {
        if (error.response) {
          const statusCode = error.response.status;
  
          if (statusCode === 404) {
            Alert.alert("Error", "Server not found. Please try again later.");
          } else if (statusCode === 503) {
            Alert.alert("Error", "Service unavailable. Please try again later.");
          } else if (statusCode === 400) {
            Alert.alert(
              "Error",
              error.response.data.message ||
              "Bad request. Please check your input."
            );
          } else {
            Alert.alert("Error", "Card not found");
          }
        } else if (error.request) {
          Alert.alert(
            "Error",
            "No response from the server. Please check your connection."
          );
        } else {
          Alert.alert("Error", `Error: ${error.message}`);
        }
      } 
      finally {
        setRefreshing(false);
      }
    };
    const fetchUserDetails = async () => {
      try {
        const bearerToken = await AsyncStorage.getItem("token");
        const customerId = await AsyncStorage.getItem("customerId");
    
        if (!bearerToken) {
          Alert.alert("Error", "Authentication token not found");
          return;
        }
        if (!customerId) {
          Alert.alert("Error", "Customer ID not found");
          return;
        }
    
        const response = await axios.get(
          `${API_BASE_URL}/v1/customer/fetchUserDetails?userId=${customerId}`,
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
          }
        );
    
        // console.log("API Response:", response.data); 
        // console.log("API Response:", API_BASE_URL); 
    
        if (response.status === 200 && response.data && response.data.data) {
          const userDetails = {
            firstName: response.data.data.firstName || "User",
            lastName: response.data.data.lastName || "Name",
            defaultAccountBalance: response.data.data.defaultAccountBalance || "N/A",
            accountNumber: response.data.data.accountNumber || "N/A",
            accountType: response.data.data.accountType || "N/A",
            email: response.data.data.email || "N/A", 
            mobileNumber: response.data.data.mobileNumber || "N/A", 
          };
    
    
          await AsyncStorage.multiSet([
            ["firstName", userDetails.firstName],
            ["lastName", userDetails.lastName],
            ["accountNumber", userDetails.accountNumber],
            ["accountType", userDetails.accountType],
            ["email", userDetails.email], 
            ["mobileNumber", userDetails.mobileNumber], 
          ]);
    
          setUserDetails(userDetails);
        } else {
          Alert.alert("Error", "Unexpected response format");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        Alert.alert("Error", `Error fetching user details: ${error.message}`);
      }
      finally {
        setRefreshing(false);
      }
    };

    fetchCardData();
    fetchUserDetails();

}, [fetchCardData,fetchUserDetails]);

  return (
    <SafeAreaView style={styles.container} className="h-full bg-[#f9fafc]">

      <Modal
        transparent={true}
        animationType="none"
        visible={isSidebarVisible}
        onRequestClose={toggleSidebar}
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.sidebarContainer,
              {
                transform: [
                  {
                    translateX: sidebarAnim,
                  },
                ],
              },
            ]}
          >
            <Sidebar />
          </Animated.View>
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: modalAnim,
              },
            ]}
          >
            <TouchableOpacity style={styles.overlay} onPress={toggleSidebar} />
          </Animated.View>
        </View>
      </Modal>

      <View className="flex flex-row items-center justify-between px-5 py-2 shadow-md bg-white border-b-[1px] border-gray-100">
        {/* Menu Icon */}
        <Entypo
          name="menu"
          size={30}
          style={{ color: Color.PrimaryWebOrient }}
          onPress={toggleSidebar}
        />

        {/* Avatar Image */}
        <View className="w-16 h-16 flex items-center justify-center">
          <Avatar.Image
            source={require("../../assets/Images/profile-icon.png")}
          />
        </View>

        {/* User Info */}
        <View className="flex flex-col justify-center text-lg font-semibold text-gray-800 mr-20">
          <Text className="text-slate-500 text-sm mb-0">Welcome</Text>
          <Text className="font-bold text-lg mb-0 text-black">{`${userDetails.firstName} ${userDetails.lastName}`}</Text>
        </View>

        {/* Notification Bell */}
        <Entypo
          name="bell"
          size={30}
          style={{ color: Color.PrimaryWebOrient }}
        />
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} scrollEventThrottle={16} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Color.PrimaryWebOrient]} />}>
        <View className="justify-center items-center pt-2">
          {/* <NewCard width={400} /> */}
          <View className="justify-center items-center ">
            {/* <ListSectionCard width={400} /> */}
            <View className="bg-primary p-4 rounded-lg justify-between shadow-md w-80 h-44">
              <View className="justify-between  mb-4">
                <View className=" flex-row items-center justify-between">
                  <Text className="text-slate-950  text-base">
                    Total Balance:
                  </Text>
                  <Entypo name="dots-three-vertical" size={20} />
                </View>

                <View className="d-flex flex-row items-center">
                  <Text className="text-white text-2xl font-bold">
                    {isVisible
                      ? userDetails.defaultAccountBalance
                      : "*********"}
                  </Text>

                  <TouchableOpacity onPress={() => setIsVisible(!isVisible)}>
                    <Ionicons
                      name={isVisible ? "eye" : "eye-off"}
                      size={22}
                      style={[styles.icon, { color: "white" }]}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="justify-between ">
                <View className="flex-row d-flex items-center">
                  <Text className="text-slate-950 text-lg font-semibold">
                    A/C No: {userDetails.accountNumber}
                  </Text>
                  <TouchableOpacity>
                    <Ionicons
                      name="copy"
                      size={20}
                      style={[styles.icon, { color: "white" }]}
                    />
                  </TouchableOpacity>
                </View>

                <Text className="text-white text-base font-semibold">
                  {userDetails.accountType}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View className="flex flex-col px-5 pt-5">
          <Text className="font-bold text-black text-lg">Activity</Text>
        </View>
        <View className="flex justify-center items-center">
          <View className="flex flex-col justify-center items-center">
            {/* First Row */}
            <View className="flex-row justify-between mb-4">
              {["Transfer", "Payment", "My Payees"].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handlePressMenu(item)}
                >
                  <View
                    className="w-24 h-24 m-2.5 rounded-lg flex justify-center items-center"
                    style={[
                      styles.box,
                      {
                        backgroundColor:
                          activeItem === item
                            ? Color.PrimaryWebOrient
                            : "white",
                      },
                    ]}
                  >
                    {item === "Transfer" && (
                      <Transfer
                        color={activeItem === item ? "white" : "black"}
                      />
                    )}
                    {item === "Payment" && (
                      <Payment
                        color={activeItem === item ? "white" : "black"}
                      />
                    )}
                    {item === "My Payees" && (
                      <Beneficiary
                        color={activeItem === item ? "white" : "black"}
                      />
                    )}
                    <Text
                      className="text-center font-semibold"
                      style={{
                        color: activeItem === item ? "white" : "black",
                      }}
                    >
                      {item}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Second Row */}
            <View className="flex-row justify-between mb-4">
              {["Cards", "Top up", "Accounts"].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handlePressMenu(item)}
                >
                  <View
                    className="w-24 h-24 m-2.5 rounded-lg flex justify-center items-center"
                    style={[
                      styles.box,
                      {
                        backgroundColor:
                          activeItem === item
                            ? Color.PrimaryWebOrient
                            : "white",
                      },
                    ]}
                  >
                    {item === "Cards" && <Cards style={styles.icon} />}
                    {item === "Top up" && <Topup style={styles.icon} />}
                    {item === "Accounts" && <Account style={styles.icon} />}
                    <Text
                      className="text-center font-semibold"
                      style={{
                        color: activeItem === item ? "white" : "black",
                      }}
                    >
                      {item}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Third Row */}
            <View className="flex-row justify-between mb-4">
              {["QR Payments", "Utility Pay", "Statement"].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handlePressMenu(item)}
                >
                  <View
                    className="w-24 h-24 m-2.5 rounded-lg flex justify-center items-center"
                    style={[
                      styles.box,
                      {
                        backgroundColor:
                          activeItem === item
                            ? Color.PrimaryWebOrient
                            : "white",
                      },
                    ]}
                  >
                    {item === "QR Payments" && <QR style={styles.icon} />}
                    {item === "Utility Pay" && <Utility style={styles.icon} />}
                    {item === "Statement" && <Statment style={styles.icon} />}
                    <Text
                      className="text-center font-semibold"
                      style={{
                        color: activeItem === item ? "white" : "black",
                      }}
                    >
                      {item}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Fourth Row */}
            <View className="flex-row justify-between mb-4">
              <TouchableOpacity onPress={() => handlePressMenu("Discount")}>
                <View
                  className="w-24 h-24 m-2.5 rounded-lg flex justify-center items-center"
                  style={[
                    styles.box,
                    {
                      backgroundColor:
                        activeItem === "Discount"
                          ? Color.PrimaryWebOrient
                          : "white",
                    },
                  ]}
                >
                  <Discount style={styles.icon} />
                  <Text
                    className="text-center font-semibold"
                    style={{
                      color: activeItem === "Discount" ? "white" : "black",
                    }}
                  >
                    Discount
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View className="flex-row justify-between px-5">
          <Text className="text-base font-semibold text-black">My Payees</Text>
          <TouchableOpacity onPress={() => navigation.navigate("BeneficiaryList", { source: 'dashboard' })}>
            <Text className="text-xs font-medium text-gray-800 underline">View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          className="pt-1 mx-2"
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {beneficiaries.map((beneficiary, index) => (
            <TouchableOpacity
              key={index}
              className="w-24 h-36 bg-white m-2 rounded-lg shadow-lg justify-center items-center"
              onPress={() => navigation.navigate('SendFromAccount', { beneObj: beneficiary, source: 'dashboard' })}
            >
              <View
                className="w-20 h-20 bg-primary mt-3 rounded-lg shadow-lg justify-center items-center"
                style={{ backgroundColor: getColorForIndex(index) }} // Optional: You can create a function to get different colors
              >
                <Text className="text-center text-3xl text-white font-bold">
                  {beneficiary.beneficiaryAlias.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="font-medium">
                <Text className="text-sm text-center font-bold mt-1">
                  {beneficiary.beneficiaryAlias}
                </Text>
                <Text className="text-xs text-center text-gray-600 font-semibold">
                  {beneficiary.beneficiaryBankName}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {beneficiaries.length === 0 && (
            <TouchableOpacity className="w-20 h-20 bg-white m-2 rounded-lg shadow-lg justify-center items-center"
            onPress={() => navigation.navigate("BankList", { source: 'dashboard' })}>
              <AntDesign name="pluscircleo" size={22} color={Color.PrimaryWebOrient} />
              <Text className="font-InterSemiBold text-sm mt-1.5">Add</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
        <View className="flex-row justify-between px-5 mt-5">
          <Text className="text-base font-semibold text-black">Quick Pay</Text>
          <Text className="text-xs font-medium text-gray-800 underline">
            View All
          </Text>
        </View>
        <ScrollView
          className="pt-1 mx-2"
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <View className="m-2">
            <View
              className="w-20 h-20 bg-primary  rounded-lg shadow-lg justify-center items-center"
              style={{ backgroundColor: Color.PrimaryWebOrient }}
            >
              <Text className="text-center text-4xl text-white font-bold">
                F
              </Text>
            </View>
            <View className="font-medium">
              <Text className="text-sm text-center font-bold mt-1">Fatima</Text>
            </View>
          </View>
          <View className="m-2">
            <View
              className="w-20 h-20 bg-primary  rounded-lg shadow-lg justify-center items-center"
              style={{ backgroundColor: "#20798C" }}
            >
              <Text className="text-center font text-3xl text-white font-bold">
                B
              </Text>
            </View>
            <View className="font-medium">
              <Text className="text-sm text-center font-bold mt-1">Bisma</Text>
            </View>
          </View>
          <View className="m-2">
            <View
              className="w-20 h-20 bg-primary  rounded-lg shadow-lg justify-center items-center"
              style={{ backgroundColor: "#2E76B7" }}
            >
              <Text className="text-center font text-3xl text-white font-bold">
                S
              </Text>
            </View>
            <View className="font-medium">
              <Text className="text-sm text-center font-bold mt-1">Sameer</Text>
            </View>
          </View>
          <View className="m-2">
            <View
              className="w-20 h-20 bg-primary  rounded-lg shadow-lg justify-center items-center"
              style={{ backgroundColor: "#9683E4" }}
            >
              <Text className="text-center font text-3xl text-white font-bold">
                A
              </Text>
            </View>
            <View className="font-medium">
              <Text className="text-sm text-center font-bold mt-1">Amina</Text>
            </View>
          </View>
          <View className="m-2">
            <View
              className="w-20 h-20 bg-primary  rounded-lg shadow-lg justify-center items-center"
              style={{ backgroundColor: "#E983CC" }}
            >
              <Text className="text-center font text-3xl text-white font-bold">
                S
              </Text>
            </View>
            <View className="font-medium">
              <Text className="text-sm text-center font-bold mt-1">Sidra</Text>
            </View>
          </View>
        </ScrollView>
        <View className="px-5 mt-5">
          <Text className="text-base font-semibold text-black">
            Credit Cards
          </Text>
        </View>
        <List.Section className="bg-white rounded-xl mx-4 mt-4 ">
          {cards.filter((card) => card.isCreditCard).length > 0
            ? cards
              .filter((card) => card.isCreditCard)
              .map((card) => renderCardSection(card, expanded, handlePress))
            : renderNoDataMessage("Credit")}
        </List.Section>
      </ScrollView>
      <Footer />

      <StatusBar
        backgroundColor="#ffffff"
        style="dark"
        translucent={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  box: {
    shadowColor: "#000",
    elevation: 2,
  },
  icon: {
    marginBottom: 8,
    color: Color.PrimaryWebOrient,
  },
  modalContainer: {
    flex: 1,
    flexDirection: "row",
  },
  sidebarContainer: {
    width: "70%",
    backgroundColor: "#f9fafc",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  icon: {
    marginHorizontal: 8,
    color: Color.PrimaryWebOrient,
  },
  accordion: {
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
  },
});

export default HomeScreen;