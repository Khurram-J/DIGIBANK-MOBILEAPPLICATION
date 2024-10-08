import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
  Pressable,
  TextInput,
  Image,
  Alert,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import { Color } from "../../../GlobalStyles";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import * as MailComposer from "expo-mail-composer";
import CustomModal from "../../../components/CustomModal";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Entypo } from "@expo/vector-icons";
import axios from "axios";
import API_BASE_URL from "./../../../config/index";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { enData } from "./translations/en";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import XLSX from "xlsx";

import * as Sharing from "expo-sharing";

const Account_Statements = () => {
  const navigation = useNavigation();
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [statement, setStatement] = useState({});
  const [filter, setFilter] = useState("All");

  // Modal start
  const [modalVisible, setModalVisible] = useState(false);
  const handleShowModal = () => setModalVisible(true);
  const handleCloseModal = () => setModalVisible(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [email, setEmail] = useState("");

  const [modalVisible2, setModalVisible2] = useState(false);

  useEffect(() => {
    const getEmail = async () => {
      const email = await AsyncStorage.getItem("email");
      setEmail(email);
    };

    getEmail();
  }, []);

  const handleFromDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fromDate;
    setShowFromPicker(false); // hide picker after selection
    setFromDate(currentDate);
  };

  const handleToDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || toDate;
    setShowToPicker(false); // hide picker after selection
    setToDate(currentDate);
  };
  // Modal end

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === "ios");
    setDate(currentDate);
  };

  const showDatePicker = () => {
    setShow(true);
  };

  const hideDatePicker = () => {
    setShow(false);
  };

  const renderTransaction = ({ item }) => {
    const isCredit = item.creditAmt > 0;
    const amount = isCredit ? item.creditAmt : item.debitAmt;

    return (
      <View className="mb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center w-[70%]">
            <Ionicons
              name={
                isCredit
                  ? "arrow-down-circle-outline"
                  : "arrow-up-circle-outline"
              }
              size={24}
              color={isCredit ? "#3bcb01" : "#fe3105"}
            />
            <Text className="text-gray-500 text-sm ml-2">
              {item.description}
            </Text>
          </View>

          <Text
            className="text-lg font-bold ml"
            style={{ color: isCredit ? "#3bcb01" : "#fe3105" }}
          >
            {amount}
          </Text>
        </View>
      </View>
    );
  };

  // Helper function to group transactions by date
  const groupByDate = (transactions) => {
    return transactions.reduce((acc, transaction) => {
      const date = transaction.transactionDate;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {});
  };

  const formatDate2 = (inputDate) => {
    const date = new Date(inputDate);

    // Get the year, month, and day
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    // Format to YYYY-MM-DD
    return `${year}-${month}-${day}`;
  };

  const fetchUserFullTransaction = async () => {
    try {
      const bearerToken = await AsyncStorage.getItem("token");
      const accountNumber = await AsyncStorage.getItem("accountNumber");

      if (bearerToken && accountNumber) {
        const response = await axios.get(
          `${API_BASE_URL}/v1/customer/fund/generateStatement?accountNumber=${accountNumber}&startDate=${formatDate2(
            fromDate
          )}&endDate=${formatDate2(toDate)}&statementType=date_range`,
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
          }
        );

        const dto = response.data;

        if (dto && dto.success && dto.data) {
          const transactions = dto.data.transactionList.data;
          const htmlContent = generateHTML(transactions);

          // Generate PDF and get the temporary URI
          const { uri: tempUri } = await Print.printToFileAsync({
            html: htmlContent,
          });
          console.log("PDF file generated at:", tempUri);

          // Optionally, you can directly share the PDF
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(tempUri, {
              mimeType: "application/pdf",
              dialogTitle: "Share your statement",
            });
          } else {
            Alert.alert(
              "Sharing not available",
              "The sharing feature is not available on this device."
            );
          }
        } else {
          if (dto.message) {
            Alert.alert("Error", dto.message);
          } else if (dto.errors && dto.errors.length > 0) {
            Alert.alert("Error", dto.errors.join("\n"));
          }
        }
      } else {
        Alert.alert("Error", "Unexpected error occurred. Try again later!");
      }
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status;

        if (statusCode === 404) {
          Alert.alert("Error", "Server timed out. Try again later!");
        } else if (statusCode === 503) {
          Alert.alert("Error", "Service unavailable. Please try again later.");
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
    }
  };

  const generateHTML = (transactions) => {
    let html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Account Statement</h1>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
    `;

    transactions.forEach((transaction) => {
      const isCredit = transaction.creditAmt > 0;
      const amount = isCredit ? transaction.creditAmt : transaction.debitAmt;
      html += `
        <tr>
          <td>${transaction.description}</td>
          <td>${transaction.transactionDate}</td>
          <td style="color: ${isCredit ? "#3bcb01" : "#fe3105"}">${amount}</td>
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
        </body>
      </html>
    `;

    return html;
  };

  const fetchUserTransaction = async () => {
    try {
      const bearerToken = await AsyncStorage.getItem("token");
      const accountNumber = await AsyncStorage.getItem("accountNumber");

      if (bearerToken && accountNumber) {
        const response = await axios.get(
          `${API_BASE_URL}/v1/customer/fund/generateStatement?accountNumber=${accountNumber}&startDate=2024-09-01&endDate=2024-09-26&statementType=mini`,
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
          }
        );

        const dto = response.data;

        if (dto && dto.success && dto.data) {
          const groupedTransactions = groupByDate(
            dto.data.transactionList.data
          );
          setStatement(groupedTransactions);
        } else {
          if (dto.message) {
            Alert.alert("Error", dto.message);
          } else if (dto.errors && dto.errors.length > 0) {
            Alert.alert("Error", dto.errors.join("\n"));
          }
        }
      } else {
        Alert.alert("Error", "Unexpected error occurred. Try again later!");
      }
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status;

        if (statusCode === 404) {
          Alert.alert("Error", "Server timed out. Try again later!");
        } else if (statusCode === 503) {
          Alert.alert("Error", "Service unavailable. Please try again later.");
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
    }
  };

 const downloadMiniStatementPDF = async () => {
    try {
      const bearerToken = await AsyncStorage.getItem("token");
      const accountNumber = await AsyncStorage.getItem("accountNumber");

      if (bearerToken && accountNumber) {
        const response = await axios.get(
          `${API_BASE_URL}/v1/customer/fund/generateStatement?accountNumber=${accountNumber}&startDate=2024-09-01&endDate=2024-09-26&statementType=mini`,
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
          }
        );

        const dto = response.data;

        if (dto && dto.success && dto.data) {
          const transactions = dto.data.transactionList.data;

          // Generate HTML content for the PDF
          const htmlContent = generateHTML(transactions);

          // Generate PDF
          const { uri: pdfUri } = await Print.printToFileAsync({
            html: htmlContent,
          });
          console.log("PDF generated at:", pdfUri);

          // Define file name and path in the document directory
          const fileName = `${
            FileSystem.documentDirectory
          }mini_statement_${Date.now()}.pdf`;
          console.log("Saving file to:", fileName);
          await FileSystem.moveAsync({
            from: pdfUri,
            to: fileName,
          });

          // Share the PDF to enable user to save it in the Downloads folder
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileName, {
              mimeType: "application/pdf",
              dialogTitle: "Save your statement",
            });
          } else {
            Alert.alert(
              "Sharing not available",
              "The sharing feature is not available on this device."
            );
          }
        } else {
          Alert.alert("Error", dto.message || "Failed to fetch transactions.");
        }
      } else {
        Alert.alert("Error", "Token or Account Number missing.");
      }
    } catch (error) {
      console.log("Error:", error);
      Alert.alert("Error", "An error occurred while generating the PDF.");
    }
  };

  const downloadMiniStatementExcel = async () => {
    try {
      const bearerToken = await AsyncStorage.getItem("token");
      const accountNumber = await AsyncStorage.getItem("accountNumber");

      if (bearerToken && accountNumber) {
        const response = await axios.get(
          `${API_BASE_URL}/v1/customer/fund/generateStatement?accountNumber=${accountNumber}&startDate=2024-09-01&endDate=2024-09-26&statementType=mini`,
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
          }
        );

        const dto = response.data;

        if (dto && dto.success && dto.data) {
          const transactions = dto.data.transactionList.data;

          // Create Excel sheet
          const ws = XLSX.utils.json_to_sheet(transactions);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Mini Statement");

          const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

          const uri = `${
            FileSystem.documentDirectory
          }mini_statement_${Date.now()}.xlsx`;
          await FileSystem.writeAsStringAsync(uri, wbout, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Share the Excel file
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
              mimeType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              dialogTitle: "Save your statement",
            });
          } else {
            Alert.alert(
              "Sharing not available",
              "The sharing feature is not available on this device."
            );
          }
        } else {
          Alert.alert("Error", dto.message || "Failed to fetch transactions.");
        }
      } else {
        Alert.alert("Error", "Token or Account Number missing.");
      }
    } catch (error) {
      console.log("Error:", error);
      Alert.alert("Error", "An error occurred while generating the Excel file.");
    }
  };

  useEffect(() => {
    fetchUserTransaction();
  }, []);

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "long", year: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", options);
  };

  const filterDatesWithTransactions = (groupedTransactions = {}) => {
    return Object.keys(groupedTransactions)
      .filter((date) => {
        const filteredTransactions = filterTransactions(
          groupedTransactions[date]
        );
        return filteredTransactions.length > 0;
      })
      .sort((a, b) => new Date(b) - new Date(a)); // Sort dates in descending order
  };

  const filterTransactions = (transactions = []) => {
    switch (filter) {
      case "IN":
        return transactions.filter((transaction) => transaction.creditAmt > 0);
      case "OUT":
        return transactions.filter((transaction) => transaction.debitAmt > 0);
      default:
        return transactions;
    }
  };

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View className="flex-row items-center justify-between p-3 bg-white">
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          className=" "
          style={{ zIndex: 1 }}
        >
          <Entypo name="chevron-left" size={30} color="black" />
        </TouchableOpacity>
        <View className="absolute left-0 right-0 flex-row justify-center">
          <Text className="text-lg font-bold text-center">
            Account Statement
          </Text>
        </View>
      </View>

      {/* Tabs and Balance Summary */}
      <View className="flex-row justify-between bg-white p-3">
        <View className="flex-row shadow-lg rounded-md shadow-gray-300">
          <TouchableOpacity
            className={`px-4 py-2 ${
              filter === "All" ? "bg-primary" : "bg-white"
            } rounded-l-md`}
            onPress={() => setFilter("All")}
          >
            <Text
              className={`${
                filter === "All" ? "text-white" : "text-black"
              } font-semibold text-base text-center`}
            >
              All
            </Text>
          </TouchableOpacity>
          <View className="flex-row shadow-gray-300">
            <TouchableOpacity
              className={`px-4 py-2 ${
                filter === "IN" ? "bg-primary" : "bg-white"
              }`}
              onPress={() => setFilter("IN")}
            >
              <Text
                className={`${
                  filter === "IN" ? "text-white" : "text-black"
                }  font-semibold text-base text-center`}
              >
                IN
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-4 py-2 ${
                filter === "OUT" ? "bg-primary" : "bg-white"
              } rounded-r-md`}
              onPress={() => setFilter("OUT")}
            >
              <Text
                className={`${
                  filter === "OUT" ? "text-white" : "text-black"
                }  font-semibold text-base text-center`}
              >
                OUT
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-row space-x-2">
          <View>
            <TouchableOpacity
              className="p-2 rounded-md bg-primary"
              // onPress={showDatePicker}
              onPress={handleShowModal}
            >
              <Ionicons
                style={{ color: "white" }}
                name="calendar-outline"
                size={24}
              />
            </TouchableOpacity>

            {/* {show && Platform.OS === "ios" && (
              <Modal
                transparent={true}
                animationType="slide"
                visible={show}
                onRequestClose={hideDatePicker}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.3)",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "white",
                      padding: 20,
                      borderRadius: 10,
                    }}
                  >
                    <DateTimePicker
                      testID="dateTimePicker"
                      value={date}
                      mode="date"
                      display="default"
                      onChange={onChange}
                    />
                    <Button onPress={hideDatePicker} title="Done" />
                  </View>
                </View>
              </Modal>
            )}

            {show && Platform.OS === "android" && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                display="default"
                onChange={onChange}
                onClose={hideDatePicker}
              />
            )} */}
          </View>
          <TouchableOpacity
            className="p-2 rounded-md border border-gray-300 shadow-xl"
            onPress={() => setModalVisible2(true)}
          >
            <Ionicons name="download" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row justify-center items-center text-center p-4">
        <View className="bg-blue-500 px-6 py-4 rounded-md bg-primary ">
          <Text className="text-white  font-semibold  text-lg text-center">
            4,925.15
          </Text>
          <Text className="text-white text-sm text-center">
            Opening Balance
          </Text>
        </View>
        <View className="bg-white border  px-6 py-4 border-gray-200  rounded-lg">
          <Text className="text-black font-semibold text-lg text-center">
            4,925.15
          </Text>
          <Text className="text-black  text-sm text-center">
            Closing Balance
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView>
      {statement ? (
        <FlatList
          data={filterDatesWithTransactions(statement)}
          renderItem={({ item: date }) => (
            <View key={date} className="-top-3">
              <View className="bg-gray-200 p-2 rounded-md my-4 mx-5">
                <Text className="text-lg font-semibold">
                  {formatDate(date)}
                </Text>
              </View>
              <FlatList
                renderItem={renderTransaction}
                data={filterTransactions(statement[date])} // Filter transactions for that specific date
                keyExtractor={(item) => item.transactionId}
                className="px-4"
              />
            </View>
          )}
          keyExtractor={(item) => item}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <Text>Loading...</Text>
      )}

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={handleCloseModal} // Handles closing with back button
      >
        {/* Outer Pressable to close modal on outside click */}
        <Pressable
          onPress={handleCloseModal}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Inner Pressable prevents closing when clicking inside modal */}
          <Pressable
            onPress={() => {}}
            style={{
              width: "90%",
              backgroundColor: "white",
              borderRadius: 20,
              padding: 20,
            }}
          >
            {/* Check Icon */}
            <View
              style={{ position: "absolute", top: -30, alignSelf: "center" }}
            >
              <Image
                source={require("../../../assets/Account_statement.png")}
                style={{ width: 70, height: 70 }}
                resizeMode="contain"
              />
            </View>

            {/* Modal Content */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 10,
                paddingTop: 20,
                textAlign: "center",
              }}
            >
              Get Statement via Email
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              You can get the statement for up to 3 years
            </Text>

            {/* Date Pickers */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              {/* From Date */}
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ fontSize: 14, marginBottom: 5 }}>From</Text>
                <Pressable
                  onPress={() => setShowFromPicker(true)}
                  style={{
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 8,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text>
                    {fromDate ? fromDate.toLocaleDateString() : "Select Date"}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} />
                </Pressable>

                {showFromPicker && (
                  <DateTimePicker
                    value={fromDate || new Date()}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={handleFromDateChange}
                  />
                )}
              </View>

              {/* To Date */}
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontSize: 14, marginBottom: 5 }}>To</Text>
                <Pressable
                  onPress={() => setShowToPicker(true)}
                  style={{
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 8,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text>
                    {toDate ? toDate.toLocaleDateString() : "Select Date"}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} />
                </Pressable>

                {showToPicker && (
                  <DateTimePicker
                    value={toDate || new Date()}
                    mode="date"
                    display="default"
                    minimumDate={fromDate || new Date()}
                    maximumDate={new Date()}
                    onChange={handleToDateChange}
                  />
                )}
              </View>
            </View>

            {/* Email Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, marginBottom: 5 }}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                style={{
                  borderWidth: 1,
                  padding: 10,
                  borderRadius: 8,
                  width: "100%",
                }}
              />
            </View>

            {/* Confirm Button */}
            <Pressable
              onPress={fetchUserFullTransaction}
              style={{
                backgroundColor: Color.PrimaryWebOrient,
                padding: 15,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Send Now
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible2}
        onRequestClose={() => setModalVisible2(false)}
      >
        <View 
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}>
          <View className="bg-white px-3  py-6 rounded-lg shadow-lg w-[70%]">
          <View
              style={{ position: "absolute", top: -30, alignSelf: "center" }}
            >
              <Image
                source={require("../../../assets/Download_modal.png")}
                style={{ width: 70, height: 70 }}
                resizeMode="contain"
              />
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 10,
                paddingTop: 20,
                textAlign: "center",
              }}
            >Select Format</Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              You can download the file in PDF or export it to Excel format for convenience.
            </Text>

            <TouchableOpacity
              className="p-2 rounded-md bg-cyan-500 mb-4 mx-8"
              onPress={() => {
                setModalVisible2(false);
                downloadMiniStatementPDF();
              }}
            >
              <Text className="text-white text-center">Download In PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="p-2 rounded-md bg-white mx-8 border border-gray-500"
              onPress={() => {
                setModalVisible2(false);
                downloadMiniStatementExcel();
              }}
            >
              <Text className="text-gray-500 text-center">Download In Excel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4"
              onPress={() => setModalVisible2(false)}
            >
              <Text className="text-center text-red-500">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Account_Statements;
