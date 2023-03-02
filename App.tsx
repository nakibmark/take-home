import { useCallback, useEffect, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, View, Text } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Cell from "./Cell";

type TransactionResponse = {
  transactions?: Transaction[];
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

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const lastTransactionId = transactions[transactions.length - 1]?.id;

  const [fromDate, setFromDate] = useState<Date>(null);
  const [toDate, setToDate] = useState<Date>(null);
  const isFiltering = toDate !== null || fromDate !== null;

  const fetchMore = useCallback(() => {
    fetch(
      `${BASE_URL}?${hasMore ? "startingAfter=" + lastTransactionId : ""}`,
      { method: "GET" }
    )
      .then((response) => response.json())
      .then((responseJson: TransactionResponse) => {
        if (responseJson.transactions && responseJson.transactions.length) {
          setTransactions(transactions.concat(responseJson.transactions));
        }
        setHasMore(responseJson.hasMore);
      })
      .catch((e) => {
        console.error(e);
      });
  }, [hasMore, transactions]);

  const fetchFilters = useCallback(() => {
    const URL = `${BASE_URL}?limit=100${
      fromDate !== null ? "&dateGTE=" + fromDate.getTime() / 1000 : ""
    }${toDate !== null ? "&dateLTE=" + toDate.getTime() / 1000 : ""}`;

    fetch(URL, { method: "GET" })
      .then((response) => response.json())
      .then((responseJson: TransactionResponse) => {
        if (responseJson.transactions && responseJson.transactions.length) {
          setTransactions(responseJson.transactions);
        } else {
          setTransactions([]);
        }
        setHasMore(responseJson.hasMore);
      })
      .catch((e) => {
        console.error(e);
      });
  }, [fromDate, toDate]);

  useEffect(() => {
    fetch(BASE_URL, { method: "GET" })
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.transactions && responseJson.transactions.length) {
          setTransactions(responseJson.transactions);
        }
        setHasMore(responseJson.hasMore);
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  const renderItem = ({ item }: { item: Transaction }) => (
    <Cell transaction={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.datePicker}>
        <Text>{"Transactions Before: "}</Text>
        <DateTimePicker
          mode="date"
          value={toDate || new Date()}
          onChange={(__event, selectedDate) => {
            setToDate(selectedDate);
            fetchFilters();
          }}
        />
      </View>
      <View style={styles.datePicker}>
        <Text>{"Transactions After: "}</Text>
        <DateTimePicker
          mode="date"
          value={fromDate || new Date()}
          onChange={(__event, selectedDate) => {
            setFromDate(selectedDate);
            fetchFilters();
          }}
        />
      </View>

      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item: Transaction, index) => `index_${index}_${item.id}`}
        onEndReached={() => {
          if (!isFiltering && hasMore) {
            fetchMore();
          }
        }}
        ListEmptyComponent={<Text>No results found.</Text>}
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
