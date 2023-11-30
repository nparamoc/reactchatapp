import React, { useState, useEffect, useRef } from 'react'
import styled from "styled-components"
import ChatInput from './ChatInput';
import Hang from './Hang';
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAllMessagesRoute, sendMessageRoute, pickUserRoute } from '../utils/APIRoutes'
import enums from '../utils/enums'
import { v4 as uuidv4 } from "uuid";

export default function ChatContainer({ currentChat, currentUser, socket }) {
  const [messages, setMessages] = useState([]);
  const [inputEnable, setinputEnable] = useState(false);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef();
  const doRequest = useRef(false);

  const toastOptions = {
    //position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  /**
   * Init functions
   */
  const initFunctions = async () => {
    console.log(JSON.stringify(currentChat))
    if (currentChat) {
      await pickUser();
      await getAllMessages();
      setinputEnable(true);
    }
  }

  /**
   * Select user and assing an agent
   * @returns 
   */
  const pickUser = async () => {
    if (currentUser) {
      const response = await axios.post(pickUserRoute, {
        agentId: currentUser._id,
        conversationId: currentChat._id,
        type: enums.ActivtyType.AssignetAgent,
        channelId: 2,
      });

      if (response.status != 200) {
        toast.error("Internal error", toastOptions);
        return false;
      }

      if (response.data.state == enums.ApiCodes.UserQueueAlreadyAsigned) {
        toast.error("User already assigned", toastOptions);
        return false;
      }

      return true;
    }

    return false;
  }

  /**
   * Get all user messages
   * @returns 
   */
  const getAllMessages = async () => {
    if (currentChat) {
      const msj = await axios.post(getAllMessagesRoute, {
        from: currentChat._id,
        to: currentUser._id,
      });

      if (msj.status != 200) {
        toast.error("Internal error", toastOptions);
        return;
      }
      setMessages(msj.data);
    }
  }

  //handleHang
  const handleHang = async () => {
   
    // close conversation
    const response = await axios.post(sendMessageRoute, {
      from: currentUser._id,
      to: currentChat._id,
      text: 'Close conversation',
      agentId: currentUser._id,
      conversationId: currentChat._id,
      type: enums.ActivtyType.EndOfConversation,
      channelId: 2,
    });

    if (response.status != 200) {
      toast.error("Internal error", toastOptions);
      return false;
    }

    setinputEnable(false);
  }

  useEffect(() => {
    if (doRequest.current) initFunctions();
    else doRequest.current = true;
  }, [currentChat]);



  const handleSendMsg = async (msg) => {
    const response = await axios.post(sendMessageRoute, {
      from: currentUser._id,
      to: currentChat._id,
      text: msg,
      agentId: currentUser._id,
      conversationId: currentChat._id,
      type: 1,
      channelId: 2,
    });

    if (response.status != 200) {
      toast.error("Internal error", toastOptions);
      return false;
    }

    /*
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: currentUser._id,
      message: msg,
    });
    */
    const msgs = [...messages];
    msgs.push({
      fromSelf: true,
      message: msg,
    });
    setMessages(msgs);
  };


  useEffect(() => {
    socket.current.on("msg-recieved", (msg) => {
      console.log(`msg-recieved ${msg}`)
      setArrivalMessage({
        fromSelf: false,
        message: msg,
      });
    })
  }, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {
        currentChat && (
          <Container>
            <div className="chat-header">
              <div className="user-details">
                <div className="avatar">
                  <img
                    src={`data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMzEgMjMxIj48cGF0aCBkPSJNMzMuODMsMzMuODNhMTE1LjUsMTE1LjUsMCwxLDEsMCwxNjMuMzQsMTE1LjQ5LDExNS40OSwwLDAsMSwwLTE2My4zNFoiIHN0eWxlPSJmaWxsOiNGRkMxMDc7Ii8+PHBhdGggZD0ibTExNS41IDUxLjc1YTYzLjc1IDYzLjc1IDAgMCAwLTEwLjUgMTI2LjYzdjE0LjA5YTExNS41IDExNS41IDAgMCAwLTUzLjcyOSAxOS4wMjcgMTE1LjUgMTE1LjUgMCAwIDAgMTI4LjQ2IDAgMTE1LjUgMTE1LjUgMCAwIDAtNTMuNzI5LTE5LjAyOXYtMTQuMDg0YTYzLjc1IDYzLjc1IDAgMCAwIDUzLjI1LTYyLjg4MSA2My43NSA2My43NSAwIDAgMC02My42NS02My43NSA2My43NSA2My43NSAwIDAgMC0wLjA5OTYxIDB6IiBzdHlsZT0iZmlsbDojRkFEMkI5OyIvPjxwYXRoIGQ9Im0xNDEuNzUgMTk1YTExNC43OSAxMTQuNzkgMCAwIDEgMzggMTYuNSAxMTUuNTMgMTE1LjUzIDAgMCAxLTEyOC40NiAwIDExNC43OSAxMTQuNzkgMCAwIDEgMzgtMTYuNWwxNS43MSAxNS43NWgyMXoiIHN0eWxlPSJmaWxsOiMxZTVlODA7Ii8+PHBhdGggZD0ibTg5LjI5MSAxOTVhMTE0Ljc5IDExNC43OSAwIDAgMC0zOC4wMDIgMTYuNSAxMTUuNTMgMTE1LjUzIDAgMCAwIDM4LjAwMiAxNi40ODJ6bTUyLjQzNCAwdjMyLjk4MmExMTUuNTMgMTE1LjUzIDAgMCAwIDM4LTE2LjQ4MiAxMTQuNzkgMTE0Ljc5IDAgMCAwLTM4LTE2LjV6IiBzdHlsZT0iZmlsbDojZmZmOyIvPjxwYXRoIGQ9Im0xNTcuMTUgMTk5Ljc1YzAuMjU0OCA3LjQ1MDEgMS41NCAxNC44NTUgNC45NTEyIDIxLjQzMmExMTUuNTMgMTE1LjUzIDAgMCAwIDE3LjYxOS05LjY3OTcgMTE0Ljc5IDExNC43OSAwIDAgMC0yMi41Ny0xMS43NTJ6bS04My4yOTUgMmUtM2ExMTQuNzkgMTE0Ljc5IDAgMCAwLTIyLjU3IDExLjc1IDExNS41MyAxMTUuNTMgMCAwIDAgMTcuNjIxIDkuNjc5N2MzLjQxMS02LjU3NjUgNC42OTQ0LTEzLjk4IDQuOTQ5Mi0yMS40M3oiIHN0eWxlPSJmaWxsOiMxZTVlODA7Ii8+PHBhdGggZD0ibTk5LjE5NyAyMDQuOTd2MmUtM2wxNi4zMDIgMTYuMzAxIDE2LjMwMS0xNi4zMDF2LTJlLTN6IiBzdHlsZT0iZmlsbDojZmZmOyIvPjxwYXRoIGQ9Im0zMC42MjIgNzAuMzgxYzIuMDk3MS0zLjkzNzQgNC42NjQ5LTcuOTYwNCA3LjY4MjItMTIuMDM3IDMuMDE3Mi00LjA3NjUgNi4wOTg3LTcuNjkyOSA5LjIyMjktMTAuODE3bDIyLjg5NyAyMi44OTdjLTQuNDQwMiA0LjQ0MDMtOC4yMjc4IDkuNTQzOS0xMS4yMTMgMTUuMTR6IiBzdHlsZT0iZmlsbDojZGQxMDRmOyIvPjxwYXRoIGQ9Im0xNjAuNTggNzAuNDIzIDIyLjkwNy0yMi44OTdjMy4xMjQyIDMuMTI0MiA2LjIwNTYgNi43NDA2IDkuMjIyOSAxMC44MTcgMy4wMDY1IDQuMDc2NSA1LjU3NDQgOC4wOTk0IDcuNjcxNSAxMi4wMzdsLTI4LjU3OCAxNS4xODJjLTIuOTg1MS01LjU5NTgtNi43NzI3LTEwLjY4OS0xMS4yMjQtMTUuMTR6IiBzdHlsZT0iZmlsbDojZGQxMDRmOyIvPjxwYXRoIGQ9Im05Mi40MTEgMTUuMjQ3YzMuODE5Ny0wLjg3NzM2IDcuNjcxNS0xLjU0MDcgMTEuNTM0LTEuOTc5NCA0LjA3NjUtMC40NjAwNyA3LjkyODItMC42OTU0NiAxMS41NTUtMC42OTU0NiAxLjUzIDAgMy4xNTYzIDAuMDQyOCA0Ljg2ODIgMC4xMzkxbDEuODUxIDIyLjI1NSA1Ljc2Ny0yMS41N2MzLjEwMjggMC4zNzQ0OSA2LjA2NjYgMC44NjY2NiA4Ljg5MTIgMS40NjU4bC0xMC41NSA0OS43NjNjLTEuOTI1OS0wLjQxNzI5LTMuNzAyLTAuNzA2MTctNS4zMTc2LTAuODc3MzYtMS40MjMtMC4xNDk3OS0zLjI2MzMtMC4yMjQ2OC01LjUxMDItMC4yMjQ2OC0yLjIzNjIgMC00LjIzNyAwLjEwNjk5LTUuOTgxIDAuMjk5NTgtMS45NDczIDAuMjI0NjktMy44NzMyIDAuNTU2MzYtNS43NjcgMC45OTUwNHoiIHN0eWxlPSJmaWxsOiNmNzNiNmM7Ii8+PHBhdGggZD0ibTkyLjQxMSAxNS4yNDdjMS45MTUyLTAuNDM4NjkgNC4wMjMtMC44NDUyNiA2LjMyMzMtMS4yMzA0IDIuMDY1LTAuMzQyMzggNC4xNTE0LTAuNjIwNTcgNi4yNjk4LTAuODQ1MjVsNS4xNzg1IDUwLjU2NWMtMS4wOTEzIDAuMTA2OTktMi4xODI3IDAuMjU2NzktMy4yOTU0IDAuNDM4NjgtMC44NjY2NSAwLjE0OTc5LTEuOTE1MiAwLjM2Mzc4LTMuMTM0OSAwLjY0MTk2eiIgc3R5bGU9ImZpbGw6I2RkMTA0ZjsiLz48cGF0aCBkPSJtOTcuNTYgMTA3Ljg0YTEwLjYzIDEwLjYzIDAgMCAxLTE1IDAuMTNsLTAuMTMtMC4xMyIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjYuM3B4O3N0cm9rZTojMDAwOyIvPjxwYXRoIGQ9Im0xNDguNTkgMTA3Ljg0YTEwLjYzIDEwLjYzIDAgMCAxLTE1IDAuMTNsLTAuMTMtMC4xMyIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjYuM3B4O3N0cm9rZTojMDAwOyIvPjxwYXRoIGQ9Im05NC4xOSAxMzYuODRoNDIuNjMyYTMuNzgwMSAzLjc4IDAgMCAxIDMuNzgwMiAzLjc4djMuMjJhMTUuMjMxIDE1LjIzIDAgMCAxLTE1LjIxMSAxNS4xNmgtMTkuNzgxYTE1LjI1MSAxNS4yNSAwIDAgMS0xNS4yMjEtMTUuMTZ2LTMuMjJhMy44MDAyIDMuOCAwIDAgMSAzLjc4MDItMy43OHoiIHN0eWxlPSJmaWxsOiNmZmY7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDozcHg7c3Ryb2tlOiMwMDA7Ii8+PHBhdGggZD0ibTEzMC45NiAxMzYuODR2MjEuMTZtLTMwLjkxMS0yMS4xNnYyMS4xNm0xMC4zNC0yMS4xNnYyMi4xNm0xMC4zMS0yMi4ydjIyLjIiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDozcHg7c3Ryb2tlOiMwMDA7Ii8+PC9zdmc+`}
                    alt="avatar" />
                </div>
                <div className="username">
                  <h3>{currentChat.username}</h3>
                </div>
              </div>
              {inputEnable &&
                <Hang  handEvent={handleHang}  />
              }
            </div>
            <div className="chat-messages">
              {messages.map((message) => {
                return (
                  <div ref={scrollRef} key={uuidv4()}>
                    <div
                      className={`message ${message.fromSelf ?
                        "recieved" :
                        "sended"
                        }`}
                    >
                      <div className="content ">
                        <p>{message.message}</p> 
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {inputEnable &&
              <ChatInput handleSendMsg={handleSendMsg} />
            }
          </Container>
        )
      }
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
          text-transform: capitalize;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;