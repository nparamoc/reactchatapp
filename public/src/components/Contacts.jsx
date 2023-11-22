import React, { useState, useEffect } from 'react'
import styled from "styled-components"
import Logo from '../assets/logo.svg'
import Logout from './Logout';

export default function Contacts({ contacts, currentUser, closeSocket, changeChat }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);

  useEffect(() => {
    if (currentUser) {
        setCurrentUserImage(currentUser.avatarImage);
        setCurrentUserName(currentUser.username);
    }
  }, [currentUser]);

  const changeCurrentChat = async(index, contact) => { 
    setCurrentSelected(index);
    changeChat(contact);
  };

  //changeTurnOff
  const handleAgentOff = (turnOff) => { 
    closeSocket();
  };

  return (
      <>
          {
              currentUserImage && currentUserName && (
                  <Container>
                      <div className="brand">
                          <img src={Logo} alt="logo" />
                          <h3>RChat</h3>
                          <Logout logoutEvent={handleAgentOff} />
                      </div>
                      <div className="contacts">
                          {

                            
                              contacts.map((contact, index) => {
                                  return (
                                      <div
                                          className={`contact ${
                                          index === currentSelected ? "selected" : ""
                                          }`}
                                            key={contact._id}
                                            onClick={()=>changeCurrentChat(index,contact)}>
                                          <div className="avatar">
                                              <img src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMzEgMjMxIj48cGF0aCBkPSJNMzMuODMsMzMuODNhMTE1LjUsMTE1LjUsMCwxLDEsMCwxNjMuMzQsMTE1LjQ5LDExNS40OSwwLDAsMSwwLTE2My4zNFoiIHN0eWxlPSJmaWxsOiNGRkMxMDc7Ii8+PHBhdGggZD0ibTExNS41IDUxLjc1YTYzLjc1IDYzLjc1IDAgMCAwLTEwLjUgMTI2LjYzdjE0LjA5YTExNS41IDExNS41IDAgMCAwLTUzLjcyOSAxOS4wMjcgMTE1LjUgMTE1LjUgMCAwIDAgMTI4LjQ2IDAgMTE1LjUgMTE1LjUgMCAwIDAtNTMuNzI5LTE5LjAyOXYtMTQuMDg0YTYzLjc1IDYzLjc1IDAgMCAwIDUzLjI1LTYyLjg4MSA2My43NSA2My43NSAwIDAgMC02My42NS02My43NSA2My43NSA2My43NSAwIDAgMC0wLjA5OTYxIDB6IiBzdHlsZT0iZmlsbDojRkFEMkI5OyIvPjxwYXRoIGQ9Im0xNDEuNzUgMTk1YTExNC43OSAxMTQuNzkgMCAwIDEgMzggMTYuNSAxMTUuNTMgMTE1LjUzIDAgMCAxLTEyOC40NiAwIDExNC43OSAxMTQuNzkgMCAwIDEgMzgtMTYuNWwxNS43MSAxNS43NWgyMXoiIHN0eWxlPSJmaWxsOiMxZTVlODA7Ii8+PHBhdGggZD0ibTg5LjI5MSAxOTVhMTE0Ljc5IDExNC43OSAwIDAgMC0zOC4wMDIgMTYuNSAxMTUuNTMgMTE1LjUzIDAgMCAwIDM4LjAwMiAxNi40ODJ6bTUyLjQzNCAwdjMyLjk4MmExMTUuNTMgMTE1LjUzIDAgMCAwIDM4LTE2LjQ4MiAxMTQuNzkgMTE0Ljc5IDAgMCAwLTM4LTE2LjV6IiBzdHlsZT0iZmlsbDojZmZmOyIvPjxwYXRoIGQ9Im0xNTcuMTUgMTk5Ljc1YzAuMjU0OCA3LjQ1MDEgMS41NCAxNC44NTUgNC45NTEyIDIxLjQzMmExMTUuNTMgMTE1LjUzIDAgMCAwIDE3LjYxOS05LjY3OTcgMTE0Ljc5IDExNC43OSAwIDAgMC0yMi41Ny0xMS43NTJ6bS04My4yOTUgMmUtM2ExMTQuNzkgMTE0Ljc5IDAgMCAwLTIyLjU3IDExLjc1IDExNS41MyAxMTUuNTMgMCAwIDAgMTcuNjIxIDkuNjc5N2MzLjQxMS02LjU3NjUgNC42OTQ0LTEzLjk4IDQuOTQ5Mi0yMS40M3oiIHN0eWxlPSJmaWxsOiMxZTVlODA7Ii8+PHBhdGggZD0ibTk5LjE5NyAyMDQuOTd2MmUtM2wxNi4zMDIgMTYuMzAxIDE2LjMwMS0xNi4zMDF2LTJlLTN6IiBzdHlsZT0iZmlsbDojZmZmOyIvPjxwYXRoIGQ9Im0zMC42MjIgNzAuMzgxYzIuMDk3MS0zLjkzNzQgNC42NjQ5LTcuOTYwNCA3LjY4MjItMTIuMDM3IDMuMDE3Mi00LjA3NjUgNi4wOTg3LTcuNjkyOSA5LjIyMjktMTAuODE3bDIyLjg5NyAyMi44OTdjLTQuNDQwMiA0LjQ0MDMtOC4yMjc4IDkuNTQzOS0xMS4yMTMgMTUuMTR6IiBzdHlsZT0iZmlsbDojZGQxMDRmOyIvPjxwYXRoIGQ9Im0xNjAuNTggNzAuNDIzIDIyLjkwNy0yMi44OTdjMy4xMjQyIDMuMTI0MiA2LjIwNTYgNi43NDA2IDkuMjIyOSAxMC44MTcgMy4wMDY1IDQuMDc2NSA1LjU3NDQgOC4wOTk0IDcuNjcxNSAxMi4wMzdsLTI4LjU3OCAxNS4xODJjLTIuOTg1MS01LjU5NTgtNi43NzI3LTEwLjY4OS0xMS4yMjQtMTUuMTR6IiBzdHlsZT0iZmlsbDojZGQxMDRmOyIvPjxwYXRoIGQ9Im05Mi40MTEgMTUuMjQ3YzMuODE5Ny0wLjg3NzM2IDcuNjcxNS0xLjU0MDcgMTEuNTM0LTEuOTc5NCA0LjA3NjUtMC40NjAwNyA3LjkyODItMC42OTU0NiAxMS41NTUtMC42OTU0NiAxLjUzIDAgMy4xNTYzIDAuMDQyOCA0Ljg2ODIgMC4xMzkxbDEuODUxIDIyLjI1NSA1Ljc2Ny0yMS41N2MzLjEwMjggMC4zNzQ0OSA2LjA2NjYgMC44NjY2NiA4Ljg5MTIgMS40NjU4bC0xMC41NSA0OS43NjNjLTEuOTI1OS0wLjQxNzI5LTMuNzAyLTAuNzA2MTctNS4zMTc2LTAuODc3MzYtMS40MjMtMC4xNDk3OS0zLjI2MzMtMC4yMjQ2OC01LjUxMDItMC4yMjQ2OC0yLjIzNjIgMC00LjIzNyAwLjEwNjk5LTUuOTgxIDAuMjk5NTgtMS45NDczIDAuMjI0NjktMy44NzMyIDAuNTU2MzYtNS43NjcgMC45OTUwNHoiIHN0eWxlPSJmaWxsOiNmNzNiNmM7Ii8+PHBhdGggZD0ibTkyLjQxMSAxNS4yNDdjMS45MTUyLTAuNDM4NjkgNC4wMjMtMC44NDUyNiA2LjMyMzMtMS4yMzA0IDIuMDY1LTAuMzQyMzggNC4xNTE0LTAuNjIwNTcgNi4yNjk4LTAuODQ1MjVsNS4xNzg1IDUwLjU2NWMtMS4wOTEzIDAuMTA2OTktMi4xODI3IDAuMjU2NzktMy4yOTU0IDAuNDM4NjgtMC44NjY2NSAwLjE0OTc5LTEuOTE1MiAwLjM2Mzc4LTMuMTM0OSAwLjY0MTk2eiIgc3R5bGU9ImZpbGw6I2RkMTA0ZjsiLz48cGF0aCBkPSJtOTcuNTYgMTA3Ljg0YTEwLjYzIDEwLjYzIDAgMCAxLTE1IDAuMTNsLTAuMTMtMC4xMyIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjYuM3B4O3N0cm9rZTojMDAwOyIvPjxwYXRoIGQ9Im0xNDguNTkgMTA3Ljg0YTEwLjYzIDEwLjYzIDAgMCAxLTE1IDAuMTNsLTAuMTMtMC4xMyIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjYuM3B4O3N0cm9rZTojMDAwOyIvPjxwYXRoIGQ9Im05NC4xOSAxMzYuODRoNDIuNjMyYTMuNzgwMSAzLjc4IDAgMCAxIDMuNzgwMiAzLjc4djMuMjJhMTUuMjMxIDE1LjIzIDAgMCAxLTE1LjIxMSAxNS4xNmgtMTkuNzgxYTE1LjI1MSAxNS4yNSAwIDAgMS0xNS4yMjEtMTUuMTZ2LTMuMjJhMy44MDAyIDMuOCAwIDAgMSAzLjc4MDItMy43OHoiIHN0eWxlPSJmaWxsOiNmZmY7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDozcHg7c3Ryb2tlOiMwMDA7Ii8+PHBhdGggZD0ibTEzMC45NiAxMzYuODR2MjEuMTZtLTMwLjkxMS0yMS4xNnYyMS4xNm0xMC4zNC0yMS4xNnYyMi4xNm0xMC4zMS0yMi4ydjIyLjIiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDozcHg7c3Ryb2tlOiMwMDA7Ii8+PC9zdmc+' alt="avatar" />
                                          </div>
                                          <div className="username">
                                              <h3>{contact.userName}</h3>
                                          </div>
                                          <div className="status">
                                            <Dot></Dot>
                                          </div>
                                      </div>
                                  )
                              })
                          }
                      </div>
                      <div className="current-user">
                      <div className="avatar">
                                              <img src={`data:image/svg+xml;base64,${currentUserImage}`} alt="avatar" />
                                          </div>
                                          <div className="username">
                                              <h2>{currentUserName}</h2>
                                          </div>
                      </div>
                  </Container>
              )
          }
      </>
  )
}


const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 75% 15%;
  overflow: hidden;
  background-color: #080420;
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
      height: 2rem;
    }
    h3 {
      color: white;
      text-transform: uppercase;
    }
  }
  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .contact {
      background-color: #ffffff34;
      min-height: 5rem;
      cursor: pointer;
      width: 90%;
      border-radius: 0.2rem;
      padding: 0.4rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.5s ease-in-out;
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
    .selected {
      background-color: #9a86f3;
    }
  }
  .current-user {
    background-color: #0d0d30;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    .avatar {
      img {
        height: 4rem;
        max-inline-size: 100%;
      }
    }
    .username {
      h2 {
        color: white;
        text-transform: capitalize;
      }
    }
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      gap: 0.5rem;
      .username {
        h2 {
          font-size: 1rem;
        }
      }
    }
  }
`;
const Dot = styled.div`
  height: 25px;
  width: 25px;
  background-color: green;
  border-radius: 50%;
  display: inline-block;
`;

