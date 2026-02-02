import { Card, Text } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { getBaskets } from "../../../../services/transactions/transactions.service";
export default function PrevBasket(props) {
  const [basketData, setBasketData] = useState([]);
  useEffect(() => {
    const getBasket = async () => {
      const res = await getBaskets();
      
      setBasketData(res?.data);
    };
    getBasket();
  }, []);
  

  return (
    <>
     
        <Card variant="bordered">
          <Card.Header>
            <Text></Text>
          </Card.Header>
        </Card>
    
    </>
  );
}
