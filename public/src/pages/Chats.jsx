import styled from "styled-components"
import { useState, useEffect , useRef} from 'react'
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { allQueueRoute, host } from "../utils/APIRoutes";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import ChatContainer from "../components/ChatContainer";
import { io } from "socket.io-client";


export default function Chats() {
  const socket = useRef();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  

  const setUpSocket = async()=>{
   
    const userId  = currentUser._id;
    //const sessionId = localStorage.getItem("sessionID");

    socket.current = io(host, { autoConnect: false });
    socket.current.auth = {  userId  };
    socket.current.connect();

    // new user add queue
    socket.current.on("user-connected", (data) => {
      console.log('user-connected')
      setContacts((prev)=>[...prev,data]);
    });

    // remove user from queue
    socket.current.on("user-disconnected", (data) => {
      if(contacts != null && contacts.length > 0){
        const newContacts = contacts.filter((x) => x._id != data._id);
        setContacts(newContacts);
      }
    });

  }

  /**
   * Get all user messages
   * @returns 
   */
  const getAllQueue = async()=>{
    
    const data = await  axios.get(`${allQueueRoute}`);
    
    if(data.status != 200 ) {
      console.error("Internal error");
      return;
    }

    setContacts(data.data);
  }

  useEffect( ()=>{
    const navigationTo = async () => {
      if (!localStorage.getItem('chat-app-user'))
      {
        navigate("/login");
      }
      else {
        let  userData = await JSON.parse(localStorage.getItem('chat-app-user'));
        if(! userData.isAvatarImageSet) navigate('/setAvatar');
        setCurrentUser(userData);
      }
    }
    navigationTo();
   }, []);

  useEffect(()=>{
  if(currentUser){
    
    setUpSocket();
    getAllQueue();
    setIsLoaded(true);
  }
  },[currentUser]);

  
  const handleChatChange = (chat) =>{
    setCurrentChat(chat);
  }

  const handleSocketConnection = () =>{
    if(socket.current){
      socket.current.disconnect();
    }
  }

  return (
    <Container>
      <div className="container">
        
        <Contacts contacts={contacts} currentUser={currentUser} closeSocket={handleSocketConnection} changeChat={handleChatChange}/>
        { (isLoaded && currentChat === undefined ) && 
           <Welcome currentUser={currentUser}/>
        }
        { (isLoaded && currentChat !== undefined ) && 
           <ChatContainer currentChat={currentChat} socket={socket} currentUser={currentUser} />
        }
      </div>
    </Container>
  )
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
