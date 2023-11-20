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
  

  useEffect( ()=>{
    const navigationTo = async () => {
      if (!localStorage.getItem('chat-app-user'))
      {
        navigate("/login");
      }
      else {
        setCurrentUser(await JSON.parse(localStorage.getItem('chat-app-user')));
        setIsLoaded(true);
      }
    }
    navigationTo();
   }, []);

   useEffect(()=>{
    if(currentUser){
      
      const userId  = currentUser._id;
      const sessionId = localStorage.getItem("sessionID");

      if (sessionId) {
        socket.current = io(host);
        socket.current.auth = {  sessionId  };
        socket.current.connect();
      }else{
        socket.current = io(host, { autoConnect: false });
        socket.current.auth = {  userId  };
        socket.current.connect();
      }

      //socket.current.emit("add-agent", userId);
      socket.current.on("add-session", (data) => {
        const { sessionId, userId } = data;
        console.log(data.sessionId + ' - ' + data.userId)
        // attach the session ID to the next reconnection attempts
        socket.auth = { sessionId };
        // store it in the localStorage
        localStorage.setItem("sessionID", sessionId);
        // save the ID of the user
        socket.userId = userId;
      })

      // new user add queue
      socket.current.on("add-user", (data) => {
        setContacts((prev)=>[...prev,data]);
      });

      // remove user from queue
      socket.current.on("remove-user", (data) => {
        if(contacts != null && contacts.length > 0){
          const newContacts = contacts.filter((x) => x._id != data._id);
          setContacts(newContacts);
        }
      });

    }
   },[currentUser]);

  useEffect( () => {
    const getCurrentUser = async()=>{
      if( currentUser)  {
      if(currentUser.isAvatarImageSet){
        //const data = await  axios.get(`${allUsersRoute}/${currentUser._id}`);
        const data = await  axios.get(`${allQueueRoute}`);
        setContacts(data.data);
      } else{
        navigate('/setAvatar');
      }
    }
    }
      getCurrentUser();
  }, [currentUser]);

  const handleChatChange = (chat) =>{
    setCurrentChat(chat);
  }

  return (
    <Container>
      <div className="container">
        
        <Contacts contacts={contacts} currentUser={currentUser} socket={socket}  changeChat={handleChatChange}/>
        { isLoaded &&
          currentChat === undefined ?
           <Welcome currentUser={currentUser}/> : 
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
