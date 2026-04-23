import Button from "../ui/Button";
import Card from "../ui/Card";
import api from "../../services/api";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import useGroup from "../../hooks/useGroup";

const PaymentRow = ({ member, onRefresh }) => {
  const {  month } = useContext(AppContext);
  const groupId = useGroup();

  const handleCollect = async () => {
    try {
      await api.post("/payments", {
        groupId,
        memberId: member.memberId,
        month,
        amount: 15500,
        paymentMode: "CASH",
      });

      onRefresh(); // reload ledger
    } catch (err) {
      alert("Payment already done");
    }
  };

  return (
    <Card className="flex justify-between items-center">
      <div>
        <h3 className="font-medium">{member.name}</h3>
        <p className="text-xs text-gray-400">
          {member.paid ? "Paid" : "Pending"}
        </p>
      </div>

      {member.paid ? (
        <span className="text-green-600 text-sm font-medium">✔ Paid</span>
      ) : (
        <Button onClick={handleCollect}>Collect</Button>
      )}
    </Card>
  );
};

export default PaymentRow;