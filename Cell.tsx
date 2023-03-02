import { Text, View, StyleSheet } from "react-native";
import { Transaction } from "./App";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const Cell = ({
  transaction,
}: {
  transaction: Transaction | undefined;
}) => {
  const transactionDate = new Date(transaction?.date * 1000 ?? 0);

  return (
    <View style={styles.cell}>
      <View>
        <Text style={styles.title}>
          {transaction.title}
          {"\n"}
        </Text>
        <Text>
          {transaction.description}
          {"\n"}
        </Text>
      </View>
      <View style={styles.right}>
        <Text>
          {transaction.currency === "usd"
            ? USD.format(transaction.amount)
            : transaction.amount}
        </Text>
        <Text>{new Intl.DateTimeFormat("en-US").format(transactionDate)}</Text>
        {Array.isArray(transaction.tags) && (
          <Text style={styles.tags}>{transaction.tags.join(", ")}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cell: {
    borderWidth: 4,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  tags: {
    fontStyle: "italic",
  },
  right: {
    alignItems: "flex-end",
    paddingRight: 4,
  },
});

export default Cell;
