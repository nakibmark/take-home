import { useCallback, useEffect, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, View, Text } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Cell from "./Cell";

type TransactionResponse = {
  transactions: Transaction[];
  hasMore: boolean;
};

export type Transaction = {
  amount: number;
  currency: string;
  date: number;
  title: string;
  description: string;
  id: string;
  tags: string[];
};

const BASE_URL = "https://assignment.alza.app/transactions";

// from https://stackoverflow.com/questions/37230555/get-with-query-string-with-fetch-in-react-native
function objToQueryString(obj) {
  const keyValuePairs = new Array<string>();
  for (const key in obj) {
    keyValuePairs.push(
      encodeURIComponent(key) + "=" + encodeURIComponent(obj[key])
    );
  }
  return keyValuePairs.join("&");
}

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const lastTransactionId = transactions[transactions.length - 1]?.id;

  const defaultDate = new Date();

  const [fromDate, setFromDate] = useState(defaultDate);
  const [toDate, setToDate] = useState(defaultDate);

  const fetchData = useCallback(() => {
    const queryParams = objToQueryString({
      ...(hasMore && { startingAfter: lastTransactionId }),
      ...(fromDate !== defaultDate && { dateGTE: fromDate.getTime() }),
      ...(toDate !== defaultDate && { dateLTE: toDate.getTime() }),
      ...((fromDate !== defaultDate || toDate !== defaultDate) && {
        limit: 100,
      }),
    });

    fetch(`${BASE_URL}?${queryParams}`, { method: "GET" })
      .then((response) => response.json())
      .then((responseJson: TransactionResponse) => {
        setTransactions(transactions.concat(responseJson.transactions));
        setHasMore(responseJson.hasMore);
      })
      .catch((e) => {
        alert(JSON.stringify(e));
        console.error(e);
      });
  }, [fromDate, toDate, hasMore]);

  useEffect(fetchData, [fromDate, toDate]);

  const renderItem = ({ item }: { item: Transaction }) => (
    <Cell transaction={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.datePicker}>
        <Text>{"Transactions Before: "}</Text>
        <DateTimePicker
          mode="date"
          value={fromDate}
          onChange={(__event, selectedDate) => setFromDate(selectedDate)}
        />
      </View>
      <View style={styles.datePicker}>
        <Text>{"Transactions After: "}</Text>
        <DateTimePicker
          mode="date"
          value={toDate}
          onChange={(__event, selectedDate) => setToDate(selectedDate)}
        />
      </View>
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item: Transaction) => item.id}
        onEndReached={() => {
          if (hasMore || transactions.length === 0) {
            fetchData();
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
});
