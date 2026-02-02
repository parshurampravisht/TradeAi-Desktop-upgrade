import React, {createContext,useContext,useState} from 'react';
const FinalDataContext = createContext();
export const FinalDataProvider = ({children})=>{
    const [finalData,setFinalData]=useState([]);
   
    const updateFinalData = newData =>{
        if (newData && Object.keys(newData).length > 0) {
            setFinalData((prevdata) => [...prevdata, newData]);
          } 
    }
    const deleteBasketData= ()=>{
        setFinalData([]);
    }
    return <FinalDataContext.Provider value={{finalData,updateFinalData,deleteBasketData}}>
        {children}
    </FinalDataContext.Provider>
}
export const useFinalData = ()=>{
    return useContext(FinalDataContext);
}