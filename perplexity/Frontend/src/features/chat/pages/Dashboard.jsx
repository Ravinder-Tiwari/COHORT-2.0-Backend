import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useChat } from '../hooks/useChat';

const Dashboard = () => {
  const chat = useChat()
  useEffect(()=>{
    chat.initializeSocketConnection()
  },[])
    const {user} = useSelector(state=>state.auth)
    // console.log(user)
  return (
    <div>Dashboard</div>
  );
};

export default Dashboard;